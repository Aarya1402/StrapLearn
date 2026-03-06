import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { updateLessonAction } from '@/actions/lesson.actions';
import { notFound } from 'next/navigation';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Props { params: Promise<{ id: string; lessonId: string }> }

export default async function EditLessonPage({ params }: Props) {
  await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;
  const { id: courseDocumentId, lessonId: lessonDocumentId } = await params;

  // Fetch lesson directly from Strapi
  const res = await fetch(
    `${STRAPI_URL}/api/lessons/${lessonDocumentId}?populate=attachments`,
    { headers: { Authorization: `Bearer ${jwt}` }, cache: 'no-store' }
  );
  if (!res.ok) notFound();
  const { data: lesson } = await res.json();

  const textContent = lesson.content
    ?.map((block: any) => block.children?.map((c: any) => c.text).join(''))
    .join('\n') ?? '';

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 600 }}>
      <a href={`/dashboard/courses/${courseDocumentId}`}>← Back to course</a>
      <h1>Edit Lesson: {lesson.title}</h1>
      <hr />

      <form
        action={updateLessonAction.bind(null, lessonDocumentId, courseDocumentId)}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <label>Title *
          <input name="title" type="text" required defaultValue={lesson.title}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>Content
          <textarea name="content" rows={8} defaultValue={textContent}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>Video URL (YouTube / Vimeo)
          <input name="videoUrl" type="url" defaultValue={lesson.videoUrl ?? ''}
            placeholder="https://youtube.com/watch?v=..."
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>Video Provider
          <select name="videoProvider" defaultValue={lesson.videoProvider ?? ''}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
            <option value="">— Auto-detect —</option>
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
          </select>
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{ flex: 1 }}>Order *
            <input name="order" type="number" min="1" required defaultValue={lesson.order}
              style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
          </label>
          <label style={{ flex: 1 }}>Duration (seconds)
            <input name="duration" type="number" min="0" defaultValue={lesson.duration ?? ''}
              style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
          </label>
        </div>

        <label>
          <input name="isFree" type="checkbox" value="true"
            defaultChecked={lesson.isFree} />
          {' '} Free preview (accessible without enrollment)
        </label>

        <button type="submit"
          style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Save Lesson
        </button>
      </form>
    </div>
  );
}
