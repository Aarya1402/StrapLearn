"use client";

import React, { useState } from 'react';
import { updateProfileAction } from '@/actions/auth.actions';
import { User, Mail, Shield, Building, Save, Loader2, KeyRound } from 'lucide-react';
import { StrapiUser } from '@/lib/types/auth';

interface ProfileSettingsFormProps {
  user: StrapiUser;
  jwt: string;
}

export default function ProfileSettingsForm({ user, jwt }: ProfileSettingsFormProps) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const data: { username: string; password?: string } = { username };
      if (password) data.password = password;

      await updateProfileAction(user.id, jwt, data);
      setMessage({ type: 'success', text: 'Profile updated successfully. Changes reflected globally.' });
      setPassword('');
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-2xl text-sm font-black uppercase tracking-widest ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Non-Editable Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 opacity-60">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Mail size={12} /> Email Address (Read-only)
            </label>
            <div className="h-12 w-full rounded-2xl bg-secondary px-4 flex items-center text-sm font-bold text-muted-foreground border border-border/50">
              {user.email}
            </div>
          </div>

          <div className="space-y-2 opacity-60">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Shield size={12} /> Authority Role (Read-only)
            </label>
            <div className="h-12 w-full rounded-2xl bg-secondary px-4 flex items-center text-sm font-bold text-muted-foreground border border-border/50 uppercase tracking-widest">
              {user.role_type.replace('_', ' ')}
            </div>
          </div>

          {user.organization && (
            <div className="space-y-2 opacity-60 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Building size={12} /> Institutional Affiliation (Read-only)
              </label>
              <div className="h-12 w-full rounded-2xl bg-secondary px-4 flex items-center text-sm font-bold text-muted-foreground border border-border/50">
                {user.organization.name}
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-border/50 w-full" />

        {/* Section 2: Editable Identity */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <User size={12} /> Identity Username
            </label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <KeyRound size={12} /> Reset Cryptographic Key (Password)
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4"
            />
            <p className="text-[10px] text-muted-foreground/60 italic px-2">Leave blank to maintain current security credentials.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-500 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-600 hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
        >
          {isUpdating ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Save size={18} />
              Synchronize Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}
