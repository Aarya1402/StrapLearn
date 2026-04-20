import { getCertificateByVerificationId } from '@/lib/course';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';
import { notFound, redirect } from 'next/navigation';
import CertificateDownloadClient from '@/components/CertificateDownloadClient';
import { Award, ShieldCheck, ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';

interface Props { params: Promise<{ id: string }> }

export default async function CertificatePage({ params }: Props) {
  const { id } = await params;
  await requireAuth();
  const jwt = await getCurrentJwt();
  if (!jwt) redirect('/login');

  const certificate = await getCertificateByVerificationId(id, jwt);
  if (!certificate) notFound();

  const data = {
    userName: certificate.user?.username || 'Learner',
    courseTitle: certificate.course?.title || 'Academic Course',
    issuedAt: certificate.issuedAt,
    certificateId: certificate.certificateId,
    organizationName: certificate.course?.organization?.name || 'LMS Academy'
  };
  console.log(certificate)
  return (
    <div className="mx-auto max-w-5xl py-12 px-6">
      <Link 
        href="/dashboard/student/certificates" 
        className="group inline-flex items-center gap-2 text-sm font-black text-muted-foreground transition-all hover:text-brand-600 mb-12"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        My Certificates Vault
      </Link>

      <div className="text-center mb-16 space-y-4">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-brand-50 text-brand-500 shadow-premium ring-1 ring-brand-500/20">
          <Award size={40} />
        </div>
        <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl italic uppercase">
          Credential <span className="text-brand-600">Verification</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed mt-6">
          This digital credential confirms that <span className="text-foreground font-black italic uppercase">{data.userName}</span> has attained professional mastery in <span className="text-foreground font-black italic uppercase">{data.courseTitle}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-emerald-50/50 border border-emerald-100 flex items-center gap-6 shadow-sm">
            <ShieldCheck size={32} className="text-emerald-500" />
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">Security Status</div>
                <div className="text-base font-black text-emerald-700">Verified & Authenticated</div>
            </div>
        </div>
        <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-blue-50/50 border border-blue-100 flex items-center gap-6 shadow-sm">
            <Globe size={32} className="text-blue-500" />
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-600/70">Visibility</div>
                <div className="text-base font-black text-blue-700">Publicly Sharable Link</div>
            </div>
        </div>
        <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-brand-50/50 border border-brand-100 flex items-center gap-6 shadow-sm">
            <Award size={32} className="text-brand-500" />
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-brand-600/70">Credits Earned</div>
                <div className="text-base font-black text-brand-700">Level: {certificate.course?.level || 'Standard'}</div>
            </div>
        </div>
      </div>

      <div className="rounded-[3rem] border border-border bg-card p-4 shadow-2xl relative">
        <CertificateDownloadClient data={data} />
      </div>
      
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
            System Hash: {certificate.documentId}
        </div>
      </div>
    </div>
  );
}
