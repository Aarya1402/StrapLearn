'use client';

import { useTransition } from 'react';
import { markLessonCompleteAction } from '@/actions/progress.actions';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface Props {
  lessonId: string;
  courseId: string;
  courseSlug: string;
  lessonSlug: string;
  isCompleted: boolean;
}

export default function MarkCompleteButton({
  lessonId,
  courseId,
  courseSlug,
  lessonSlug,
  isCompleted,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleMarkComplete = () => {
    startTransition(async () => {
      try {
        await markLessonCompleteAction(lessonId, courseId, courseSlug, lessonSlug);
      } catch (error) {
        console.error(error);
        alert('Failed to update progress');
      }
    });
  };

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
        <CheckCircle2 size={18} />
        <span>Completed</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleMarkComplete}
      disabled={isPending}
      className={`
        group flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all active:scale-[0.98]
        ${isPending 
          ? 'bg-secondary text-muted-foreground cursor-not-allowed' 
          : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg shadow-emerald-600/20'
        }
      `}
    >
      {isPending ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Updating...</span>
        </>
      ) : (
        <>
          <Circle size={18} className="group-hover:hidden" />
          <CheckCircle2 size={18} className="hidden group-hover:block" />
          <span>Mark as Complete</span>
        </>
      )}
    </button>
  );
}

