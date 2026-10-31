#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { readFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (!process.stdin.isTTY) {
  console.error('این دستور را مستقیم در Terminal تعاملی اجرا کنید.');
  process.exit(1);
}
let hidden = false;
const output = new Writable({
  write(chunk, _encoding, done) {
    if (!hidden) process.stdout.write(chunk);
    done();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: true });
rl.on('SIGINT', () => {
  rl.close();
  process.stdout.write('\nتنظیمات تغییر نکرد.\n');
  process.exit(0);
});
const paths = [resolve(root, '.env'), resolve(root, 'apps/api/.env')];
try {
  console.log('اتصال مدل میمو — کلید فقط روی سیستم شما ذخیره می‌شود.');
  console.log(
    'ارائه‌دهنده باید Responses API را پشتیبانی کند. اشتراک ChatGPT جای اعتبار API نیست.',
  );
  process.stdout.write('کلید API (هنگام ورود نمایش داده نمی‌شود): ');
  hidden = true;
  const apiKey = (await rl.question('')).trim();
  hidden = false;
  process.stdout.write('\n');
  if (!apiKey || /[\r\n]/.test(apiKey)) throw new Error('کلید خالی یا نامعتبر است.');
  const model = (await rl.question('نام مدل [gpt-5.6-terra]: ')).trim() || 'gpt-5.6-terra';
  const base =
    (await rl.question('آدرس API [https://api.openai.com/v1]: ')).trim() ||
    'https://api.openai.com/v1';
  const url = new URL(base);
  if (
    url.protocol !== 'https:' &&
    !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
  )
    throw new Error('آدرس مدل باید HTTPS باشد.');
  const existing = paths.find((p) => existsSync(p));
  if (!existing) throw new Error('ابتدا فایل .env پروژه را با تنظیمات دیتابیس و JWT آماده کنید.');
  const fallback = readFileSync(existing, 'utf8');
  const settings = {
    ASSISTANT_API_KEY: apiKey,
    ASSISTANT_MODEL: model,
    ASSISTANT_API_BASE_URL: base.replace(/\/$/, ''),
    ASSISTANT_DAILY_TURN_LIMIT: '60',
    ASSISTANT_PRICE_UNIT: 'IRR',
  };
  const contents = paths.map((path) => {
    let body = existsSync(path) ? readFileSync(path, 'utf8') : fallback;
    body = body
      .split(/\r?\n/)
      .filter(
        (line) =>
          !Object.keys(settings).some((key) =>
            new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`).test(line),
          ),
      )
      .join('\n')
      .trimEnd();
    return (
      body +
      '\n\n# Mimo model connection (server-only)\n' +
      Object.entries(settings)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join('\n') +
      '\n'
    );
  });
  paths.forEach((path, index) => {
    writeFileSync(path, contents[index], { mode: 0o600 });
    chmodSync(path, 0o600);
  });
  console.log('تنظیمات در .env و apps/api/.env ذخیره شد؛ API را دوباره اجرا کنید.');
  console.log('هیچ کلیدی نمایش داده نشد و هیچ تماس پولی با مدل انجام نشد.');
} catch (error) {
  hidden = false;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  rl.close();
}
