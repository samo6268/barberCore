/** Deterministic normalization; no model, embedding service or network dependency. */
export function normalizePersian(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/ي|ى/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u200c\u200d]/g, ' ')
    .replace(/[^\p{L}\p{N}/\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/پنج شنبه/g, 'پنجشنبه')
    .replace(/چهار شنبه/g, 'چهارشنبه')
    .replace(/دو شنبه/g, 'دوشنبه')
    .replace(/یک شنبه/g, 'یکشنبه')
    .trim();
}
export function hasPhrase(text: string, phrase: string): boolean {
  return ` ${normalizePersian(text)} `.includes(` ${normalizePersian(phrase)} `);
}
const stopWords = new Set(
  'من تو شما به از در را رو و یا با که این اون آن یک می خواهم میخوام می شود میشه هست است لطفا لطفاً چطور چگونه کجا کنم کن بده بگو نشان نشون برای درباره همین هم سلام'.split(
    ' ',
  ),
);
export function meaningfulWords(value: string) {
  return [
    ...new Set(
      normalizePersian(value)
        .split(' ')
        .filter((word) => word.length > 1 && !stopWords.has(word)),
    ),
  ];
}
