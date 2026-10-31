import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { ConfigService } from '@nestjs/config';
import { ResponsesAssistantProvider } from './responses.provider';

describe('Responses HTTP wire contract (local provider stub, no paid requests)', () => {
  let server: Server;
  let origin: string;
  const bodies: any[] = [];
  beforeAll(async () => {
    server = createServer((req, res) => {
      let raw = '';
      req.on('data', (chunk) => (raw += chunk));
      req.on('end', () => {
        bodies.push(JSON.parse(raw));
        expect(req.url).toBe('/v1/responses');
        expect(req.headers.authorization).toBe('Bearer local-test-key');
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify(
            bodies.length === 1
              ? {
                  status: 'completed',
                  output: [
                    {
                      type: 'function_call',
                      name: 'read_data',
                      call_id: 'call-real-http',
                      arguments: '{"query":"تهران"}',
                    },
                  ],
                }
              : {
                  status: 'completed',
                  output: [
                    {
                      type: 'message',
                      content: [{ type: 'output_text', text: 'پاسخ از داده زنده آزمایشی' }],
                    },
                  ],
                },
          ),
        );
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`;
  });
  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
  });
  it('completes an actual HTTP function-call cycle', async () => {
    const provider = new ResponsesAssistantProvider(
      new ConfigService({
        ASSISTANT_API_KEY: 'local-test-key',
        ASSISTANT_MODEL: 'configured-model',
        ASSISTANT_API_BASE_URL: origin,
      }),
    );
    const executeTool = jest.fn().mockResolvedValue({ data: { city: 'تهران', count: 2 } });
    const result = await provider.respond({
      instructions: 'test',
      history: [{ role: 'user', content: 'دو سالن' }],
      tools: [],
      executeTool,
    });
    expect(result.content).toContain('داده زنده');
    expect(executeTool).toHaveBeenCalledWith('read_data', { query: 'تهران' });
    expect(bodies).toHaveLength(2);
    expect(bodies[0].store).toBe(false);
    expect(bodies[1].input.at(-1)).toMatchObject({
      type: 'function_call_output',
      call_id: 'call-real-http',
    });
  });
});
