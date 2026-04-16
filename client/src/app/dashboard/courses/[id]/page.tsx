import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getCourseById, getCategories } from '@/lib/course';
import {
  updateCourseAction,
  publishCourseAction,
  unpublishCourseAction,
} from '@/actions/course.actions';
import {
  createLessonAction,
  deleteLessonAction,
} from '@/actions/lesson.actions';
import {
  createQuizAction,
  publishQuizAction,
  deleteQuizAction,
} from '@/actions/quiz.actions';
import { notFound } from 'next/navigation';
import type { Lesson } from '@/lib/types/course';
import { 
  ArrowLeft, 
  Settings, 
  BookOpen, 
  Plus, 
  Eye, 
  Video, 
  Trash2, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Layout, 
  Sparkles, 
  Wallet,
  PlayCircle,
  Award,
  CirclePlay,
  FileEdit,
  Globe,
  Settings2
} from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Props { params: Promise<{ id: string }> }

export default async function EditCoursePage({ params }: Props) {
  const user = await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;
  const { id: documentId } = await params;

  const [course, categories] = await Promise.all([
    getCourseById(documentId, jwt),
    getCategories(),
  ]);

  if (!course) notFound();

  const isAdmin = user.role_type === 'org_admin';
  const lessons: Lesson[] = course.lessons ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-10">
        <div className="space-y-1">
          <a 
            href="/dashboard/courses" 
            className="group inline-flex items-center gap-2 text-sm font-black text-muted-foreground transition-all hover:text-brand-600 mb-4"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Management
          </a>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl italic uppercase">
              Curriculum <span className="text-brand-600">Architect</span>
            </h1>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${course.publishedAt ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${course.publishedAt ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {course.publishedAt ? 'Active' : 'Draft'}
            </div>
          </div>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed mt-4">
            Currently editing: <span className="font-black italic text-foreground uppercase">{course.title}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
           <a 
            href={`/courses/${course.slug}`} 
            target="_blank" 
            className="flex items-center gap-2 rounded-2xl bg-secondary px-6 py-4 text-sm font-black uppercase tracking-widest text-foreground transition-all hover:bg-brand-50 hover:text-brand-600 shadow-sm active:scale-95 border border-border"
           >
              <Eye size={18} /> Preview
           </a>
           {isAdmin && (
             <>
               {course.publishedAt ? (
                 <form action={unpublishCourseAction.bind(null, documentId)}>
                   <button type="submit" className="flex items-center gap-2 rounded-2xl bg-red-50 px-6 py-4 text-sm font-black uppercase tracking-widest text-red-600 transition-all hover:bg-red-500 hover:text-white shadow-sm active:scale-95 border border-red-100">
                     Halt Broadcast
                   </button>
                 </form>
               ) : (
                 <form action={publishCourseAction.bind(null, documentId)}>
                   <button type="submit" className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95">
                      Launch Signal
                   </button>
                 </form>
               )}
             </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Form & Settings */}
        <div className="lg:col-span-12 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Core Info */}
                <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
                    <h2 className="text-xl font-black italic tracking-tight mb-8 flex items-center gap-3">
                        <Settings2 size={20} className="text-brand-500" />
                        Root Configuration
                    </h2>
                    <form action={updateCourseAction.bind(null, documentId)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Display Title</label>
                            <input name="title" type="text" required defaultValue={course.title} className="h-14 w-full rounded-2xl border border-input bg-secondary px-6 text-sm font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Critical Description</label>
                            <textarea name="description" required rows={4} defaultValue={course.description} className="w-full rounded-[2rem] border border-input bg-secondary p-6 text-sm font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Proficiency Level</label>
                                <select name="level" defaultValue={course.level} className="h-12 w-full appearance-none rounded-xl border border-input bg-secondary px-6 text-xs font-black uppercase tracking-widest ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm">
                                    <option value="beginner">Beginner Phase</option>
                                    <option value="intermediate">Intermediate Level</option>
                                    <option value="advanced">Advanced Mastery</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Temporal Duration (m)</label>
                                <input name="duration" type="number" min="0" defaultValue={course.duration ?? ''} className="h-12 w-full rounded-xl border border-input bg-secondary px-6 text-xs font-black ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Scientific Discipline</label>
                                <select name="categoryId" defaultValue={course.category?.documentId ?? ''} className="h-12 w-full appearance-none rounded-xl border border-input bg-secondary px-6 text-xs font-black uppercase tracking-widest ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm">
                                    <option value="">Uncategorized</option>
                                    {categories.map((cat) => (
                                        <option key={cat.documentId} value={cat.documentId}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Access Cost (₹)</label>
                                <input name="price" type="number" min="0" step="0.01" defaultValue={course.price ?? ''} className="h-12 w-full rounded-xl border border-input bg-secondary px-6 text-xs font-black ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm" />
                            </div>
                        </div>

                        <button type="submit" className="w-full h-14 rounded-2xl bg-foreground text-background text-sm font-black uppercase tracking-widest transition-all hover:bg-foreground/90 active:scale-95 shadow-lg">
                           Synchronize Core Data
                        </button>
                    </form>
                </section>

                {/* Media Management */}
                <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium flex flex-col h-full">
                    <h2 className="text-xl font-black italic tracking-tight mb-8 flex items-center gap-3">
                        <Globe size={20} className="text-blue-500" />
                        Visual Propagation
                    </h2>
                    <div className="flex-1 flex flex-col justify-center gap-8">
                        {course.thumbnail?.url ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-border shadow-lg">
                                <img src={`${STRAPI_URL}${course.thumbnail.url}`} alt="Course Thumbnail" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>
                        ) : (
                            <div className="aspect-video w-full flex items-center justify-center rounded-3xl bg-secondary border-2 border-dashed border-border text-muted-foreground">
                                No visual asset detected
                            </div>
                        )}
                        <form action={updateCourseAction.bind(null, documentId)} className="space-y-4">
                            <div className="space-y-2 text-center">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Modify Asset Spectrum</label>
                                <input name="thumbnail" type="file" accept="image/*" className="block w-full text-xs text-muted-foreground file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-brand-500 file:text-white hover:file:bg-brand-600" />
                            </div>
                            <button type="submit" className="w-full h-14 rounded-2xl bg-brand-50 text-brand-600 text-sm font-black uppercase tracking-widest transition-all hover:bg-brand-100 active:scale-95 border border-brand-200">
                               Update Media Pipeline
                            </button>
                        </form>
                    </div>
                </section>
            </div>

            {/* Curriculum Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3 lowercase">
                            <CirclePlay size={24} className="text-brand-600" />
                            Lessons
                        </h2>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">
                            {lessons.length} nodes active
                        </span>
                    </div>

                    <div className="space-y-3 mb-10">
                        {lessons.map((lesson) => (
                            <div key={lesson.documentId} className="group flex items-center justify-between p-5 rounded-3xl bg-secondary border border-transparent hover:border-border transition-all hover:bg-card hover:shadow-lg">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-[10px] font-black text-muted-foreground group-hover:text-brand-600 group-hover:bg-brand-50 border border-border">
                                        {String(lesson.order).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <div className="font-bold text-sm text-foreground group-hover:text-brand-600 transition-colors capitalize">{lesson.title}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {lesson.videoUrl && <Video size={10} className="text-emerald-500" />}
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                                                {lesson.videoUrl ? 'Video Stream Active' : 'Rich Text Content'}
                                            </span>
                                            {lesson.isFree && <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 px-1 rounded">Open</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={`/dashboard/courses/${documentId}/lessons/${lesson.documentId}`} className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-brand-500 hover:text-white transition-all">
                                        <FileEdit size={14} />
                                    </a>
                                    <form action={deleteLessonAction.bind(null, lesson.documentId, documentId)}>
                                        <button type="submit" className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-[2rem] border-2 border-dashed border-border p-8 bg-secondary/20">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 italic">Append New Module</h3>
                        <form action={createLessonAction.bind(null, documentId)} className="space-y-4">
                             <input name="title" type="text" required placeholder="New Module Name..." className="h-12 w-full rounded-xl bg-card border border-input px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
                             <div className="grid grid-cols-2 gap-4">
                                <input name="order" type="number" min="1" defaultValue={lessons.length + 1} className="h-12 w-full rounded-xl bg-card border border-input px-4 text-xs font-black focus:outline-none" />
                                <button type="submit" className="h-12 rounded-xl bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:bg-brand-600">Initialize</button>
                             </div>
                        </form>
                    </div>
                </section>

                <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3 lowercase">
                            <Award size={24} className="text-indigo-600" />
                            Quizzes
                        </h2>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">
                            {(course.quizzes?.length || 0)} assessments
                        </span>
                    </div>

                    <div className="space-y-3 mb-10">
                        {course.quizzes?.map((quiz: any) => (
                            <div key={quiz.documentId} className="group flex items-center justify-between p-5 rounded-3xl bg-secondary border border-transparent hover:border-border transition-all hover:bg-card hover:shadow-lg">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl border ${quiz.publishedAt ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                                        <Award size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-foreground group-hover:text-indigo-600 transition-colors uppercase italic">{quiz.title}</div>
                                        <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-indigo-500/30">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Passing: {quiz.passingScore}%</span>
                                            {quiz.publishedAt ? (
                                              <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">Active System</span>
                                            ) : (
                                              <span className="text-[8px] font-black uppercase text-amber-600 tracking-widest">Constructive Phase</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={`/dashboard/courses/${documentId}/quizzes/${quiz.documentId}`} className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100">
                                        <Plus size={14} />
                                    </a>
                                    {isAdmin && !quiz.publishedAt && (
                                      <form action={publishQuizAction.bind(null, quiz.documentId, documentId)}>
                                          <button type="submit" className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100">
                                              <Globe size={14} />
                                          </button>
                                      </form>
                                    )}
                                    <form action={deleteQuizAction.bind(null, quiz.documentId, documentId)}>
                                        <button type="submit" className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all border border-red-100">
                                            <Trash2 size={14} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-[2rem] border-2 border-dashed border-indigo-100 p-8 bg-indigo-50/20">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 italic">Initialize Assessment</h3>
                        <form action={createQuizAction.bind(null, documentId, course.slug)} className="space-y-4">
                             <input name="title" type="text" required placeholder="Assessment Title..." className="h-12 w-full rounded-xl bg-card border border-indigo-100 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10" />
                             <input type="hidden" name="courseSlug" value={course.slug} />
                             <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <input name="passingScore" type="number" min="0" max="100" defaultValue="70" className="h-12 w-full rounded-xl bg-card border border-indigo-100 pl-4 pr-10 text-xs font-black focus:outline-none" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-600">%</span>
                                </div>
                                <button type="submit" className="h-12 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:bg-indigo-700 shadow-md shadow-indigo-500/20">Forge Quiz</button>
                             </div>
                        </form>
                    </div>
                </section>
            </div>
        </div>
      </div>
    </div>
  );
}

