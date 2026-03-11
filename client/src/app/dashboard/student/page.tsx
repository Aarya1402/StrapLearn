import { getMyEnrollments, getCourseProgress } from '@/lib/course';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';
import StatCard from '@/components/StatCard';
import CourseProgressBar from '@/components/CourseProgressBar';
import { BookOpen, CheckCircle, GraduationCap, Clock } from 'lucide-react';

export default async function StudentDashboardPage() {
  const user = await requireAuth();
  const jwt = await getCurrentJwt();
  
  if (!jwt) return <div>Unauthorized</div>;

  const enrollments = await getMyEnrollments(jwt);
  
  // Fetch progress for each course
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (e: any) => {
      const progress = await getCourseProgress(e.course.documentId, jwt);
      return { ...e, progress };
    })
  );

  const completedCount = enrollments.filter((e: any) => e.isCompleted).length;
  const inProgressCount = enrollments.length - completedCount;

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#111' }}>
          Welcome back, {user.username}! 👋
        </h1>
        <p style={{ color: '#666', fontSize: 16 }}>
          Track your learning journey and pick up where you left off.
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 24, 
        marginBottom: 40 
      }}>
        <StatCard 
          label="Active Courses" 
          value={inProgressCount} 
          icon={<BookOpen size={20} />} 
          color="#3b82f6"
        />
        <StatCard 
          label="Completed" 
          value={completedCount} 
          icon={<CheckCircle size={20} />} 
          color="#10b981"
        />
        <StatCard 
          label="Knowledge Points" 
          value={completedCount * 100} 
          icon={<GraduationCap size={20} />} 
          color="#f59e0b"
        />
        <StatCard 
          label="Organization" 
          value={user.organization?.name ?? 'Personal'} 
          icon={<Clock size={20} />} 
          color="#8b5cf6"
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold' }}>Your Learning Progress</h2>
          <a href="/dashboard/student/courses" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>
            View All Courses
          </a>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
          {enrollmentsWithProgress.length > 0 ? (
            enrollmentsWithProgress.slice(0, 4).map((enrollment: any) => (
              <div key={enrollment.documentId} style={{ 
                padding: 24, 
                border: '1px solid #eee', 
                borderRadius: 16, 
                background: '#fff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>{enrollment.course.title}</h3>
                <CourseProgressBar percentage={enrollment.progress.percentage} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    {enrollment.progress.completedLessons} of {enrollment.progress.totalLessons} lessons
                  </span>
                  <a 
                    href={`/courses/${enrollment.course.slug}`} 
                    style={{ 
                      padding: '8px 16px', 
                      background: '#111', 
                      color: '#fff', 
                      textDecoration: 'none', 
                      borderRadius: 8, 
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    Continue
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', background: '#f9f9f9', borderRadius: 12 }}>
              <p style={{ color: '#666' }}>You haven't enrolled in any courses yet.</p>
              <a href="/courses" style={{ color: '#3b82f6', fontWeight: 'bold', display: 'inline-block', marginTop: 12 }}>Browse Courses</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
