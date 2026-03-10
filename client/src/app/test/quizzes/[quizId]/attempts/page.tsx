import { getQuizAttempts, getQuizById } from '@/lib/course';
import { getCurrentJwt } from '@/lib/server-auth';
import { notFound, redirect } from 'next/navigation';

interface Props {
  params: Promise<{ quizId: string }>;
}

export default async function QuizAttemptsPage({ params }: Props) {
  const { quizId } = await params;

  const jwt = await getCurrentJwt();
  if (!jwt) redirect('/login');

  const quiz = await getQuizById(quizId, jwt);
  if (!quiz) notFound();

  const attempts = await getQuizAttempts(quizId, jwt);

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 800, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 12, background: '#fff' }}>
      <h1 style={{ marginBottom: 16 }}>Attempts for {quiz.title}</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Passing Score: {quiz.passingScore}%</p>
      
      {attempts.length === 0 ? (
        <p>No attempts found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {attempts.map((attempt: any, index: number) => (
            <a 
              key={attempt.documentId} 
              href={`/test/quizzes/${attempt.documentId}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 16,
                border: '1px solid #eee',
                borderRadius: 8,
                textDecoration: 'none',
                color: '#000',
                background: '#f9fafb'
              }}
            >
              <div>
                <span style={{ fontWeight: 'bold' }}>Attempt {attempts.length - index}</span>
                <span style={{ color: '#666', fontSize: 13, marginLeft: 16 }}>
                  {new Date(attempt.attemptedAt).toLocaleString()}
                </span>
              </div>
              <div style={{ fontWeight: 'bold', color: attempt.isPassed ? '#10b981' : '#ef4444' }}>
                {attempt.score}% {attempt.isPassed ? '(Passed)' : '(Failed)'}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
