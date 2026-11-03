import { groundAssistantSlots, isExplicitSalonDiscovery, matchAssistantService } from './assistant-grounding';
import type { ModelRequest } from './assistant.types';

function request(text: string, state?: ModelRequest['state']): ModelRequest {
  return { history: [{ role: 'user', content: text }], state, instructions: '', tools: [], executeTool: jest.fn(), page: { route: '/salons' } };
}
describe('User-grounded query values', () => {
  it('extracts the production example without inventing skin care, today or a selection', () => {
    expect(groundAssistantSlots(request('تهران هستم، موهام رو کجا کوتاه کنم؟'))).toEqual({
      city: 'تهران', service: 'کوتاهی', date: '', choice: 0, gender: '', ambiguous: false,
    });
  });
  it.each(['موهامو کوتاه کنم', 'موهایم را کوتاه کنم', 'کوتاهی مو', 'haircut'])('recognizes explicit haircut phrasing: %s', text => {
    expect(matchAssistantService(text).value).toBe('کوتاهی');
  });
  it('does not confuse a short appointment with a haircut', () => {
    expect(matchAssistantService('یک وقت کوتاه میخوام').value).toBe('');
  });
  it('treats negation, multiple cities and multiple services conservatively', () => {
    for (const text of ['تهران نه کرج', 'کوتاهی نمیخوام', 'رنگ یا کوتاهی', 'زنانه نباشه', 'امروز نه فردا']) {
      expect(groundAssistantSlots(request(text)).ambiguous).toBe(true);
    }
  });
  it('resolves specific child services without false multi-service ambiguity', () => {
    expect(matchAssistantService('فیشال پوست')).toEqual({ value: 'فیشال', ambiguous: false });
    expect(matchAssistantService('ژلیش ناخن')).toEqual({ value: 'ژلیش', ambiguous: false });
  });
  it('uses registered prior city/service for a follow-up, never assistant prose', () => {
    expect(groundAssistantSlots(request('وقت خالی داره؟', { city: 'تهران', service: 'ماساژ' }))).toMatchObject({ city: 'تهران', service: 'ماساژ', date: '', choice: 0 });
    const r = request('قیمتش چنده؟');
    r.history.unshift({ role: 'assistant', content: 'شیراز، پوست، امروز، گزینه اول' });
    expect(groundAssistantSlots(r)).toMatchObject({ city: '', service: '', date: '', choice: 0 });
  });
  it('requires an explicit ordinal and a real option list', () => {
    const state = { choices: [{ id: 'a', name: 'مرکز یک' }, { id: 'b', name: 'مرکز دو' }] };
    expect(groundAssistantSlots(request('اولین وقت', state))).toMatchObject({ choice: 0, date: 'nearest' });
    expect(groundAssistantSlots(request('گزینه دوم', state)).choice).toBe(2);
    expect(groundAssistantSlots(request('۲', state)).choice).toBe(2);
    expect(groundAssistantSlots(request('گزینه پنجم', state)).choice).toBe(0);
    expect(groundAssistantSlots(request('گزینه اول')).choice).toBe(0);
    expect(groundAssistantSlots(request('گزینه اول و دوم', state)).choice).toBe(0);
  });
  it('only clears gender on an explicit request, not an unspecified preference', () => {
    expect(groundAssistantSlots(request('کوتاهی', { gender: 'FEMALE' })).gender).toBe('');
    expect(groundAssistantSlots(request('همه سالن ها')).gender).toBe('ALL');
    expect(groundAssistantSlots(request('سالن عمومی')).gender).toBe('UNISEX');
  });
  it('keeps unsupported temporal expressions for the calendar layer rather than inventing today/tomorrow', () => {
    expect(groundAssistantSlots(request('پس فردا')).date).toBe('');
    expect(groundAssistantSlots(request('امروز')).date).toBe('today');
    expect(groundAssistantSlots(request('۱۴۰۵/۸/۱۸')).date).toBe('');
    expect(groundAssistantSlots(request('2026-11-09')).date).toBe('2026-11-09');
  });
  it('does not fast-route private, help or appointment-time questions as salon discovery', () => {
    expect(isExplicitSalonDiscovery(request('موهام رو تهران کجا کوتاه کنم؟'))).toBe(true);
    for (const text of ['نوبتم رو کجا لغو کنم؟', 'چطور تو تهران سالن پیدا کنم؟', 'نوبت بعدی من کجا است؟', 'تهران کجا وقت خالی هست؟'])
      expect(isExplicitSalonDiscovery(request(text))).toBe(false);
  });
});
