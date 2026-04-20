'use client';

import { useState } from 'react';
import Link from 'next/link';
import { submitQuizAction } from '@/actions/quiz.actions';
import { Quiz, QuizResult, DetailedResult, Option } from '@/lib/types/course';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles, RefreshCcw, Send, BookOpen } from 'lucide-react';

interface Props {
  quiz: Quiz;
  courseSlug: string;
}

export default function QuizPlayer({ quiz, courseSlug }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
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
    const isPassed = result.isPassed;
    return (
      <div className="mx-auto max-w-2xl space-y-8 rounded-3xl border border-border bg-card p-8 shadow-premium sm:p-12">
        <div className="text-center">
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ${isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} shadow-lg`}>
            {isPassed ? <Sparkles size={40} /> : <AlertCircle size={40} />}
          </div>
          <h2 className={`text-3xl font-extrabold ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPassed ? 'Congratulations!' : 'Almost there!'}
          </h2>
          <p className="mt-2 text-lg font-medium text-muted-foreground">
            {isPassed ? 'You passed the quiz with' : 'You scored'}
          </p>
          <div className="mt-4 text-7xl font-black tracking-tighter">
            {result.score}%
          </div>
          <p className="mt-4 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Passing Score: {result.passingScore}%
          </p>
        </div>

        <div className="space-y-6 pt-10 border-t border-border">
          <h3 className="text-xl font-bold">Review Your Answers</h3>
          <div className="space-y-4">
            {result.detailedResults.map((res: DetailedResult, i: number) => {
              const q = questions.find(question => question.documentId === res.questionDocumentId);
              return (
                <div 
                  key={i} 
                  className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
                    res.isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 
                    res.isPartial ? 'border-amber-200 bg-amber-50/30' : 'border-red-200 bg-red-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-bold leading-tight">{i + 1}. {q?.text}</p>
                    {res.aiGraded && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                        <Sparkles size={10} /> AI Graded
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-muted-foreground">Your answer:</span>
                      <span className={res.isCorrect ? 'text-emerald-700 font-bold' : res.isPartial ? 'text-amber-700 font-bold' : 'text-red-700 font-bold'}>
                        {res.userAnswer || '(No answer)'}
                      </span>
                      {res.isPartial && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Partial Credit</span>}
                      {res.isCorrect ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-600" />}
                    </p>
                    
                    {!res.isCorrect && (
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground">Correct answer:</span>
                        <span className="text-emerald-700 font-medium">{res.correctAnswer}</span>
                      </p>
                    )}

                    {res.aiGraded && res.feedback && (
                      <div className="mt-3 rounded-xl bg-card p-3 text-xs italic text-muted-foreground shadow-sm">
                        &quot;{res.feedback}&quot;
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-base font-bold text-background transition-all hover:bg-foreground/90 active:scale-[0.98]"
          >
            <RefreshCcw size={20} />
            Retake Quiz
          </button>
          
          <Link
            href={`/courses/${courseSlug}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-border py-4 text-base font-bold text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
          >
            <BookOpen size={20} />
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {questions.map((q, i) => (
        <div key={q.documentId} className="group rounded-3xl border border-border bg-card p-8 shadow-premium transition-all hover:shadow-premium-hover">
          <div className="mb-6 flex items-start gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-muted-foreground">
              {i + 1}
            </span>
            <p className="text-xl font-bold tracking-tight text-foreground">
              {q.text}
            </p>
          </div>

          <div className="grid gap-3">
            {q.type === 'mcq' || q.type === 'true-false' ? (
              ((q.options && q.options.length > 0) 
                ? q.options 
                : (q.type === 'true-false' 
                    ? [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }] as Option[]
                    : [])
              ).map((opt) => {
                const isSelected = answers[q.documentId] === opt.text;
                return (
                  <label 
                    key={opt.id || opt.text} 
                    className={`
                      group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border-2 px-6 py-4 transition-all
                      ${isSelected 
                        ? 'border-brand-500 bg-brand-50/50 text-brand-700 shadow-md shadow-brand-500/10' 
                        : 'border-border bg-background hover:border-brand-300 hover:bg-secondary/30'
                      }
                    `}
                  >
                    <div className={`
                      flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all
                      ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-muted-foreground/30'}
                    `}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <input
                      type="radio"
                      name={q.documentId}
                      value={opt.text}
                      checked={isSelected}
                      onChange={() => setAnswers({ ...answers, [q.documentId]: opt.text })}
                      className="sr-only"
                    />
                    <span className="text-sm font-bold">{opt.text}</span>
                    {isSelected && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-600" size={20} />}
                  </label>
                );
              })
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  value={answers[q.documentId] || ''}
                  onChange={(e) => handleOptionChange(q.documentId, e.target.value)}
                  className="w-full rounded-2xl border-2 border-border bg-background px-6 py-4 text-base font-medium placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none transition-all"
                />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="pt-6">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="group flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-600 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send size={24} />
              <span>Finish & Submit Quiz</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

