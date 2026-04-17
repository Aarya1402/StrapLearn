'use client';

import { completeCourseAction } from '@/actions/enrollment.actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Trophy } from 'lucide-react';

interface Props {
  courseId: string;
  courseSlug: string;
}

export default function FinishCourseButton({ courseId, courseSlug }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleFinish = async () => {
    setIsPending(true);
    try {
      const result = await completeCourseAction(courseId, courseSlug);
      if (result.success) {
        if (result.nextQuizId) {
          router.push(`/courses/${courseSlug}/quizzes/${result.nextQuizId}`);
        } else {
          router.push(`/courses/${courseSlug}`);
        }
        router.refresh();
      } else {
        alert('Failed to finish course: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleFinish}
      disabled={isPending}
      className={`
        flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all active:scale-[0.98]
        ${isPending 
          ? 'bg-secondary text-muted-foreground cursor-not-allowed' 
          : 'bg-brand-500 text-white hover:bg-brand-600 hover:shadow-lg shadow-brand-500/20'
        }
      `}
    >
      {isPending ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <Trophy size={18} />
          <span>Finish Course & Claim Certificate</span>
        </>
      )}
    </button>
  );
}

