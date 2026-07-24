'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useSubmitReview } from '@/lib/api-hooks';

function ReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  const submitReview = useSubmitReview();

  const handleSubmit = async () => {
    if (!bookingId) return toast.error('شناسه رزرو معتبر نیست');
    if (!rating) return toast.error('امتیاز را انتخاب کنید');
    try {
      await submitReview.mutateAsync({ bookingId, rating, comment });
      toast.success('نظر شما ثبت شد ✓');
      router.push('/profile/bookings');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'خطا در ثبت نظر');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">⭐</div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>ثبت نظر</h1>
        </div>

        <div className="rounded-2xl p-6 border space-y-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {/* Star rating */}
          <div>
            <p className="text-sm font-medium mb-3 text-center" style={{ color: 'var(--color-text)' }}>چند ستاره می‌دهید؟</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}>
                  <Star className={`w-10 h-10 transition-colors ${i <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <p className="text-center text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
              {['', 'خیلی بد', 'بد', 'متوسط', 'خوب', 'عالی'][rating]}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>نظر شما (اختیاری)</label>
            <textarea
              value={comment} onChange={e => setComment(e.target.value)}
              rows={4} placeholder="تجربه خود را با دیگران به اشتراک بگذارید..."
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
            />
          </div>

          <button onClick={handleSubmit} disabled={submitReview.isPending}
            className="w-full py-3 rounded-xl text-white font-medium disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}>
            {submitReview.isPending ? 'در حال ثبت...' : 'ثبت نظر'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return <Suspense><ReviewForm /></Suspense>;
}
