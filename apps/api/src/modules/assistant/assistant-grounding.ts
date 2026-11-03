import { IRAN_CITY_NAMES } from './iran-city-names';
import { hasPhrase, normalizePersian } from './persian-text';
import type { ModelRequest } from './assistant.types';

// Values used in domain queries come from user text or previously verified state,
// never from an unconstrained language-model guess.
const serviceAliases = [
  ['فیشال', ['فیشال']], ['ژلیش', ['ژلیش']],
  ['پاکسازی', ['پاکسازی', 'پاک سازی']],
  ['کوتاهی', ['کوتاهی', 'کوتاه کردن مو', 'haircut']],
  ['رنگ', ['رنگ', 'لایت', 'هایلایت', 'مش مو']],
  ['ناخن', ['ناخن', 'مانیکور', 'پدیکور']],
  ['پوست', ['پوست']], ['اصلاح', ['اصلاح', 'ریش']],
  ['میکاپ', ['میکاپ', 'ارایش عروس', 'آرایش عروس']],
  ['ماساژ', ['ماساژ', 'massage']], ['اسپا', ['اسپا', 'spa']],
] as const;
const cities = IRAN_CITY_NAMES.map(value => ({ value, normalized: normalizePersian(value) }));
const negative = /(?:^|\s)(?:نه|نمیخوام|نمی خوام|نمی خواهم|نمی تونم|نمی توانم|نباشه)(?:\s|$)/;

export function matchAssistantService(input: string): { value: string; ambiguous: boolean } {
  const text = normalizePersian(input);
  let matches = serviceAliases.filter(([, aliases]) => aliases.some(alias => hasPhrase(text, alias))).map(([value]) => value as string);
  if (hasPhrase(text, 'کوتاه') && text.split(' ').some(word => /^مو(?:هام|هامو|هایم|یم|ی)?$/.test(word))) matches.push('کوتاهی');
  matches = [...new Set(matches)];
  if (matches.some(value => ['فیشال', 'پاکسازی'].includes(value))) matches = matches.filter(value => value !== 'پوست');
  if (matches.includes('ژلیش')) matches = matches.filter(value => value !== 'ناخن');
  const ambiguous = matches.length > 1 || (matches.length > 0 && negative.test(text));
  return { value: ambiguous ? '' : matches[0] || '', ambiguous };
}

export interface GroundedSlots {
  city: string; service: string; date: string; choice: number;
  gender: '' | 'MALE' | 'FEMALE' | 'UNISEX' | 'ALL';
  ambiguous: boolean;
}

export function groundAssistantSlots(request: ModelRequest): GroundedSlots {
  const text = normalizePersian(request.history.filter(message => message.role === 'user').slice(-1)[0]?.content || '');
  const mentionedCities = [...new Set(cities.filter(city => hasPhrase(text, city.normalized)).map(city => city.value))];
  const cityAmbiguous = mentionedCities.length > 1 || (mentionedCities.length > 0 && negative.test(text));
  const savedCity = cities.find(city => city.value === request.state?.city)?.value || '';
  const service = matchAssistantService(text);
  const savedService = serviceAliases.find(([value]) => value === request.state?.service)?.[0] || '';
  let date = '';
  const literal = text.match(/(?:^|\s)(\d{4}-\d{2}-\d{2})(?:\s|$)/)?.[1];
  if (literal && Number(literal.slice(0, 4)) >= 1900) date = literal;
  else if (!/پس فردا|دیروز|پریروز|هفته|ماه|سال/.test(text)) {
    if (hasPhrase(text, 'فردا')) date = 'tomorrow';
    else if (hasPhrase(text, 'امروز')) date = 'today';
    else if (/اولین وقت|اولین زمان|زودترین|نزدیک ترین وقت/.test(text)) date = 'nearest';
  }
  const dateAmbiguous = !!date && (negative.test(text) || (hasPhrase(text, 'امروز') && hasPhrase(text, 'فردا')));
  const female = /زنانه|بانوان/.test(text), male = /مردانه|آقایان|اقایان/.test(text);
  const unisex = /مختلط|عمومی/.test(text);
  const all = /همه سالن|همه مراکز|هر دو جنسیت|جنسیت.*(?:فرقی ندارد|فرقی نداره|مهم نیست)/.test(text) || (female && male);
  const genderAmbiguous = (female || male || unisex || all) && negative.test(text);
  const gender: GroundedSlots['gender'] = genderAmbiguous ? '' : all ? 'ALL' : unisex ? 'UNISEX' : female ? 'FEMALE' : male ? 'MALE' : '';
  const options = request.state?.pending === 'service' ? request.state.serviceChoices : request.state?.choices;
  let choice = 0;
  let choiceAmbiguous = false;
  const ordinal = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم'];
  if (options?.length && !negative.test(text) && !/اولین وقت|اولین زمان|زودترین/.test(text)) {
    const exact = text.match(/^(?:(?:گزینه|سالن|خدمت|شماره)\s*)?([1-5])$/);
    const indexes = ordinal.map((word, index) => (/گزینه|مورد/.test(text) && (hasPhrase(text, word) || hasPhrase(text, word + 'ی')))
      || hasPhrase(text, `گزینه ${index + 1}`) || new RegExp(`^(?:همون |همان )?${word}ی?(?: رو| را)?$`).test(text) ? index + 1 : 0).filter(Boolean);
    const selected = exact ? Number(exact[1]) : indexes.length === 1 ? indexes[0] : 0;
    if (selected <= options.length) choice = selected;
    choiceAmbiguous = indexes.length > 1 || selected > options.length;
  }
  return {
    city: cityAmbiguous ? '' : mentionedCities[0] || savedCity,
    service: service.ambiguous ? '' : service.value || savedService,
    date: dateAmbiguous ? '' : date, choice, gender,
    ambiguous: cityAmbiguous || service.ambiguous || genderAmbiguous || dateAmbiguous || choiceAmbiguous,
  };
}

export function isExplicitSalonDiscovery(request: ModelRequest) {
  const text = normalizePersian(request.history.filter(message => message.role === 'user').slice(-1)[0]?.content || '');
  return /کجا|دنبال|پیدا کن|پیدا کنم|می گردم|میگردم|معرفی کن|جستجو/.test(text)
    && !/لغو|کنسل|نوبتم|نوبت های من|رزروهام|نوبت هام|نوبت بعدی|نوبت.*(?:دارم|داشتم|خودم)|رزرو.*(?:دارم|داشتم|خودم)|گزارش|درآمد|چطور|چگونه|مقایسه|قیمت|هزینه|ساعت|وقت خالی|زمان آزاد|وقت آزاد|چه زمان/.test(text)
    && !request.state?.pending && !/^\/staff(?:\/|$)|^\/dashboard(?:\/|$)/.test(request.page?.route || '');
}
