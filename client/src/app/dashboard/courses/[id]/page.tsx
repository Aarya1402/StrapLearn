import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getCourseById, getCategories } from '@/lib/course';
import {
  updateCourseAction,
  publishCourseAction,
  unpublishCourseAction,
} from '@/actions/course.actions';
import {
  createLessonAction,
  updateLessonAction,
  deleteLessonAction,
} from '@/actions/lesson.actions';
import { notFound } from 'next/navigation';
import type { Lesson } from '@/lib/types/course';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Props { params: Promise<{ id: string }> }

export default async function EditCoursePage({ params }: Props) {
  const user = await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;
  const { id: documentId } = await params;

  const [course, categories] = await Promise.all([
    getCourseById(documentId, jwt),
    getCategories(),
  ]);

  if (!course) notFound();

  const isAdmin = user.role_type === 'org_admin';
  const lessons: Lesson[] = course.lessons ?? [];

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 700 }}>
      <a href="/dashboard/courses">← Back to courses</a>
      <h1>Edit: {course.title}</h1>
      <p>Status: {course.publishedAt ? '✅ Published' : '📝 Draft'}
        {' '}&bull;{' '}{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
      </p>
      <hr />

      {/* ── Course Edit Form ── */}
      <form action={updateCourseAction.bind(null, documentId)}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label>Title *
          <input name="title" type="text" required defaultValue={course.title}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label>Description *
          <textarea name="description" required rows={4} defaultValue={course.description}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label>Thumbnail
          {course.thumbnail?.url && (
            <img src={`${STRAPI_URL}${course.thumbnail.url}`} alt="thumb"
              style={{ height: 60, display: 'block', marginTop: 6, borderRadius: 4 }} />
          )}
          <input name="thumbnail" type="file" accept="image/*"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label>Level *
          <select name="level" defaultValue={course.level}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>Duration (minutes)
          <input name="duration" type="number" min="0" defaultValue={course.duration ?? ''}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label>Category
          <select name="categoryId" defaultValue={course.category?.documentId ?? ''}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
            <option value="">— None —</option>
            {categories.map((cat) => (
              <option key={cat.documentId} value={cat.documentId}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </label>
        <label>Pricing
          <select name="isFree" defaultValue={course.isFree ? 'true' : 'false'}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
            <option value="false">Paid</option>
            <option value="true">Free</option>
          </select>
        </label>
        <label>Price ($)
          <input name="price" type="number" min="0" step="0.01" defaultValue={course.price ?? ''}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <button type="submit"
          style={{ padding: '10px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Save Course
        </button>
      </form>

      {/* ── Publish controls (org_admin only) ── */}
      {isAdmin && (
        <>
          <hr style={{ margin: '24px 0' }} />
          <h3>Publication</h3>
          {course.publishedAt ? (
            <form action={unpublishCourseAction.bind(null, documentId)}>
              <button type="submit"
                style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Unpublish
              </button>
            </form>
          ) : (
            <form action={publishCourseAction.bind(null, documentId)}>
              <button type="submit"
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>
                ✅ Publish Course
              </button>
            </form>
          )}
        </>
      )}

      {/* ── Lessons Management ── */}
      <hr style={{ margin: '32px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Lessons ({lessons.length})</h2>
      </div>

      {/* Existing lessons */}
      {lessons.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: 6 }}>#</th>
              <th style={{ padding: 6 }}>Title</th>
              <th style={{ padding: 6 }}>Video</th>
              <th style={{ padding: 6 }}>Preview</th>
              <th style={{ padding: 6 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.documentId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 6 }}>{lesson.order}</td>
                <td style={{ padding: 6 }}>{lesson.title}</td>
                <td style={{ padding: 6, fontSize: 12, color: lesson.videoUrl ? '#10b981' : '#ccc' }}>
                  {lesson.videoUrl ? '▶ Yes' : '—'}
                </td>
                <td style={{ padding: 6 }}>{lesson.isFree ? '🆓' : '🔒'}</td>
                <td style={{ padding: 6, display: 'flex', gap: 8 }}>
                  <a href={`/dashboard/courses/${documentId}/lessons/${lesson.documentId}`}
                    style={{ color: '#3b82f6', fontSize: 13 }}>Edit</a>
                  <form action={deleteLessonAction.bind(null, lesson.documentId, documentId)}
                    style={{ display: 'inline' }}>
                    <button type="submit"
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add new lesson form */}
      <h3 style={{ marginTop: 24 }}>+ Add Lesson</h3>
      <form action={createLessonAction.bind(null, documentId)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>Lesson Title *
          <input name="title" type="text" required placeholder="e.g. Introduction"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label>Content (text)
          <textarea name="content" rows={4} placeholder="Lesson text content..."
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label>Video URL (YouTube/Vimeo)
          <input name="videoUrl" type="url" placeholder="https://youtube.com/watch?v=..."
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label>Video Provider
          <select name="videoProvider" style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
            <option value="">— Auto-detect —</option>
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
          </select>
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{ flex: 1 }}>Order *
            <input name="order" type="number" min="1" defaultValue={lessons.length + 1}
              style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
          </label>
          <label style={{ flex: 1 }}>Duration (seconds)
            <input name="duration" type="number" min="0"
              style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
          </label>
        </div>
        <label>
          <input name="isFree" type="checkbox" value="true" />
          {' '} Free preview (accessible without enrollment)
        </label>
        <button type="submit"
          style={{ padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Add Lesson
        </button>
      </form>
    </div>
  );
}
