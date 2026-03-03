import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getCourseById, getCategories } from '@/lib/course';
import { updateCourseAction, publishCourseAction, unpublishCourseAction } from '@/actions/course.actions';
import { notFound } from 'next/navigation';

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

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 600 }}>
      <a href="/dashboard/courses">← Back to courses</a>
      <h1>Edit: {course.title}</h1>
      <p>Status: {course.publishedAt ? '✅ Published' : '📝 Draft'}</p>
      <hr />

      <form action={updateCourseAction.bind(null, documentId)} encType="multipart/form-data"
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <label>
          Title *
          <input name="title" type="text" required defaultValue={course.title}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>
          Description *
          <textarea name="description" required rows={5} defaultValue={course.description}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>
          Thumbnail
          {course.thumbnail?.url && (
            <div style={{ margin: '8px 0' }}>
              <img src={`${STRAPI_URL}${course.thumbnail.url}`} alt="thumbnail"
                style={{ height: 80, objectFit: 'cover', borderRadius: 4 }} />
              <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0' }}>Upload to replace</p>
            </div>
          )}
          <input name="thumbnail" type="file" accept="image/*"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>
          Level *
          <select name="level" defaultValue={course.level}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label>
          Duration (minutes)
          <input name="duration" type="number" min="0" defaultValue={course.duration ?? ''}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>
          Category
          <select name="categoryId" defaultValue={course.category?.documentId ?? ''}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
            <option value="">— None —</option>
            {categories.map((cat) => (
              <option key={cat.documentId} value={cat.documentId}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </label>

        <label>
          Pricing
          <select name="isFree" defaultValue={course.isFree ? 'true' : 'false'}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
            <option value="false">Paid</option>
            <option value="true">Free</option>
          </select>
        </label>

        <label>
          Price ($)
          <input name="price" type="number" min="0" step="0.01" defaultValue={course.price ?? ''}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <button type="submit"
          style={{ padding: '10px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Save Changes
        </button>
      </form>

      {/* Publish controls — org_admin only */}
      {isAdmin && (
        <>
          <hr style={{ margin: '24px 0' }} />
          <h3>Publication</h3>
          {course.publishedAt ? (
            <form action={unpublishCourseAction.bind(null, documentId)}>
              <button type="submit"
                style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Unpublish (move back to draft)
              </button>
            </form>
          ) : (
            <form action={publishCourseAction.bind(null, documentId)}>
              <button type="submit"
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Publish Course ✅
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
