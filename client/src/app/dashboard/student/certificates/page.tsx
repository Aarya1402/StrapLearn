import { getMyCertificates } from '@/lib/course';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';
import { Award, FileText, Calendar, ExternalLink, ShieldCheck, Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CertificatesGalleryPage() {
  await requireAuth();
  const jwt = await getCurrentJwt();
  if (!jwt) redirect('/login');

  const certificates = await getMyCertificates(jwt);

  return (
    <div className="space-y-10 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl italic uppercase">
            My <span className="text-brand-600">Achievements</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
             Your verified professional credentials and academic milestones in one secure vault.
          </p>
        </div>

        {certificates.length > 0 && (
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-brand-50 border border-brand-100 shadow-sm">
            <Award className="text-brand-500" size={24} />
            <span className="text-xl font-black text-brand-600">{certificates.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">Credentials</span>
          </div>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border bg-muted/20 py-32 text-center shadow-inner">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-secondary text-muted-foreground/30 ring-1 ring-border shadow-premium">
            <Award size={48} />
          </div>
          <h3 className="text-2xl font-black italic tracking-tight text-foreground uppercase">Vault empty</h3>
          <p className="max-w-xs text-muted-foreground mt-4 font-medium mb-10 italic">
            Complete your enrolled courses to unlock official digital certificates and professional mastery badges.
          </p>
          <Link
            href="/dashboard/student/courses"
            className="inline-flex items-center justify-center rounded-2xl bg-foreground px-10 py-4 text-sm font-black uppercase tracking-widest text-background shadow-xl transition-all hover:bg-foreground/90 active:scale-95 italic"
          >
            Review Enrolled Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {certificates.map((cert: any) => (
            <Link
              key={cert.documentId}
              href={`/dashboard/student/certificates/${cert.certificateId}`}
              className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-premium transition-all duration-300 hover:-translate-y-2 hover:shadow-premium-hover border-b-8 border-b-brand-500/10 hover:border-b-brand-500"
            >
              <div className="absolute top-0 right-0 p-8 text-brand-500/5 group-hover:text-brand-500/10 transition-colors">
                 <ShieldCheck size={120} strokeWidth={1} />
              </div>

              <div className="flex flex-1 flex-col p-10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white shadow-sm ring-1 ring-brand-500/10">
                  <Award size={28} />
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-2xl font-black leading-tight text-foreground group-hover:text-brand-600 transition-colors uppercase italic truncate">
                    {cert.course?.title}
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Calendar size={14} className="text-blue-500" />
                      Issued: {new Date(cert.issuedAt).toLocaleDateString(undefined, { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      ID: {cert.certificateId}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-6">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 italic">Verified Credential</span>
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground transition-all group-hover:bg-brand-500 group-hover:text-white group-hover:rotate-12">
                      <ExternalLink size={18} />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
