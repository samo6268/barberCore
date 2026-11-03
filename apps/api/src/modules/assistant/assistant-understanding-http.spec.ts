import { createServer, type Server } from 'http';
import { AddressInfo } from 'net';
import { ConfigService } from '@nestjs/config';
import { AssistantUnderstandingService } from './assistant-understanding.service';

describe('Native Ollama HTTP contract without external inference', () => {
  let server: Server;
  let received: { url?: string; body?: any };
  beforeAll(async () => {
    server = createServer((req, res) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        received = { url: req.url, body: JSON.parse(body) };
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: { role: 'assistant', content: JSON.stringify({
          action: 'search', articleIds: [], workflowId: '', city: 'تهران', service: 'کوتاهی', choice: 0, date: '', gender: '',
        }), tool_calls: [{ function: { name: 'delete_booking', arguments: {} } }] }, done: true }));
      });
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  });
  afterAll(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });
  it('sends only a bounded classification request to the configured private native endpoint', async () => {
    const executeTool = jest.fn();
    const service = new AssistantUnderstandingService(new ConfigService({
      ASSISTANT_REASONING_MODE: 'ollama',
      ASSISTANT_OLLAMA_URL: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    }));
    const result = await service.plan({
      history: [{ role: 'user', content: 'در تهران موهام رو کجا کوتاه کنم؟' }],
      instructions: '', tools: [], executeTool,
    }, [], []);
    expect(result?.city).toBe('تهران');
    expect(received.url).toBe('/api/chat');
    expect(received.body).not.toHaveProperty('tools');
    expect(received.body.format).toHaveProperty('type', 'object');
    expect(service.status().localModelState).toBe('available');
    expect(executeTool).not.toHaveBeenCalled();
  });
});
