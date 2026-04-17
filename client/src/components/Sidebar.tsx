"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  LogOut, 
  Users, 
  BookMarked,
  Activity,
  Layers,
  Terminal,
  PieChart,
  TrendingUp,
  Compass,
  LayoutGrid,
  Building,
  ArrowRight
} from 'lucide-react';
import { logoutAction } from '@/actions/auth.actions';

interface navItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  user: {
    username: string;
    role_type: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const getNavItems = (): navItem[] => {
    switch (user.role_type) {
      case 'super_admin':
        return [
          { label: 'Intelligence', href: '/dashboard/super', icon: <Activity size={18} /> },
          { label: 'Tenants', href: '/dashboard/super/organizations', icon: <Layers size={18} /> },
          { label: 'Global Directory', href: '/dashboard/super/users', icon: <Users size={18} /> },
          { label: 'Core Config', href: '/dashboard/super/settings', icon: <Terminal size={18} /> },
        ];
      case 'org_admin':
        return [
          { label: 'Control Center', href: '/dashboard/admin', icon: <LayoutGrid size={20} /> },
          { label: 'User Directory', href: '/dashboard/admin/users', icon: <Users size={20} /> },
          { label: 'Curriculum Catalog', href: '/dashboard/courses', icon: <BookMarked size={20} /> },
          { label: 'Organization Identity', href: '/dashboard/admin/settings', icon: <Building size={20} /> },
          { label: 'Account Security', href: '/dashboard/profile', icon: <Settings size={20} /> },
        ];
      case 'instructor':
        return [
          { label: 'Performance', href: '/dashboard/instructor', icon: <PieChart size={20} /> },
          { label: 'My Curriculum', href: '/dashboard/courses?filter=my', icon: <BookMarked size={20} /> },
          { label: 'Lesson Vault', href: '/dashboard/instructor/lessons', icon: <BookOpen size={20} /> },
          { label: 'Account Security', href: '/dashboard/profile', icon: <Settings size={20} /> },
        ];
      case 'student':
        return [
          { label: 'Campus Home', href: '/dashboard/student', icon: <LayoutDashboard size={20} /> },
          { label: 'Enrolled Courses', href: '/dashboard/student/courses', icon: <BookOpen size={20} /> },
          { label: 'Learning Velocity', href: '/dashboard/student/progress', icon: <TrendingUp size={20} /> },
          { label: 'Global Catalog', href: '/courses', icon: <Compass size={20} /> },
          { label: 'Account Security', href: '/dashboard/profile', icon: <Settings size={20} /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const brandColor = user.role_type === 'super_admin' ? 'text-red-500' : 'text-brand-600';
  const brandBg = user.role_type === 'super_admin' ? 'bg-foreground text-background' : 'bg-brand-500 text-white';

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-border bg-card shadow-sm transition-transform lg:translate-x-0 overflow-y-auto">
      <div className="flex h-full flex-col px-6 py-8">
        {/* Brand */}
        <div className="mb-12 px-2 flex items-center gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl font-black text-xl shadow-lg ${brandBg}`}>
            S
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight leading-none italic uppercase">StrapLearn</span>
            <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${brandColor}`}>
              {user.role_type.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <h3 className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Navigation Scope</h3>
          {navItems.map((item) => {
            // High-precision active state: Match exact or check if it's the longest matching prefix
            const isActive = pathname === item.href || (
              pathname.startsWith(item.href + '/') && 
              !navItems.some(ni => ni.href !== item.href && pathname.startsWith(ni.href) && ni.href.length > item.href.length)
            );
            return (
              <a
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300
                  ${isActive 
                    ? "bg-secondary text-brand-600 shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-brand-600"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? "text-brand-500" : "text-muted-foreground group-hover:text-brand-500"} transition-colors`}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
                <ArrowRight size={14} className={`transition-all ${isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
              </a>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="mt-8 border-t border-border pt-8">
          <a 
            href="/dashboard/profile"
            className="mb-6 flex items-center gap-4 px-2 py-3 rounded-2xl transition-all duration-300 hover:bg-secondary group cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-brand-500/10 bg-brand-50 p-1 dark:bg-brand-900/20 group-hover:scale-105 transition-transform">
              <div className={`flex h-full w-full items-center justify-center rounded-xl font-bold text-xs uppercase ${brandBg}`}>
                {user.username.charAt(0)}
              </div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-black text-foreground italic group-hover:text-brand-600 transition-colors">{user.username}</span>
              <span className="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground">My Profile Settings</span>
            </div>
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 transition-all duration-300 hover:bg-red-50 hover:text-red-700 active:scale-[0.98]"
            >
              <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
              Terminate Session
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
