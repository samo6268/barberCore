'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { MessageSquare, Mail, Edit2, Send, Copy } from 'lucide-react';

const TEMPLATES = [
  {
    id: 't1', type: 'SMS', name: 'تأیید رزرو', trigger: 'booking.confirmed',
    body: 'سلام {{firstName}}، رزروی شما در {{salonName}} برای {{date}} ساعت {{time}} تأیید شد. کد: {{bookingCode}}',
  },
  {
    id: 't2', type: 'SMS', name: 'یادآوری رزرو', trigger: 'booking.reminder',
    body: 'یادآوری: فردا ساعت {{time}} نوبت شما در {{salonName}} است. {{address}}',
  },
  {
    id: 't3', type: 'SMS', name: 'لغو رزرو', trigger: 'booking.cancelled',
    body: 'رزرو شما در {{salonName}} لغو شد. برای رزرو مجدد: {{bookingUrl}}',
  },
  {
    id: 't4', type: 'EMAIL', name: 'خوش‌آمدگویی', trigger: 'user.registered',
    body: 'به پرنگارین خوش آمدید {{firstName}}! حساب شما با موفقیت ایجاد شد.',
  },
  {
    id: 't5', type: 'EMAIL', name: 'فاکتور رزرو', trigger: 'booking.receipt',
    body: 'فاکتور رزرو شما در {{salonName}} — مبلغ: {{amount}} تومان',
  },
  {
    id: 't6', type: 'SMS', name: 'کد OTP', trigger: 'auth.otp',
    body: 'کد تأیید شما: {{otp}} — این کد ۵ دقیقه اعتبار دارد.',
  },
];

const VARS = ['{{firstName}}', '{{salonName}}', '{{date}}', '{{time}}', '{{bookingCode}}', '{{address}}', '{{amount}}', '{{otp}}'];

export default function TemplatesPage() {
  const [active, setActive] = useState(TEMPLATES[0]);
  const [body, setBody] = useState(active.body);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SMS' | 'EMAIL'>('ALL');
  const [preview, setPreview] = useState('');

  const selectTemplate = (t: typeof TEMPLATES[0]) => {
    setActive(t);
    setBody(t.body);
    setPreview('');
  };

  const generatePreview = () => {
    let p = body
      .replace('{{firstName}}', 'سارا')
      .replace('{{salonName}}', 'لوکس بیوتی')
      .replace('{{date}}', '۱۴۰۳/۱۰/۲۰')
      .replace('{{time}}', '۱۴:۳۰')
      .replace('{{bookingCode}}', 'BC-۱۲۳۴')
      .replace('{{address}}', 'تهران، ولیعصر')
      .replace('{{amount}}', '۲۵۰٬۰۰۰')
      .replace('{{otp}}', '۴۵۶۷۸۱')
      .replace('{{bookingUrl}}', 'barbercore.ir/b/1234');
    setPreview(p);
  };

  const filtered = TEMPLATES.filter(t => typeFilter === 'ALL' || t.type === typeFilter);

  return (
    <AdminShell title="قالب‌های پیام">
      <div className="grid lg:grid-cols-3 gap-6 h-full">

        {/* Template list */}
        <div className="lg:col-span-1">
          <div className="flex gap-2 mb-4">
            {(['ALL', 'SMS', 'EMAIL'] as const).map(f => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={{
                  background: typeFilter === f ? 'var(--admin-primary)' : 'var(--admin-card-bg)',
                  borderColor: typeFilter === f ? 'var(--admin-primary)' : 'var(--admin-border)',
                  color: typeFilter === f ? 'var(--admin-primary-fg)' : 'var(--admin-text)',
                }}>
                {f === 'ALL' ? 'همه' : f}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map(t => (
              <button key={t.id} onClick={() => selectTemplate(t)}
                className="w-full text-right rounded-xl border p-4 transition-all"
                style={{
                  background: active.id === t.id ? 'rgba(216,183,106,0.08)' : 'var(--admin-card-bg)',
                  borderColor: active.id === t.id ? 'var(--brand-gold-600)' : 'var(--admin-border)',
                }}>
                <div className="flex items-center gap-2 mb-1">
                  {t.type === 'SMS'
                    ? <MessageSquare size={14} strokeWidth={1.5} style={{ color: 'var(--brand-navy-400)' }} />
                    : <Mail size={14} strokeWidth={1.5} style={{ color: 'var(--brand-plum-600)' }} />}
                  <span className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{t.name}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>{t.trigger}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>{active.name}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--admin-muted)' }}>trigger: {active.trigger}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={generatePreview}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border"
                  style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}>
                  پیش‌نمایش
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--admin-primary)', color: 'var(--admin-primary-fg)' }}>
                  ذخیره
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Variable chips */}
              <div className="mb-4">
                <p className="text-xs mb-2" style={{ color: 'var(--admin-muted)' }}>متغیرها:</p>
                <div className="flex flex-wrap gap-2">
                  {VARS.map(v => (
                    <button key={v} onClick={() => setBody(b => b + ' ' + v)}
                      className="text-xs px-2 py-1 rounded font-mono"
                      style={{ background: 'var(--ui-gray-100)', color: 'var(--brand-navy-400)' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <textarea value={body} onChange={e => setBody(e.target.value)}
                className="w-full rounded-xl border p-4 text-sm resize-none outline-none leading-relaxed"
                rows={5}
                style={{ background: 'var(--bg-ivory)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }} />

              {preview && (
                <div className="mt-4 rounded-xl border p-4" style={{ background: 'rgba(39,174,96,0.05)', borderColor: '#27AE6030' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: '#27AE60' }}>پیش‌نمایش:</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--admin-text)' }}>{preview}</p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: 'var(--admin-muted)' }}>
                <span>{body.length} کاراکتر</span>
                {active.type === 'SMS' && <span>· تقریباً {Math.ceil(body.length / 70)} SMS</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
