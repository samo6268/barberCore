'use client';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { HttpAssistantTransport, type AssistantManifest } from '@adaptive-assistant/core';
import { AssistantProvider, MimoAssistant } from '@adaptive-assistant/react';

const manifest: AssistantManifest = {
  assistantId: 'parnegarin-admin', businessId: 'parnegarin-admin',
  name: 'راهنمای مدیریت پرنگارین', characterName: 'میمو', locale: 'fa-IR', direction: 'rtl',
  greeting: 'سلام، برای کار با پنل مدیریت راهنمایی‌تان می‌کنم.',
  description: 'داده‌ها و ورود این نسخه پنل نمایشی‌اند؛ میمو به اطلاعات خصوصی مدیریتی متصل نیست.',
  disclosure: 'راهنمای مراحل؛ تغییر داده یا تأیید مدیریتی از گفتگو انجام نمی‌شود.',
  inputPlaceholder: 'درباره کار با این صفحه بپرسید…',
  suggestions: [
    { id: 'admin-page', label: 'راهنمای این صفحه', prompt: 'در این صفحه چه کار کنم؟' },
    { id: 'admin-data', label: 'اعتبار داده‌های پنل', prompt: 'آمار این پنل واقعی است؟' },
  ],
};
const theme = { primary: '#b9924d', background: '#101926', surface: '#182330', text: '#f6f1e8', muted: '#b6b2a9', border: '#344150', fontFamily: 'Vazirmatn, Tahoma, sans-serif', direction: 'rtl' as const };

export function MimoAdminGuide() {
  const route = usePathname() || '/';
  // Admin authentication is currently a demo. Do not send an invented admin identity/token.
  const transport = useMemo(() => new HttpAssistantTransport('/api/v1/assistant'), []);
  return (
    <AssistantProvider manifest={manifest} transport={transport} context={{ route }} theme={theme}>
      <MimoAssistant position="start" />
    </AssistantProvider>
  );
}
