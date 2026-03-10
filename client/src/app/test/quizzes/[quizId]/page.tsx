import { getCurrentJwt } from '@/lib/server-auth';
import { notFound, redirect } from 'next/navigation';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Props {
  params: Promise<{ quizId: string }>;
}

export default async function QuizAttemptResultPage({ params }: Props) {
  const { quizId: id } = await params;

  const jwt = await getCurrentJwt();
  if (!jwt) redirect('/login');

  const res = await fetch(
    `${STRAPI_URL}/api/quiz-attempts/${id}/my`,
    {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    notFound();
  }

  const { data: result } = await res.json();
  if (!result) notFound();

  const questions = result.quiz?.questions || [];

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 800, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 12, background: '#fff' }}>
      <h2 style={{ color: result.isPassed ? '#10b981' : '#ef4444' }}>
        {result.isPassed ? '🎉 Quiz Passed!' : '❌ Quiz Failed'}
      </h2>
      <div style={{ fontSize: 48, fontWeight: 'bold', margin: '20px 0' }}>
        {result.score}%
      </div>
      <p style={{ color: '#666' }}>
        Passing score: {result.quiz?.passingScore || 70}%
      </p>

      <div style={{ marginTop: 32 }}>
        <h3>Review Answers</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {result.answers && result.answers.map((res: any, i: number) => {
            const q = questions.find((question: any) => question.documentId === res.questionDocumentId);
            return (
              <div key={i} style={{ padding: 16, border: '1px solid #eee', borderRadius: 8, background: res.isCorrect ? '#f0fdf4' : '#fef2f2' }}>
                <p style={{ fontWeight: 'bold', margin: 0 }}>{i + 1}. {q?.text || 'Question'}</p>
                <p style={{ fontSize: 13, marginTop: 8 }}>
                  Your answer: <span style={{ color: res.isCorrect ? '#10b981' : '#ef4444' }}>{res.userAnswer || '(No answer)'}</span>
                </p>
                {!res.isCorrect && (
                  <p style={{ fontSize: 13, color: '#10b981' }}>
                    Correct answer: {res.correctAnswer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
