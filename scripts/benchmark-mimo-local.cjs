// Run from the API container, with this file on stdin. No host Node installation.
// Only synthetic questions and native Ollama inference; no database/domain writes.
const path = require('node:path');
const axios = require('axios');
const { ConfigService } = require('@nestjs/config');
const root = path.join(process.cwd(), 'dist/src/modules/assistant');
const { AssistantBusinessService } = require(path.join(root, 'assistant-business.service'));
const { AssistantWorkflowService } = require(path.join(root, 'assistant-workflow.service'));
const { AssistantUnderstandingService } = require(path.join(root, 'assistant-understanding.service'));
const model = process.env.MIMO_TEST_MODEL || 'qwen3:1.7b';
const url = process.env.MIMO_TEST_URL || 'http://ollama:11434';
const config = new ConfigService({ ASSISTANT_REASONING_MODE: 'ollama',
  ASSISTANT_OLLAMA_URL: url, ASSISTANT_OLLAMA_MODEL: model,
  ASSISTANT_OLLAMA_TIMEOUT_MS: 30000 });
// Validate the endpoint/model restrictions before making any network request.
new AssistantUnderstandingService(config);
const businesses = new AssistantBusinessService(config);
const articles = businesses.get('parnegarin').knowledge.map(({ id, title }) => ({ id, title }));
const workflows = new AssistantWorkflowService(businesses).catalog('parnegarin');
let stats;
const interceptor = axios.interceptors.response.use(response => {
  if (response.config.url.endsWith('/api/chat')) {
    const d = response.data;
    stats = { promptTokens: d.prompt_eval_count, generatedTokens: d.eval_count,
      doneReason: d.done_reason, loadSeconds: (d.load_duration || 0) / 1e9 };
  }
  return response;
});
const tests = [
  { text: 'تهران هستم، موهام رو کجا کوتاه کنم؟', expected: { action: 'search', city: 'تهران', service: 'کوتاهی', date: '', choice: 0, gender: '' } },
  { text: 'تهران هستم، موهام رو کجا کوتاه کنم؟', expected: { action: 'search', city: 'تهران', service: 'کوتاهی', date: '', choice: 0, gender: '' } },
  { text: 'اگه نتونم برم، چجوری نوبتم رو کنسل کنم؟', expected: { action: 'knowledge' }, article: 'cancellation' },
  { text: 'نوبت های خودم رو نشون بده', expected: { action: 'mine', choice: 0, date: '' } },
];
(async () => {
  const warmStart = Date.now();
  await axios.post(url + '/api/generate', { model, keep_alive: '10m' },
    { timeout: 120000, maxRedirects: 0, proxy: false });
  console.log(JSON.stringify({ warmupSeconds: (Date.now() - warmStart) / 1000, model }));
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const engine = new AssistantUnderstandingService(config);
    stats = undefined;
    const start = Date.now();
    const plan = await engine.plan({ businessId: 'parnegarin', instructions: '', tools: [],
      page: { route: '/salons' }, history: [{ role: 'user', content: test.text }],
      executeTool: async () => { throw Error('Domain tools disabled in inference benchmark'); },
    }, articles, workflows);
    const expectedMatched = !!plan && Object.entries(test.expected).every(([key, value]) => plan[key] === value)
      && (!test.article || plan.articleIds.includes(test.article));
    if (!expectedMatched) process.exitCode = 1;
    console.log(JSON.stringify({ test: i + 1, question: test.text,
      seconds: (Date.now() - start) / 1000, valid: !!plan, expectedMatched,
      diagnostics: engine.status(), metrics: stats, plan: plan || null }, null, 2));
  }
})().catch(error => {
  console.error(JSON.stringify({ error: 'Inference benchmark failed', code: error.code, httpStatus: error.response?.status }));
  process.exitCode = 1;
}).finally(() => axios.interceptors.response.eject(interceptor));
