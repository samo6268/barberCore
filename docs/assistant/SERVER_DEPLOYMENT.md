# استقرار میمو داخلی روی سرور موجود پرنگارین

این راهنما برای سروری است که PostgreSQL، Redis، API، Web و Nginx آن قبلاً فعال شده‌اند. دستورات را با حساب `deploy` اجرا کنید. کلید API مدل لازم نیست.

## مک: اعمال پچ و Push

بعد از نصب پچ‌های 0001 تا 0004، پچ استقرار 0005 را اعمال کنید:

```bash
cd ~/Projects/barbercore
git apply --check ~/Downloads/0005-Mimo-Server-Deployment.patch &&
git am ~/Downloads/0005-Mimo-Server-Deployment.patch

git log -5 --oneline
git push origin feat/kavenegar-otp-integration
```

این Push فقط Commitها را ارسال می‌کند. فایل‌های `.env` نباید Stage یا Commit شوند. اگر دستور اعمال پچ خطا داد، قبل از Push توقف و خطا را بررسی کنید. شناسه Commit بعد از `git am` می‌تواند با نسخه تولیدکننده فرق کند؛ عنوان Commitها معیار بررسی است.

## سرور: دریافت کد

از سیستمی که کلید SSH معتبر دارد وارد سرور شوید. روی سرور:

```bash
cd /opt/parnegarin
git status --short
git fetch origin &&
git pull --ff-only origin feat/kavenegar-otp-integration

git log -5 --oneline
```

تغییرات قبلی در `infra/docker/api.Dockerfile`، `web.Dockerfile` و `docker-compose.yml` را پاک نکنید. این انتشار Dockerfileهای جداگانه دارد و Compose Override فقط مسیر Build، نام ایمیج، آرگومان‌های عمومی Build و متغیرهای دستیار را اضافه می‌کند. پورت‌ها، Volumeها و تنظیمات محیطی پایه حفظ می‌شوند. اگر Pull Conflict داد، توقف کنید؛ از `reset --hard` یا جایگزینی کامل Compose استفاده نکنید.

## اجرای استقرار

```bash
bash scripts/deploy-mimo.sh
```

اسکریپت:

1. وجود `.env`، دسترسی Docker و اعتبار Compose را بدون نمایش مقادیر محرمانه بررسی می‌کند.
2. تنظیمات محیطی، تغییرات محلی Git، Compose پایه و `pg_dump` را در پوشه خصوصی `~/parnegarin-backups/mimo-TIMESTAMP` ذخیره می‌کند.
3. از ایمیج‌های فعلی API و Web تگ جداگانه برای Rollback می‌سازد.
4. ایمیج‌های جدید را در حالی می‌سازد که کانتینرهای قبلی در حال سرویس‌دهی هستند.
5. بعد از Build موفق، فقط API و Web را جایگزین می‌کند. در این مرحله وقفه کوتاهی محتمل است.
6. وضعیت سلامت دو کانتینر و یک گفتگوی آزمایشی با موتور داخلی و Redis را بررسی می‌کند.
7. در صورت شکست پس از جایگزینی، دستور دقیق بازگشت به ایمیج‌های قبلی را نمایش می‌دهد؛ پایگاه داده را خودکار Restore نمی‌کند.

Seed، Migration، پاک‌کردن Volume یا `docker compose down` اجرا نمی‌شود.

این محیط تولید پچ موتور Docker ندارد؛ بیلد واقعی ایمیج‌ها و Smoke Test استقرار روی خود سرور انجام می‌شوند. انتخاب Workspaceها و آرگومان‌های Build به‌صورت جداگانه بررسی شده‌اند.

## بررسی از مسیر Nginx

```bash
curl -fsS --max-time 10 http://127.0.0.1/api/v1/assistant/status
```

در `data` انتظار داریم:

```json
{
  "ready": true,
  "provider": "internal-knowledge",
  "mode": "read-only",
  "privateDataRequiresLogin": true,
  "externalModel": false,
  "requiresModelKey": false
}
```

همین مسیر را روی دامنه یا IP عمومی سامانه هم بررسی کنید و صفحه را با `Cmd+Shift+R` تازه کنید. یک گفتگوی جدید بسازید و بپرسید «چطور نوبت بگیرم؟». سپس جست‌وجوی سالن با شهر و خدمت موجود در داده واقعی سرور را امتحان کنید.

اگر مسیر Nginx خطا داد، ابتدا مستقیم API را بررسی کنید:

```bash
curl -fsS --max-time 10 http://127.0.0.1:4000/api/v1/assistant/status
```

اگر API_PORT سرور را تغییر داده‌اید، پورت همان تنظیم را استفاده کنید. آماده‌بودن موتور داخلی به معنی صحت Routing عمومی Nginx نیست.

## لاگ‌های خطا

```bash
docker compose --env-file .env \
  -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.assistant.yml \
  --profile full logs --tail=80 api web
```

فایل `.env` و خروجی کامل `docker compose config` را برای بررسی ارسال نکنید؛ این خروجی ممکن است رمزها را نمایش دهد.

## نکات Build

- آدرس API فرانت‌اند در زمان Build تزریق می‌شود؛ تغییر صرف Environment زمان اجرا، JavaScript ساخته‌شده را عوض نمی‌کند.
- پکیج‌های assistant-core، assistant-react و assistant-web-component در Workspace نصب می‌شوند.
- Prisma Client قبل از Build API ساخته می‌شود و مسیر اجرا `dist/src/main.js` است.
- فایل‌های عمومی و Static در مسیر واقعی Standalone مونوریپو قرار می‌گیرند.
- `.dockerignore` از ورود فایل‌های محیطی، node_modules مک و Buildهای قبلی به Context جلوگیری می‌کند.
- Dockerfileهای این انتشار از Node 22 استفاده می‌کنند. برای Build، سرور باید به Registry ایمیج و بسته‌ها دسترسی داشته باشد.

## آزمون ترتیب استقرار بدون Docker واقعی

```bash
python3 -B -m unittest discover -s scripts/tests -p test_deploy_mimo.py
```

این تست‌ها با دستورهای شبیه‌سازی‌شده، توقف پیش از جایگزینی در شکست Build یا بکاپ، و نمایش دستور Rollback در شکست Health Check را بررسی می‌کنند. جایگزین Build واقعی ایمیج نیستند.
