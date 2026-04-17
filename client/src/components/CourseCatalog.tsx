'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Loader2, BookOpen, X } from 'lucide-react';
import type { Course, Category } from '@/lib/types/course';
import { CourseCard } from './CourseCard';

interface CourseCatalogProps {
  courses: Course[];
  categories: Category[];
}

export function CourseCatalog({ courses, categories }: CourseCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for immediate UI feedback while typing
  const [query, setQuery] = useState(searchParams.get('q') || '');

  // Synchronize URL when filters change
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Debounced search for query only
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (searchParams.get('q') || '')) {
        updateFilters({ q: query || null });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const clearFilters = () => {
    setQuery('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = searchParams.toString().length > 0 || query;

  return (
    <div className="mt-12 space-y-10">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Search Catalog</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-500" size={20} />
            <input
              type="text"
              placeholder="What do you want to learn today?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-4 outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            {isPending && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-brand-500" size={20} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:flex lg:items-end">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Level</label>
            <select
              value={searchParams.get('level') || 'all'}
              onChange={(e) => updateFilters({ level: e.target.value })}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2 outline-none focus:border-brand-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Category</label>
            <select
              value={searchParams.get('category') || 'all'}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2 outline-none focus:border-brand-500"
            >
              <option value="all">All Topics</option>
              {categories.map((cat) => (
                <option key={cat.documentId} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Price</label>
            <select
              value={searchParams.get('free') || 'all'}
              onChange={(e) => updateFilters({ free: e.target.value })}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2 outline-none focus:border-brand-500"
            >
              <option value="all">Any Price</option>
              <option value="true">Free Content</option>
              <option value="false">Premium</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sort By</label>
            <select
              value={searchParams.get('sort') || 'newest'}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2 outline-none focus:border-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>

          <div className="flex items-end pb-[2px]">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-bold transition-all hover:bg-secondary disabled:opacity-0 lg:w-auto"
            >
              <X size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-sm font-bold text-muted-foreground italic">
          {isPending ? 'Searching...' : `Showing ${courses.length} courses`}
        </h2>
      </div>

      {/* Grid */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary text-muted-foreground">
            <BookOpen size={48} />
          </div>
          <h2 className="text-2xl font-bold">No courses match your criteria</h2>
          <p className="mt-2 text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.documentId} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
