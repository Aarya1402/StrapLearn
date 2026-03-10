'use client';

import { completeCourseAction } from '@/actions/enrollment.actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
      style={{
        background: 'none',
        border: 'none',
        color: '#000',
        cursor: 'pointer',
        padding: 0,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        textDecoration: 'none',
      }}
    >
      {isPending ? 'Processing...' : '✅ Finish course'}
    </button>
  );
}
