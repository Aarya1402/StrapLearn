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
              return (
                <div key={i} style={{ padding: 16, border: '1px solid #eee', borderRadius: 8, background: res.isCorrect ? '#f0fdf4' : '#fef2f2' }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>{i + 1}. {q?.text}</p>
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
