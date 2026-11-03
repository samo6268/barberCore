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
    post.mockResolvedValueOnce({ data: { message: { content: JSON.stringify({ action: 'search' }) } } });
    expect(await service().plan(req, [], [])).toEqual(basePlan);
    const [url, body, config] = post.mock.calls[0];
    expect(url).toBe('http://ollama:11434/api/chat');
    expect(body.format.additionalProperties).toBe(false);
    expect(body.format.required).toEqual(['action']);
    expect(body.format.properties).not.toHaveProperty('service');
    expect(body.format.properties).not.toHaveProperty('date');
    expect(body.options.num_predict).toBe(96);
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
    post.mockResolvedValueOnce({ data: { message: { content: JSON.stringify({ action: 'search' }) } } });
    await service().plan({ ...req, history: [{ role: 'user', content: '۰۹۱۲۱۲۳۴۵۶۷ person@example.com رمز:my-sensitive-password' }] }, [], []);
    const payload = JSON.stringify(post.mock.calls[0][1]);
    expect(payload).not.toContain('09121234567');
    expect(payload).not.toContain('person@example.com');
    expect(payload).not.toContain('my-sensitive-password');
  });
  it('rejects the real observed model response instead of trusting its invented service/date/choice', async () => {
    post.mockResolvedValueOnce({ data: { message: { content: JSON.stringify({
      action: 'search', articleIds: ['search'], workflowId: 'search', city: 'تهران',
      service: 'پوست', choice: 1, date: 'today', gender: 'ALL',
    }) } } });
    const local = service();
    expect(await local.plan(req, [{ id: 'search', title: 'جستجو' }], [{ id: 'search', title: 'جستجو' }])).toBeUndefined();
    expect(local.status().lastModelFailure).toBe('invalid-plan');
  });
  it('binds article and workflow identifiers to the registered schema and strips irrelevant selections', async () => {
    post.mockResolvedValueOnce({ data: { message: { content: JSON.stringify({ action: 'search', articleIds: ['intro'], workflowId: 'booking' }) } } });
    const result = await service().plan(req, [{ id: 'intro', title: 'معرفی' }], [{ id: 'booking', title: 'رزرو' }]);
    expect(result).toEqual(basePlan);
    const schema = post.mock.calls[0][1].format;
    expect(schema.properties.articleIds.items.enum).toEqual(['intro']);
    expect(schema.properties.workflowId.enum).toEqual(['', 'booking']);
  });
  it('preserves explicit follow-up values and never creates a new date or choice', async () => {
    post.mockResolvedValue({ data: { message: { content: '{"action":"availability"}' } } });
    const result = await service().plan({ ...req,
      state: { city: 'تهران', service: 'کوتاهی', choices: [{ id: 'a', name: 'اول' }, { id: 'b', name: 'دوم' }] },
      history: [{ role: 'user', content: 'برای گزینه دوم فردا وقت خالی هست؟' }],
    }, [], []);
    expect(result).toMatchObject({ city: 'تهران', service: 'کوتاهی', choice: 2, date: 'tomorrow', gender: '' });
  });
  it('turns ambiguous data queries into clarification', async () => {
    post.mockResolvedValue({ data: { message: { content: '{"action":"search"}' } } });
    expect(await service().plan({ ...req, history: [{ role: 'user', content: 'تهران یا کرج برای کوتاهی کجا برم؟' }] }, [], [])).toMatchObject({ action: 'clarify' });
  });
  it.each([
    [{ message: { content: '{"action":"search"}' }, done_reason: 'length' }, 'truncated'],
    [{ message: { content: '{"action":' } }, 'invalid-json'],
    [{ message: { content: '{"action":"knowledge"}' } }, 'invalid-plan'],
  ])('distinguishes rejected model output without logging prompts', async (data, failure) => {
    post.mockResolvedValueOnce({ data });
    const local = service();
    expect(await local.plan(req, [], [])).toBeUndefined();
    expect(local.status().lastModelFailure).toBe(failure);
  });
  it('reports deadline failures separately from transport failures', async () => {
    post.mockRejectedValueOnce(Object.assign(new Error('private'), { code: 'ECONNABORTED' }));
    const local = service();
    await local.plan(req, [], []);
    expect(local.status().lastModelFailure).toBe('timeout');
    expect(local.status().lastModelDurationMs).toEqual(expect.any(Number));
  });
});
