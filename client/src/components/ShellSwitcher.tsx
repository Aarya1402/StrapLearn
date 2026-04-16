"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { DashboardShell } from '@/components/DashboardShell';

interface ShellSwitcherProps {
  children: React.ReactNode;
  user: {
    username: string;
    role_type: string;
  } | null;
}

export function ShellSwitcher({ children, user }: ShellSwitcherProps) {
  const pathname = usePathname();

  // Public routes that should NEVER have the sidebar regardless of auth state
  const publicRoutes = ['/', '/login', '/register'];
  
  // If no user is logged in, or we are on a public route, just show children
  if (!user || publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Check if we are already in a dashboard route (they already have DashboardShell in their local layouts)
  // Wait, if I add it here, I should remove it from the local layouts to avoid nesting.
  // Actually, it's better to HAVE it here and REMOVE it from sub-layouts.
  // BUT the sub-layouts do the `requireRole` check which is important.
  
  // Alternative: Only show it here for routes that AREN'T in /dashboard but are authenticated
  // such as /courses/[slug] or /courses/[slug]/lessons/[lessonSlug]
  
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  if (isDashboardRoute) {
    // Sub-layouts in /dashboard already handle the shell for now.
    // To avoid refactoring every layout, I'll only apply it to NON-dashboard routes for now.
    // Actually, it's cleaner to have ONE ShellSwitcher.
    return <>{children}</>;
  }

  // For authenticated users on non-dashboard, non-public routes (like course viewer)
  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
