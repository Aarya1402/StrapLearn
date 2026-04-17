import { getMyEnrollments, getCourseProgress, getQuizAttempts } from '@/lib/course';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';
import CourseProgressBar from '@/components/CourseProgressBar';
import { BookOpen, Award, CheckCircle2, ArrowRight, BarChart3 } from 'lucide-react';
import { Enrollment } from '@/lib/types/course';
import Link from 'next/link';

export default async function ProgressPage() {
  await requireAuth();
  const jwt = await getCurrentJwt();
  
  if (!jwt) return null;

  const enrollments = await getMyEnrollments(jwt);

  // Fetch progress for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment: Enrollment) => {
      if (!enrollment.course) return { ...enrollment, progress: { percentage: 0 } };
      const progress = await getCourseProgress(enrollment.course.documentId, jwt);
      
      let highestScore: number | null = null;
      let bestAttemptId: string | null = null;
      let quizId: string | null = null;

      if (enrollment.isCompleted && enrollment.course.quizzes?.length > 0) {
        for (const quiz of enrollment.course.quizzes) {
          const attempts = await getQuizAttempts(quiz.documentId, jwt);
          if (attempts.length > 0) {
            quizId = quiz.documentId; // Store the quiz ID
          }
          for (const attempt of attempts) {
            if (highestScore === null || attempt.score > highestScore) {
              highestScore = attempt.score;
              bestAttemptId = attempt.documentId;
            }
          }
        }
      }

      return { ...enrollment, progress, highestScore, bestAttemptId, quizId };
    })
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Learning Progress</h1>
        <p className="text-muted-foreground text-lg">Detailed breakdown of your academic achievements and milestones.</p>
      </div>
      
      {enrollmentsWithProgress.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <BarChart3 size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No progress data yet</h3>
          <p className="max-w-xs text-muted-foreground mb-8">
            Start learning a course to see your detailed progress here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {enrollmentsWithProgress.map((item) => {
            const course = item.course;
            if (!course) return null;
            const progress = item.progress;

            return (
              <div
                key={item.documentId}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-premium transition-all duration-300 hover:shadow-premium-hover hover:-translate-y-1"
              >
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight group-hover:text-brand-600 transition-colors">
                          {course.title}
                        </h2>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 size={14} className={item.isCompleted ? 'text-emerald-500' : 'text-amber-500'} />
                          {item.isCompleted ? 'Finished' : 'In Progress'}
                          <span>•</span>
                          <span>Enrolled {new Date(item.enrolledAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/courses/${course.slug}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-all hover:bg-foreground/90 active:scale-95 shadow-lg shadow-foreground/5"
                      >
                        {item.isCompleted ? 'Review' : 'Continue'}
                        <ArrowRight size={16} />
                      </Link>
                    </div>

                    <div className="max-w-2xl">
                      <CourseProgressBar percentage={progress.percentage} />
                      <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-brand-500" />
                          <span>
                            <strong className="text-foreground">{progress.completedLessons}</strong> of <strong className="text-foreground">{progress.totalLessons}</strong> lessons
                          </span>
                        </div>
                        
                        {item.isCompleted && (
                          <div className="flex items-center gap-2">
                            <Award size={16} className="text-emerald-500" />
                            {item.quizId ? (
                              <Link href={`/test/quizzes/${item.quizId}/attempts`} className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                                Highest Score: {item.highestScore}%
                              </Link>
                            ) : (
                              <span className="font-bold text-emerald-600">
                                Course Completed
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

