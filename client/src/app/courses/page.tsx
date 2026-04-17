import { searchCourses, getCategories } from '@/lib/course';
import { getCurrentUser } from '@/lib/server-auth';
import type { Course, Category } from '@/lib/types/course';
import { BookOpen } from 'lucide-react';
import { CourseCatalog } from '@/components/CourseCatalog';

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const orgSlug = user?.organization?.slug;

  const [courses, categories] = await Promise.all([
    searchCourses({
      query: params.q as string,
      level: params.level as string,
      category: params.category as string,
      isFree: params.free as string,
      sort: params.sort as string,
      orgSlug,
    }),
    getCategories()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-border pb-10">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl uppercase italic">
          {user?.organization?.name || 'Global'} Learning <span className="text-brand-600">Catalog</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Unlock your potential with industry-standard courses designed by leading experts{user?.organization?.name ? ` at ${user.organization.name}` : ''}.
        </p>
      </div>

      <CourseCatalog 
        courses={courses} 
        categories={categories} 
      />
    </div>
  );
}

