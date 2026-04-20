import { getCourseBySlug, getQuizById, checkEnrollment } from '@/lib/course';
import { getCurrentJwt } from '@/lib/server-auth';
import { notFound, redirect } from 'next/navigation';
import QuizPlayer from '@/components/QuizPlayer';
import api from '@/lib/axios';

interface Props {
  params: Promise<{ slug: string; quizId: string }>;
}

export default async function QuizPage({ params }: Props) {
  const { slug, quizId } = await params;
  const jwt = await getCurrentJwt();

  const course = await getCourseBySlug(slug, jwt || undefined);
  if (!course) notFound();

  if (!jwt) redirect(`/login?callbackUrl=/courses/${slug}/quizzes/${quizId}`);

  // Access check
  const isEnrolled = await checkEnrollment(course.documentId, jwt);
  if (!isEnrolled) {
     try {
       const userRes = await api.get(`/users/me`, {
           headers: { Authorization: `Bearer ${jwt}` }
       });
       const user = userRes.data;
       const hasAccessRole = ['super_admin', 'org_admin', 'instructor'].includes(user.role_type);
       
       if (!hasAccessRole) {
          redirect(`/courses/${slug}?error=not-enrolled`);
       }
     } catch (error) {
       redirect(`/courses/${slug}?error=not-enrolled`);
     }
  }

  const quiz = await getQuizById(quizId, jwt);
  if (!quiz) notFound();

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <header style={{ marginBottom: 40 }}>
        <a href={`/courses/${slug}`} style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>
          ← Back to Course
        </a>
        <h1 style={{ marginTop: 16, fontSize: 32 }}>{quiz.title}</h1>
        <div style={{ display: 'flex', gap: 20, color: '#666', fontSize: 14, marginTop: 8 }}>
          <span>Passing Score: {quiz.passingScore}%</span>
          {quiz.timeLimit && <span>Time Limit: {quiz.timeLimit} minutes</span>}
        </div>
      </header>

      <QuizPlayer quiz={quiz} courseSlug={slug} />
    </div>
  );
}
