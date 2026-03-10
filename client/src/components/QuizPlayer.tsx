'use client';

import { useState } from 'react';
import { submitQuizAction } from '@/actions/quiz.actions';
import { Question, Quiz } from '@/lib/types/course';

interface Props {
  quiz: Quiz;
  courseSlug: string;
}

export default function QuizPlayer({ quiz, courseSlug }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = quiz.questions || [];

  const handleOptionChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!confirm('You have not answered all questions. Submit anyway?')) return;
    }

    setIsSubmitting(true);
    try {
      const data = await submitQuizAction(quiz.documentId, answers, courseSlug);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div style={{ padding: 24, border: '1px solid #eee', borderRadius: 12, background: '#fff' }}>
        <h2 style={{ color: result.isPassed ? '#10b981' : '#ef4444' }}>
          {result.isPassed ? '🎉 Quiz Passed!' : '❌ Quiz Failed'}
        </h2>
        <div style={{ fontSize: 48, fontWeight: 'bold', margin: '20px 0' }}>
          {result.score}%
        </div>
        <p style={{ color: '#666' }}>
          Passing score: {result.passingScore}%
        </p>

        <div style={{ marginTop: 32 }}>
          <h3>Review Answers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            {result.detailedResults.map((res: any, i: number) => {
              const q = questions.find(question => question.documentId === res.questionDocumentId);
              const bg = res.isCorrect ? '#f0fdf4' : res.isPartial ? '#fffbeb' : '#fef2f2';
              const answerColor = res.isCorrect ? '#10b981' : res.isPartial ? '#d97706' : '#ef4444';
              return (
                <div key={i} style={{ padding: 16, border: '1px solid #eee', borderRadius: 8, background: bg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{i + 1}. {q?.text}</p>
                    {res.aiGraded && (
                      <span style={{ fontSize: 11, background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        🤖 AI Graded
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, marginTop: 8 }}>
                    Your answer: <span style={{ color: answerColor }}>{res.userAnswer || '(No answer)'}</span>
                    {res.isPartial && <span style={{ marginLeft: 8, color: '#d97706' }}>⚡ Partial credit</span>}
                  </p>
                  {!res.isCorrect && (
                    <p style={{ fontSize: 13, color: '#10b981', marginTop: 4 }}>
                      Correct answer: {res.correctAnswer}
                    </p>
                  )}
                  {res.aiGraded && res.feedback && (
                    <p style={{ fontSize: 13, color: '#555', marginTop: 6, fontStyle: 'italic' }}>
                      💬 {res.feedback}
                    </p>
                  )}
                  {res.aiGraded && res.missing_points && res.missing_points.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px' }}>Missing points:</p>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {res.missing_points.map((pt: string, pi: number) => (
                          <li key={pi} style={{ fontSize: 12, color: '#ef4444' }}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {res.pointsText && (
                    <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
                      Points: {res.pointsText}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 32,
            padding: '12px 24px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {questions.map((q, i) => (
        <div key={q.documentId} style={{ padding: 24, border: '1px solid #eee', borderRadius: 12, background: '#fff' }}>
          <p style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
            {i + 1}. {q.text}
          </p>

          {q.type === 'mcq' || q.type === 'true-false' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {((q.options && q.options.length > 0) ? q.options as string[] : (q.type === 'true-false' ? ['True', 'False'] : [])).map((opt) => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 16px', border: '1px solid #eee', borderRadius: 8, background: answers[q.documentId] === opt ? '#f3f4f6' : 'transparent' }}>
                  <input
                    type="radio"
                    name={q.documentId}
                    value={opt}
                    checked={answers[q.documentId] === opt}
                    onChange={() => handleOptionChange(q.documentId, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              placeholder="Your answer..."
              value={answers[q.documentId] || ''}
              onChange={(e) => handleOptionChange(q.documentId, e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #eee' }}
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        style={{
          padding: '16px 32px',
          background: isSubmitting ? '#ccc' : '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          fontSize: 16,
          fontWeight: 'bold',
          alignSelf: 'flex-start',
        }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
}
