'use client';

import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { AdminShell } from '@/components/layout/admin-shell';
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Quote, Image as ImageIcon, Link as LinkIcon, Eye, Save, Send,
  ChevronRight,
} from 'lucide-react';
import NextLink from 'next/link';

const TOOLBAR_GROUPS = [
  [
    { icon: Bold,         title: 'Bold',          action: (e: any) => e.chain().focus().toggleBold().run(),         active: (e: any) => e.isActive('bold') },
    { icon: Italic,       title: 'Italic',        action: (e: any) => e.chain().focus().toggleItalic().run(),       active: (e: any) => e.isActive('italic') },
  ],
  [
    { icon: Heading1,     title: 'H1',            action: (e: any) => e.chain().focus().toggleHeading({ level: 1 }).run(), active: (e: any) => e.isActive('heading', { level: 1 }) },
    { icon: Heading2,     title: 'H2',            action: (e: any) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e: any) => e.isActive('heading', { level: 2 }) },
  ],
  [
    { icon: List,         title: 'Bullet List',   action: (e: any) => e.chain().focus().toggleBulletList().run(),   active: (e: any) => e.isActive('bulletList') },
    { icon: ListOrdered,  title: 'Ordered List',  action: (e: any) => e.chain().focus().toggleOrderedList().run(),  active: (e: any) => e.isActive('orderedList') },
    { icon: Quote,        title: 'Blockquote',    action: (e: any) => e.chain().focus().toggleBlockquote().run(),   active: (e: any) => e.isActive('blockquote') },
  ],
  [
    { icon: LinkIcon,     title: 'Link',          action: (e: any) => {
        const url = window.prompt('URL:');
        if (url) e.chain().focus().setLink({ href: url }).run();
      }, active: (e: any) => e.isActive('link') },
    { icon: ImageIcon,    title: 'Image',         action: (e: any) => {
        const url = window.prompt('Image URL:');
        if (url) e.chain().focus().setImage({ src: url }).run();
      }, active: () => false },
  ],
];

export default function PageEditorPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new';
  const [title, setTitle] = useState(isNew ? '' : 'درباره پرنگارین');
  const [slug, setSlug] = useState(isNew ? '' : 'about');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'محتوای صفحه را اینجا بنویسید...' }),
    ],
    content: isNew ? '' : '<h2>درباره پرنگارین</h2><p>پرنگارین یک پلتفرم رزرو آنلاین آرایشگاه و سالن زیبایی در ایران است.</p>',
    editorProps: {
      attributes: { class: 'outline-none min-h-[400px] prose prose-sm max-w-none text-right' },
    },
  });

  const handleSave = async (publish = false) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    if (publish) setStatus('PUBLISHED');
    setSaving(false);
  };

  return (
    <AdminShell title={isNew ? 'صفحه جدید' : 'ویرایش صفحه'}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--admin-muted)' }}>
        <NextLink href="/content/pages" style={{ color: 'var(--brand-gold-600)' }}>صفحات CMS</NextLink>
        <ChevronRight size={14} />
        <span>{isNew ? 'صفحه جدید' : title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

        {/* Main editor */}
        <div className="space-y-4">
          {/* Title */}
          <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid var(--admin-border)' }}>
            <input
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (isNew) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
              }}
              placeholder="عنوان صفحه..."
              className="w-full text-2xl font-bold outline-none bg-transparent"
              style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs" style={{ color: 'var(--admin-muted)' }}>Slug:</span>
              <input
                value={slug} onChange={e => setSlug(e.target.value)}
                placeholder="page-slug"
                className="text-xs outline-none flex-1"
                style={{ color: 'var(--brand-navy-600)', direction: 'ltr' }}
              />
            </div>
          </div>

          {/* Editor toolbar */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--admin-border)' }}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b flex-wrap" style={{ borderColor: 'var(--admin-border)' }}>
              {TOOLBAR_GROUPS.map((group, gi) => (
                <div key={gi} className="flex items-center gap-0.5">
                  {gi > 0 && <div className="w-px h-5 mx-1" style={{ background: 'var(--admin-border)' }} />}
                  {group.map((btn) => {
                    const Icon = btn.icon;
                    const isActive = editor ? btn.active(editor) : false;
                    return (
                      <button
                        key={btn.title}
                        title={btn.title}
                        onMouseDown={e => { e.preventDefault(); if (editor) btn.action(editor); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          background: isActive ? 'var(--brand-plum-50)' : 'transparent',
                          color: isActive ? 'var(--brand-plum-600)' : 'var(--admin-muted)',
                        }}
                      >
                        <Icon size={15} />
                      </button>
                    );
                  })}
                </div>
              ))}

              <div className="mr-auto">
                <button
                  onClick={() => setShowPreview(p => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: showPreview ? 'var(--brand-navy-50)' : 'transparent',
                    color: 'var(--brand-navy-600)',
                  }}
                >
                  <Eye size={13} /> پیش‌نمایش
                </button>
              </div>
            </div>

            {/* Editor area */}
            <div className="p-6">
              {showPreview ? (
                <div
                  className="prose prose-sm max-w-none text-right min-h-[400px]"
                  style={{ color: 'var(--brand-navy-600)' }}
                  dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
                />
              ) : (
                <EditorContent editor={editor} />
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Status + actions */}
          <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid var(--admin-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: 'var(--brand-navy-600)' }}>وضعیت</span>
              <span className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  background: status === 'PUBLISHED' ? 'rgba(39,174,96,0.1)' : 'rgba(230,126,34,0.1)',
                  color: status === 'PUBLISHED' ? '#27AE60' : '#E67E22',
                }}>
                {status === 'PUBLISHED' ? 'منتشر شده' : 'پیش‌نویس'}
              </span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSave(false)} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ borderColor: 'var(--admin-border)', color: 'var(--brand-navy-600)' }}>
                <Save size={15} /> {saving ? 'در حال ذخیره...' : 'ذخیره پیش‌نویس'}
              </button>
              <button
                onClick={() => handleSave(true)} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: 'var(--brand-navy-600)' }}>
                <Send size={15} /> انتشار
              </button>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid var(--admin-border)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--brand-navy-600)' }}>SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--admin-muted)' }}>عنوان SEO</label>
                <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)}
                  placeholder="عنوان برای موتورهای جستجو"
                  className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'var(--admin-content-bg)', border: '1px solid var(--admin-border)', color: 'var(--brand-navy-600)' }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--admin-muted)' }}>توضیحات</label>
                <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)}
                  placeholder="متا دیسکریپشن..."
                  rows={3}
                  className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none"
                  style={{ background: 'var(--admin-content-bg)', border: '1px solid var(--admin-border)', color: 'var(--brand-navy-600)' }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--admin-muted)' }}>og:image URL</label>
                <input value={ogImage} onChange={e => setOgImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'var(--admin-content-bg)', border: '1px solid var(--admin-border)', color: 'var(--brand-navy-600)', direction: 'ltr' }}
                />
              </div>
              {seoDesc && (
                <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--admin-content-bg)' }}>
                  <p className="font-medium mb-0.5" style={{ color: '#1a73e8' }}>{seoTitle || title}</p>
                  <p style={{ color: '#006621', fontSize: '0.65rem' }}>barbercore.ir/{slug}</p>
                  <p className="mt-1 leading-relaxed" style={{ color: '#545454' }}>{seoDesc.slice(0, 160)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
