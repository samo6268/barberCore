import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AssistantUnderstandingService } from './assistant-understanding.service';
import type { ModelRequest } from './assistant.types';
jest.mock('axios');
const post = axios.post as jest.Mock;
const basePlan = { action: 'search', articleIds: [], workflowId: '', city: 'تهران', service: 'کوتاهی', choice: 0, date: '', gender: '' };
const req: ModelRequest = {
  businessId: 'parnegarin', instructions: '', tools: [], page: { route: '/salons' },
  actor: { id: 'private-user-id', role: 'CUSTOMER' },
  history: [{ role: 'user', content: 'تهران هستم، موهام رو کجا کوتاه کنم؟' }],
  executeTool: jest.fn(),
};
const service = (values = {}) => new AssistantUnderstandingService(new ConfigService({ ASSISTANT_REASONING_MODE: 'ollama', ...values }));
describe('Independent local request understanding', () => {
  beforeEach(() => post.mockReset());
  it('never calls a model in rules mode', async () => {
    const internal = new AssistantUnderstandingService(new ConfigService());
    expect(await internal.plan(req, [], [])).toBeUndefined();
    expect(post).not.toHaveBeenCalled();
  });
  it('uses the native private Ollama API and a constrained JSON schema', async () => {
    post.mockResolvedValueOnce({ data: { message: { content: JSON.stringify(basePlan) } } });
    expect(await service().plan(req, [], [])).toEqual(basePlan);
    const [url, body, config] = post.mock.calls[0];
    expect(url).toBe('http://ollama:11434/api/chat');
    expect(body.format.additionalProperties).toBe(false);
    expect(body.stream).toBe(false);
    expect(config.maxRedirects).toBe(0);
    expect(JSON.stringify(body)).not.toContain('private-user-id');
    expect(req.executeTool).not.toHaveBeenCalled();
  });
  it('rejects public providers and cloud model tags', () => {
    expect(() => service({ ASSISTANT_OLLAMA_URL: 'https://api.openai.com' })).toThrow('private');
    expect(() => service({ ASSISTANT_OLLAMA_URL: 'https://models.example.com' })).toThrow('private');
    expect(() => service({ ASSISTANT_OLLAMA_MODEL: 'some-model:cloud' })).toThrow('cloud');
    expect(() => service({ ASSISTANT_OLLAMA_URL: 'http://user:secret@localhost:11434' })).toThrow('private');
  });
  it.each([
    { ...basePlan, action: 'delete_booking' },
    { ...basePlan, articleIds: ['fictional-policy'] },
    { ...basePlan, city: 'شیراز' },
    { ...basePlan, date: '2035-01-01' },
    { ...basePlan, choice: 99 },
    { ...basePlan, workflowId: 'execute_payment' },
  ])('rejects invented plan fields instead of presenting model claims', async invalid => {
    post.mockResolvedValueOnce({ data: { message: { content: JSON.stringify(invalid) } } });
    expect(await service().plan(req, [], [])).toBeUndefined();
  });
  it('falls back and opens a circuit on unavailable inference', async () => {
    const local = service();
    post.mockRejectedValueOnce(new Error('private prompt must not be logged'));
    expect(await local.plan(req, [], [])).toBeUndefined();
    expect(await local.plan(req, [], [])).toBeUndefined();
    expect(post).toHaveBeenCalledTimes(1);
    expect(local.status().modelCircuitOpen).toBe(true);
  });
  it('redacts phone and email from the inference payload', async () => {
    post.mockResolvedValueOnce({ data: { message: { content: JSON.stringify({ ...basePlan, city: '' }) } } });
    await service().plan({ ...req, history: [{ role: 'user', content: '۰۹۱۲۱۲۳۴۵۶۷ person@example.com رمز:my-sensitive-password' }] }, [], []);
    const payload = JSON.stringify(post.mock.calls[0][1]);
    expect(payload).not.toContain('09121234567');
    expect(payload).not.toContain('person@example.com');
    expect(payload).not.toContain('my-sensitive-password');
  });
});
