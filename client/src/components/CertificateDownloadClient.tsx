'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { CertificateDocument } from './CertificateDocument';
import { Download, Printer, Loader2 } from 'lucide-react';

interface Props {
  data: {
    userName: string;
    courseTitle: string;
    issuedAt: string;
    certificateId: string;
    organizationName: string;
  };
}

export default function CertificateDownloadClient({ data }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {isClient ? (
          <PDFDownloadLink
            document={<CertificateDocument data={data} />}
            fileName={`Certificate-${data.courseTitle.replace(/\s+/g, '-')}.pdf`}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-brand-500 px-8 py-4 text-base font-black text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-600 hover:-translate-y-1 active:scale-95"
          >
            {({ loading }) => (
              <>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                {loading ? 'Preparing Certificate...' : 'Download Official PDF'}
              </>
            )}
          </PDFDownloadLink>
        ) : (
          <button className="inline-flex items-center justify-center gap-3 rounded-2xl bg-brand-200 px-8 py-4 text-base font-black text-white cursor-wait opacity-70">
            <Loader2 className="animate-spin" size={20} />
            Initializing...
          </button>
        )}

       
      </div>

      <div className="mt-12 hidden lg:block overflow-hidden rounded-[2.5rem] border border-border shadow-premium bg-muted/20">
         <div className="flex items-center gap-2 bg-muted/50 px-6 py-3 border-b border-border">
            <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-auto">Official Inspection Preview</span>
         </div>
         {isClient ? (
           <PDFViewer className="w-full h-[600px] border-none">
              <CertificateDocument data={data} />
           </PDFViewer>
         ) : (
           <div className="flex flex-col items-center justify-center h-[600px] gap-4">
              <Loader2 className="animate-spin text-brand-500" size={48} />
              <p className="text-sm font-bold text-muted-foreground italic uppercase tracking-widest">Loading Digital Inspection...</p>
           </div>
         )}
      </div>
    </div>
  );
}
