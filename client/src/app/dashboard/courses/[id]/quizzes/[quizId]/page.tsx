import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getQuizById, getCourseById } from '@/lib/course';
import { createQuestionAction, deleteQuestionAction } from '@/actions/quiz.actions';
import { notFound } from 'next/navigation';

interface Props { params: Promise<{ id: string; quizId: string }> }

export default async function ManageQuizPage({ params }: Props) {
  const user = await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;
  const { id: courseId, quizId } = await params;

  const [course, quiz] = await Promise.all([
    getCourseById(courseId, jwt),
    getQuizById(quizId, jwt, true),
  ]);

  if (!course || !quiz) notFound();

  const questions = quiz.questions || [];

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 800 }}>
      <a href={`/dashboard/courses/${courseId}`}>← Back to Course</a>
      
      <h1 style={{ marginTop: 24 }}>Manage Quiz: {quiz.title}</h1>
      <p style={{ color: '#666' }}>
        Passing Score: {quiz.passingScore}% | Time Limit: {quiz.timeLimit ? `${quiz.timeLimit} mins` : 'None'}
      </p>
      
      <hr style={{ margin: '32px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Questions ({questions.length})</h2>
      </div>

      {questions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          {questions.map((q, idx) => (
            <div key={q.documentId} style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: '0 0 12px' }}>{idx + 1}. {q.text}</h3>
                <form action={deleteQuestionAction.bind(null, q.documentId, courseId, quizId)}>
                  <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                    Delete
                  </button>
                </form>
              </div>
              
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>Type: <strong>{q.type}</strong> | Points: <strong>{q.points}</strong></p>
              
              {(q.type === 'mcq' || q.type === 'true-false') && (
                <ul style={{ margin: '0 0 8px', paddingLeft: 20, fontSize: 14 }}>
                  {((q.options && q.options.length > 0) ? q.options as string[] : (q.type === 'true-false' ? ['True', 'False'] : [])).map((opt, i) => (
                    <li key={i} style={{ color: opt === q.correctAnswer ? '#10b981' : 'inherit', fontWeight: opt === q.correctAnswer ? 'bold' : 'normal' }}>
                      {opt} {opt === q.correctAnswer && '✓'}
                    </li>
                  ))}
                </ul>
              )}
              {q.type === 'short-answer' && (
                <p style={{ margin: 0, fontSize: 14, color: '#10b981' }}>
                  <strong>Correct Answer:</strong> {q.correctAnswer}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: '24px 0', color: '#666' }}>No questions added yet.</p>
      )}

      {/* Add new question form */}
      <div style={{ marginTop: 48, padding: 24, background: '#f9fafb', border: '1px solid #eee', borderRadius: 12 }}>
        <h3>+ Add Question</h3>
        <form action={createQuestionAction.bind(null, quizId, courseId)} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          <label>Question Text *
            <input name="text" type="text" required placeholder="e.g. What is the capital of France?"
              style={{ display: 'block', width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #ccc' }} />
          </label>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ flex: 1 }}>Type *
              <select name="type" required style={{ display: 'block', width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #ccc' }}>
                <option value="mcq">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer</option>
              </select>
            </label>
            <label style={{ flex: 1 }}>Points
              <input name="points" type="number" min="1" defaultValue="1"
                style={{ display: 'block', width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #ccc' }} />
            </label>
          </div>

          <label>Options (For MCQ, comma-separated)
            <input name="options" type="text" placeholder="e.g. Paris, London, Berlin, Madrid"
              style={{ display: 'block', width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #ccc' }} />
            <small style={{ color: '#666', display: 'block', marginTop: 4 }}>Leave empty for True/False or Short Answer. For True/False, the options "True" and "False" will be assumed if left blank by your UI later, but for safety you can provide "True, False".</small>
          </label>
          
          <label>Correct Answer *
            <input name="correctAnswer" type="text" required placeholder="e.g. Paris"
              style={{ display: 'block', width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #ccc' }} />
            <small style={{ color: '#666', display: 'block', marginTop: 4 }}>Must exactly match one of the options (case-sensitive) for MCQ.</small>
          </label>
          
          <button type="submit"
            style={{ padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>
            Add Question
          </button>
        </form>
      </div>
    </div>
  );
}
