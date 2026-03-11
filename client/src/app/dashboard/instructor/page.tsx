import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllCoursesForDashboard, getMyCourses } from '@/lib/course';
import { getCourseAnalytics } from '@/lib/analytics';
import StatCard from '@/components/StatCard';
import { Users, FileText, CheckCircle, Plus } from 'lucide-react';

export default async function InstructorDashboardPage() {
  const user = await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;

  const courses = user.role_type === 'instructor'
    ? await getMyCourses(jwt)
    : await getAllCoursesForDashboard(jwt, user.organization?.slug);
  
  const drafts = courses.filter((c) => !c.publishedAt);
  const published = courses.filter((c) => (c as any).publishedAt);

  // Fetch analytics for each course to get enrollment counts
  const orgSlug = user.organization?.slug || '';
  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      const stats = await getCourseAnalytics(course.documentId, jwt, orgSlug);
      return { ...course, stats };
    })
  );

  const totalEnrollments = coursesWithStats.reduce((acc, curr) => acc + (curr.stats?.enrollmentCount || 0), 0);

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Instructor Dashboard</h1>
          <p style={{ color: '#666' }}>
            Welcome, <strong>{user.username}</strong> &bull; {user.organization?.name}
          </p>
        </div>
        <a 
          href="/dashboard/courses/new" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '12px 24px', 
            background: '#111', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: 12,
            fontWeight: 600
          }}
        >
          <Plus size={18} />
          Create Course
        </a>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 24, 
        marginBottom: 40 
      }}>
        <StatCard 
          label="Total Enrollments" 
          value={totalEnrollments} 
          icon={<Users size={20} />} 
          color="#3b82f6"
        />
        <StatCard 
          label="Draft Courses" 
          value={drafts.length} 
          icon={<FileText size={20} />} 
          color="#f59e0b"
        />
        <StatCard 
          label="Published Courses" 
          value={published.length} 
          icon={<CheckCircle size={20} />} 
          color="#10b981"
        />
        <StatCard 
          label="Total Courses" 
          value={courses.length} 
          icon={<Plus size={20} />} 
          color="#8b5cf6"
        />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 'bold' }}>My Courses</h2>
          <div style={{ display: 'flex', gap: 12 }}>
             <a href="/dashboard/courses" style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none' }}>View All</a>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#666' }}>Course Title</th>
                <th style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#666' }}>Status</th>
                <th style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#666' }}>Enrollments</th>
                <th style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#666' }}>Completions</th>
                <th style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#666', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coursesWithStats.map((course) => (
                <tr key={course.documentId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600, color: '#111' }}>{course.title}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{course.level}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: 20, 
                      fontSize: 11, 
                      fontWeight: 600,
                      background: course.publishedAt ? '#ecfdf5' : '#fff7ed',
                      color: course.publishedAt ? '#059669' : '#d97706'
                    }}>
                      {course.publishedAt ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{course.stats?.enrollmentCount || 0}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{course.stats?.completionCount || 0}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <a href={`/dashboard/courses/${course.documentId}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
