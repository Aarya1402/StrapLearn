'use client';

import { useTransition } from 'react';
import { markLessonCompleteAction } from '@/actions/progress.actions';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 'bold' }}>
        <span>✅ Completed</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleMarkComplete}
      disabled={isPending}
      style={{
        padding: '10px 20px',
        background: isPending ? '#ccc' : '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        cursor: isPending ? 'not-allowed' : 'pointer',
        fontSize: 14,
        fontWeight: 'bold',
      }}
    >
      {isPending ? 'Updating...' : 'Mark as Complete'}
    </button>
  );
}
