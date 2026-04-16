import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getQuizById, getCourseById } from '@/lib/course';
import { createQuestionAction, deleteQuestionAction } from '@/actions/quiz.actions';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  HelpCircle, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  ListOrdered, 
  Type, 
  Target,
  Sparkles,
  Award,
  CircleHelp
} from 'lucide-react';

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
    <div className="mx-auto max-w-5xl space-y-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-10">
        <div className="space-y-1">
          <a 
            href={`/dashboard/courses/${courseId}`} 
            className="group inline-flex items-center gap-2 text-sm font-black text-muted-foreground transition-all hover:text-brand-600 mb-4"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Curriculum
          </a>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl italic uppercase">
            Assessment <span className="text-indigo-600">Forge</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed mt-4">
            Constructing: <span className="font-black italic text-foreground uppercase">{quiz.title}</span>
          </p>
        </div>

        <div className="flex items-center gap-6 px-8 py-4 rounded-[2rem] bg-indigo-50 border border-indigo-100 shadow-sm">
            <div className="text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600/60 transition-colors">Passing Threshold</div>
                <div className="text-2xl font-black text-indigo-600">{quiz.passingScore}%</div>
            </div>
            <div className="h-10 w-px bg-indigo-200" />
            <div className="text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600/60">Temporal Limit</div>
                <div className="text-2xl font-black text-indigo-600">{quiz.timeLimit ? `${quiz.timeLimit}m` : '∞'}</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 space-y-8">
          <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3 lowercase">
                <CircleHelp size={24} className="text-indigo-600" />
                Questions Bank
              </h2>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">
                {questions.length} items staged
              </span>
          </div>

          <div className="space-y-6">
            {questions.length > 0 ? (
              questions.map((q, idx) => (
                <div key={q.documentId} className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-10 shadow-premium transition-all hover:shadow-premium-hover">
                  <div className="flex items-start justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-sm font-black border border-indigo-100 shadow-sm transition-transform group-hover:rotate-6">
                            {idx + 1}
                        </span>
                        <div>
                            <h3 className="text-xl font-bold text-foreground leading-tight">{q.text}</h3>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                                    <Type size={12} className="text-indigo-500" /> {q.type}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                                    <Sparkles size={12} className="text-amber-500" /> {q.points} pt
                                </span>
                            </div>
                        </div>
                    </div>
                    <form action={deleteQuestionAction.bind(null, q.documentId, courseId, quizId)}>
                      <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all active:scale-95 border border-transparent hover:border-red-100">
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>

                  <div className="space-y-4">
                    {(q.type === 'mcq' || q.type === 'true-false') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {((q.options && q.options.length > 0) ? q.options as string[] : (q.type === 'true-false' ? ['True', 'False'] : [])).map((opt, i) => {
                          const isCorrect = opt === q.correctAnswer;
                          return (
                            <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-border bg-secondary/30 text-muted-foreground'}`}>
                              <span className="text-sm font-bold">{opt}</span>
                              {isCorrect && <CheckCircle2 size={16} className="text-emerald-500" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {q.type === 'short-answer' && (
                        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Expected Pattern</div>
                            <div className="text-base font-bold text-emerald-700">{q.correctAnswer}</div>
                        </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[2.5rem] border-2 border-dashed border-border p-20 text-center bg-muted/20">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-4">
                        <HelpCircle size={32} />
                    </div>
                    <h3 className="text-xl font-black italic tracking-tight text-foreground">Core Empty</h3>
                    <p className="text-muted-foreground text-sm font-bold max-w-xs mx-auto mt-2 italic capitalize">no pedagogical inquiries detected in this assessment node yet.</p>
              </div>
            )}
          </div>

          <div className="rounded-[2.5rem] border border-indigo-200 bg-indigo-50/20 p-12 mt-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-indigo-100">
                <Plus size={120} strokeWidth={4} />
            </div>
            <div className="relative">
                <h3 className="text-2xl font-black italic tracking-tight text-indigo-600 mb-8 lowercase">Append Inquiry</h3>
                <form action={createQuestionAction.bind(null, quizId, courseId)} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 ml-2">Question Logic</label>
                    <input name="text" type="text" required placeholder="Ex: What defines the state of a qubit?" className="h-14 w-full rounded-2xl border border-indigo-100 bg-white px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:opacity-50" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 ml-2">Response Protocol</label>
                      <select name="type" required className="h-14 w-full appearance-none rounded-2xl border border-indigo-100 bg-white px-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all">
                        <option value="mcq">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                        <option value="short-answer">Short Answer</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 ml-2">Point Allocation</label>
                      <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                        <input name="points" type="number" min="1" defaultValue="1" className="h-14 w-full rounded-2xl border border-indigo-100 bg-white pl-12 pr-6 text-sm font-bold focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 ml-2">Option Spectrum (comma-separated for MCQ)</label>
                    <input name="options" type="text" placeholder="Paris, London, Berlin, Madrid" className="h-14 w-full rounded-2xl border border-indigo-100 bg-white px-6 text-sm font-bold focus:outline-none" />
                    <p className="mt-2 text-[10px] font-black italic text-indigo-400 capitalize px-2">Leave blank for Boolean/Short-answer types.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 ml-2">Target Truth (Correct Answer)</label>
                    <input name="correctAnswer" type="text" required placeholder="Ex: Superposition" className="h-14 w-full rounded-2xl border border-indigo-100 bg-white px-6 text-sm font-bold focus:outline-none border-dashed border-2 focus:border-emerald-500 transition-colors" />
                    <p className="mt-2 text-[10px] font-black italic text-indigo-400 capitalize px-2">Must exactly match one of the options (case-sensitive) for MCQ.</p>
                  </div>
                  
                  <button type="submit" className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white text-base font-black uppercase tracking-[0.2em] italic transition-all hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-600/30">
                    Seal Inquiry into Vault
                  </button>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

