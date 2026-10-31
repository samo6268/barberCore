import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { ResponsesAssistantProvider } from './responses.provider';
import type { ModelRequest } from '../assistant.types';
jest.mock('axios');
const post = axios.post as jest.Mock;
const request = (): ModelRequest => ({
  instructions: 'trusted policy',
  history: [{ role: 'user', content: 'test' }],
  tools: [],
  executeTool: jest
    .fn()
    .mockResolvedValue({ data: { salons: [] }, sources: [{ title: 'سالن', url: '/salons' }] }),
});
const final = {
  data: {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: 'پاسخ نهایی' }] }],
  },
};
describe('Responses model adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const provider = () =>
    new ResponsesAssistantProvider(
      new ConfigService({ ASSISTANT_API_KEY: 'test-secret', ASSISTANT_MODEL: 'test-model' }),
    );
  it('posts the right Responses shape with storage disabled and executes server tools', async () => {
    post
      .mockResolvedValueOnce({
        data: {
          status: 'completed',
          output: [
            { type: 'function_call', name: 'search_salons', call_id: 'call-1', arguments: '{}' },
          ],
        },
      })
      .mockResolvedValueOnce(final);
    const input = request(),
      result = await provider().respond(input);
    expect(input.executeTool).toHaveBeenCalledWith('search_salons', {});
    expect(result.content).toBe('پاسخ نهایی');
    expect(result.citations?.[0].url).toBe('/salons');
    expect(post.mock.calls[0][1]).toMatchObject({
      model: 'test-model',
      store: false,
      parallel_tool_calls: false,
    });
    expect(post.mock.calls[1][1].input).toContainEqual({
      type: 'function_call_output',
      call_id: 'call-1',
      output: JSON.stringify({ salons: [] }),
    });
  });
  it('never executes malformed tool arguments', async () => {
    post
      .mockResolvedValueOnce({
        data: {
          status: 'completed',
          output: [
            {
              type: 'function_call',
              name: 'search_salons',
              call_id: 'c',
              arguments: 'invalid JSON',
            },
          ],
        },
      })
      .mockResolvedValueOnce(final);
    const input = request();
    await provider().respond(input);
    expect(input.executeTool).not.toHaveBeenCalled();
    expect(post.mock.calls[1][1].input.at(-1).output).toContain('error');
  });
  it('bounds repeated model tool calls', async () => {
    post.mockResolvedValue({
      data: {
        status: 'completed',
        output: [{ type: 'function_call', name: 'search_salons', call_id: 'c', arguments: '{}' }],
      },
    });
    const input = request();
    await expect(provider().respond(input)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(input.executeTool).toHaveBeenCalledTimes(4);
    expect(post).toHaveBeenCalledTimes(5);
    expect(post.mock.calls[4][1].tool_choice).toBe('none');
  });
  it('does not invent a successful answer on incomplete or empty responses', async () => {
    post.mockResolvedValueOnce({ data: { status: 'incomplete', output: [] } });
    await expect(provider().respond(request())).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
  it('refuses missing credentials without a paid API call', async () => {
    const p = new ResponsesAssistantProvider(new ConfigService());
    expect(p.isReady()).toBe(false);
    await expect(p.respond(request())).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(post).not.toHaveBeenCalled();
  });
});
