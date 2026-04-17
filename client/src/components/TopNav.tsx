"use client";

import React from 'react';
import { CircleUser } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';

interface TopNavProps {
  user: {
    username: string;
    role_type: string;
  };
}

export function TopNav({ user }: TopNavProps) {


  const getRoleLabel = () => {
    switch (user.role_type) {
        case 'super_admin': return 'Super Authority';
        case 'org_admin': return 'Org Administrator';
        case 'instructor': return 'Certified Educator';
        case 'student': return 'Scholar';
        default: return 'User';
    }
  }

  const getStatusColor = user.role_type === 'super_admin' ? 'bg-red-500' : 'bg-emerald-500';

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background/80 px-10 backdrop-blur-md lg:px-12">
      {/* Mobile Branding (Visible only on small screens) */}
      <div className="lg:hidden flex items-center gap-3">
         <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-lg">S</div>
         <span className="text-lg font-black tracking-tight italic">StrapLearn</span>
      </div>

      {/* Search Bar / Status Protocol */}
      <div className="hidden lg:block">
        
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
         <NotificationCenter />
         <ThemeToggle />
         
         <div className="hidden flex-col items-end md:flex">
            <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${getStatusColor} animate-pulse`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{getRoleLabel()}</span>
            </div>
            <span className="text-xs font-black text-brand-600 italic leading-none mt-1 uppercase">{user.username}</span>
         </div>

         <div className="h-10 w-10 rounded-2xl bg-brand-500/10 p-1 border border-brand-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
               <CircleUser size={20} />
            </div>
         </div>
      </div>
    </header>
  );
}
