"use client";

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    username: string;
    role_type: string;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background/80 backdrop-blur-md text-foreground transition-colors duration-500">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-72 overflow-hidden">
        <TopNav user={user} />

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
