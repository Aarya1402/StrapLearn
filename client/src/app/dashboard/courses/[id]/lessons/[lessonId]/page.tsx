import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { updateLessonAction } from '@/actions/lesson.actions';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  Video, 
  Clock, 
  Layers, 
  CheckCircle,
  FileEdit,
  Globe,
  CirclePlay,
  Settings2
} from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Props { params: Promise<{ id: string; lessonId: string }> }

export default async function EditLessonPage({ params }: Props) {
  await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;
  const { id: courseDocumentId, lessonId: lessonDocumentId } = await params;

  // Fetch lesson directly from Strapi
  const res = await fetch(
    `${STRAPI_URL}/api/lessons/${lessonDocumentId}?populate=attachments&status=draft`,
    { headers: { Authorization: `Bearer ${jwt}` }, cache: 'no-store' }
  );
  if (!res.ok) notFound();
  const { data: lesson } = await res.json();

  const textContent = lesson.content
    ?.map((block: any) => block.children?.map((c: any) => c.text).join(''))
    .join('\n') ?? '';

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-10">
        <div className="space-y-1">
          <a 
            href={`/dashboard/courses/${courseDocumentId}`} 
            className="group inline-flex items-center gap-2 text-sm font-black text-muted-foreground transition-all hover:text-brand-600 mb-4"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Curriculum
          </a>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl italic uppercase">
            Module <span className="text-brand-600">Refiner</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed mt-4">
            Polishing: <span className="font-black italic text-foreground uppercase">{lesson.title}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-secondary border border-border">
            <Settings2 size={18} className="text-brand-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Configuration</span>
        </div>
      </div>

      <form
        action={updateLessonAction.bind(null, lessonDocumentId, courseDocumentId)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
      >
        <div className="lg:col-span-2 space-y-8">
            <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
                <h2 className="text-xl font-black italic tracking-tight mb-8 flex items-center gap-3">
                    <FileText size={20} className="text-brand-500" />
                    Rich Content Layer
                </h2>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Display Nominee (Title)</label>
                        <input name="title" type="text" required defaultValue={lesson.title} className="h-14 w-full rounded-2xl border border-input bg-secondary px-6 text-sm font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Pedagogical Substance (Content)</label>
                        <textarea name="content" rows={12} defaultValue={textContent} placeholder="Unfold the academic narrative here..." className="w-full rounded-[2rem] border border-input bg-secondary p-8 text-sm font-bold leading-relaxed ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm" />
                    </div>
                </div>
            </section>
        </div>

        <aside className="space-y-8">
            <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
                <h2 className="text-lg font-black italic tracking-tight mb-6 flex items-center gap-2">
                    <Video size={18} className="text-blue-500" />
                    Visual Signal
                </h2>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Stream URL (YT/VM)</label>
                        <input name="videoUrl" type="url" defaultValue={lesson.videoUrl ?? ''} placeholder="https://youtube.com/watch?v=..." className="h-12 w-full rounded-xl border border-input bg-secondary px-4 text-xs font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Detection Mode</label>
                        <select name="videoProvider" defaultValue={lesson.videoProvider ?? ''} className="h-12 w-full appearance-none rounded-xl border border-input bg-secondary px-4 text-[10px] font-black uppercase tracking-widest ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm">
                            <option value="">Auto-Detect Protocol</option>
                            <option value="youtube">YouTube Engine</option>
                            <option value="vimeo">Vimeo Engine</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
                <h2 className="text-lg font-black italic tracking-tight mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-amber-500" />
                    Temporal Sync
                </h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Ordinal</label>
                            <input name="order" type="number" min="1" required defaultValue={lesson.order} className="h-12 w-full rounded-xl border border-input bg-secondary px-4 text-xs font-black ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Secs</label>
                            <input name="duration" type="number" min="0" defaultValue={lesson.duration ?? ''} className="h-12 w-full rounded-xl border border-input bg-secondary px-4 text-xs font-black ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm" />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 group cursor-pointer p-2">
                        <div className="relative flex items-center">
                            <input name="isFree" type="checkbox" value="true" defaultChecked={lesson.isFree} className="peer h-5 w-5 rounded-lg border-2 border-border bg-card transition-all checked:bg-brand-500 checked:border-brand-500 focus:outline-none appearance-none" />
                            <CheckCircle className="absolute inset-0 m-auto text-white scale-0 peer-checked:scale-75 transition-transform" size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-brand-600 transition-colors">Grant Free Access</span>
                    </label>
                </div>
            </section>

            <button type="submit" className="w-full py-5 rounded-[2rem] bg-brand-500 text-white text-base font-black uppercase tracking-[0.2em] italic transition-all hover:bg-brand-700 active:scale-95 shadow-xl shadow-brand-500/20">
                Seal Modification
            </button>
        </aside>
      </form>
    </div>
  );
}

