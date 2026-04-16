'use client';

import { useState } from 'react';
import { registerAction } from '@/actions/auth.actions';
import type { Organization } from '@/lib/organization';
import { User, Mail, Lock, ShieldCheck, Building2, UserPlus, ArrowRight } from 'lucide-react';

interface Props {
  organizations: Organization[];
}

export default function RegisterForm({ organizations }: Props) {
  const [role, setRole] = useState('student');

  const inputClasses = "flex h-11 w-full rounded-xl border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:border-brand-500 transition-all";
  const iconClasses = "absolute left-3 top-3 h-4 w-4 text-muted-foreground";
  const labelClasses = "text-sm font-medium leading-none mb-2 block";

  return (
    <form
      action={async (formData: FormData) => {
        await registerAction({
          username: formData.get('username') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          role_type: formData.get('role_type') as any,
          organization: formData.get('organization') as string,
        });
      }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      <div className="space-y-2">
        <label className={labelClasses} htmlFor="username">Username</label>
        <div className="relative">
          <User className={iconClasses} />
          <input id="username" name="username" type="text" placeholder="johndoe" required className={inputClasses} />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClasses} htmlFor="email">Email address</label>
        <div className="relative">
          <Mail className={iconClasses} />
          <input id="email" name="email" type="email" placeholder="john@example.com" required className={inputClasses} />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClasses} htmlFor="password">Password</label>
        <div className="relative">
          <Lock className={iconClasses} />
          <input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} className={inputClasses} />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClasses} htmlFor="role_type">I am a...</label>
        <div className="relative">
          <ShieldCheck className={iconClasses} />
          <select 
            id="role_type"
            name="role_type" 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`${inputClasses} appearance-none`}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="org_admin">Org Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {role !== 'super_admin' && (
        <div className="space-y-2 sm:col-span-2">
          <label className={labelClasses} htmlFor="organization">Organization</label>
          <div className="relative">
            <Building2 className={iconClasses} />
            <select id="organization" name="organization" required className={`${inputClasses} appearance-none`}>
              <option value="">Select your organization...</option>
              {organizations.map((org) => (
                <option key={org.documentId} value={org.documentId}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="pt-2 sm:col-span-2">
        <button
          type="submit"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-brand-600 hover:shadow-lg active:scale-[0.98] shadow-brand-500/20"
        >
          <UserPlus size={18} />
          Create Account
          <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
}

