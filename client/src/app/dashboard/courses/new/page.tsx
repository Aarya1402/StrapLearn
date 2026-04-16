import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getCategories, getOrgInstructors } from '@/lib/course';
import { createCourseAction } from '@/actions/course.actions';
import { 
  ArrowLeft, 
  BookOpen, 
  Sparkles, 
  Clock, 
  Layers, 
  Wallet, 
  UserCircle,
  UploadCloud,
  ChevronRight,
  Info
} from 'lucide-react';

export default async function NewCoursePage() {
  const user = await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;

  const categories = await getCategories();

  // Fetch org's instructors only when the current user is an org_admin
  const isAdmin = user.role_type === 'org_admin';
  const orgInstructors = isAdmin && user.organization?.documentId
      ? await getOrgInstructors(user.organization.documentId, jwt)
      : [];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <a 
            href="/dashboard/courses" 
            className="group inline-flex items-center gap-2 text-sm font-black text-muted-foreground transition-all hover:text-brand-600 mb-4"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Catalog
          </a>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl italic uppercase">
            Create <span className="text-brand-600">New Curriculum</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Architect a new learning experience for your academic community.
          </p>
        </div>

        <div className={`
          rounded-[2rem] border p-6 max-w-xs shadow-sm
          ${isAdmin ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-brand-50 border-brand-100 text-brand-800'}
        `}>
          <div className="flex items-start gap-4">
             <div className={`p-2 rounded-xl scale-110 ${isAdmin ? 'bg-emerald-500 text-white' : 'bg-brand-500 text-white'}`}>
                <Info size={16} />
             </div>
             <p className="text-[11px] font-black uppercase tracking-[0.1em] leading-relaxed italic">
               {isAdmin 
                 ? "Administrative bypass: This course will be published immediately to the global catalog." 
                 : "Draft Submission: Your curriculum requires institutional approval before public broadcasting."}
             </p>
          </div>
        </div>
      </div>

      <form action={createCourseAction} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Core Content */}
          <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
            <h2 className="text-xl font-black italic tracking-tight mb-8 flex items-center gap-3">
              <BookOpen size={20} className="text-brand-500" />
              Primary Specifications
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Curriculum Title</label>
                <input 
                  name="title" 
                  type="text" 
                  required 
                  placeholder="e.g. Quantum Computing: The Architecture of Future..."
                  className="h-14 w-full rounded-2xl border border-input bg-secondary px-6 text-sm font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Intellectual Description</label>
                <textarea 
                  name="description" 
                  required 
                  rows={6} 
                  placeholder="Compose a compelling vision for what learners will achieve..."
                  className="w-full rounded-[2rem] border border-input bg-secondary p-6 text-sm font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm"
                />
              </div>
            </div>
          </section>

          {/* Media & Instructors */}
          <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
            <h2 className="text-xl font-black italic tracking-tight mb-8 flex items-center gap-3">
              <UploadCloud size={20} className="text-blue-500" />
              Visual Identity & Faculty
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Cover Asset (Thumbnail)</label>
                <div className="relative group">
                   <input 
                    name="thumbnail" 
                    type="file" 
                    accept="image/*"
                    className="h-14 w-full rounded-2xl border border-input bg-secondary px-6 text-xs font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-brand-500 file:text-white hover:file:bg-brand-600 shadow-sm"
                  />
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Assigned Professor</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                    <select 
                      name="instructorId" 
                      className="h-14 w-full appearance-none rounded-2xl border border-input bg-secondary pl-12 pr-6 text-sm font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm"
                    >
                      <option value="">Myself ({user.username})</option>
                      {orgInstructors.map((inst) => (
                          <option key={inst.documentId} value={inst.documentId}>
                              {inst.username}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          {/* Metadata Sidebar */}
          <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
            <h2 className="text-lg font-black italic tracking-tight mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              Technical Meta
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Complexity Level</label>
                <div className="relative">
                   <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                   <select 
                    name="level" 
                    className="h-12 w-full appearance-none rounded-xl border border-input bg-secondary pl-12 pr-6 text-xs font-black uppercase tracking-widest ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm"
                   >
                      <option value="beginner">Beginner Phase</option>
                      <option value="intermediate">Intermediate Level</option>
                      <option value="advanced">Advanced Mastery</option>
                   </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Temporal Duration (Min)</label>
                <div className="relative">
                   <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                   <input 
                    name="duration" 
                    type="number" 
                    defaultValue="60"
                    className="h-12 w-full rounded-xl border border-input bg-secondary pl-12 pr-6 text-xs font-black ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Discipline Category</label>
                <div className="relative">
                   <select 
                    name="categoryId" 
                    className="h-12 w-full appearance-none rounded-xl border border-input bg-secondary px-6 text-xs font-black uppercase tracking-widest ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm"
                   >
                      <option value="">Uncategorized</option>
                      {categories.map((cat) => (
                          <option key={cat.documentId} value={cat.documentId}>{cat.name}</option>
                      ))}
                   </select>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Sidebar */}
          <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
            <h2 className="text-lg font-black italic tracking-tight mb-6 flex items-center gap-2">
              <Wallet size={18} className="text-emerald-500" />
              Financial Model
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Access Protocol</label>
                 <select 
                    name="isFree" 
                    className="h-12 w-full rounded-xl border border-input bg-secondary px-6 text-xs font-black uppercase tracking-widest ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm"
                  >
                        <option value="false">Paid Subscription</option>
                        <option value="true">Open Enrollment (Free)</option>
                  </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Subscription Price (₹)</label>
                <input 
                  name="price" 
                  type="number" 
                  defaultValue="0"
                  step="0.01" 
                  className="h-12 w-full rounded-xl border border-input bg-secondary px-6 text-xs font-black ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:border-brand-500 shadow-sm"
                />
              </div>
            </div>
          </section>

          <button 
            type="submit"
            className={`
              w-full rounded-[2rem] py-5 text-base font-black uppercase tracking-[0.2em] italic transition-all active:scale-95 shadow-xl
              ${isAdmin ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20'}
            `}
          >
            {isAdmin ? '🚀 Broadcast Live' : '💾 Seal Draft'}
          </button>
        </aside>
      </form>
    </div>
  );
}

