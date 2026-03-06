import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getCategories, getOrgInstructors } from '@/lib/course';
import { createCourseAction } from '@/actions/course.actions';

export default async function NewCoursePage() {
    const user = await requireRole('org_admin', 'instructor');
    const jwt = (await getCurrentJwt())!;

    const categories = await getCategories();

    // Fetch org's instructors only when the current user is an org_admin
    const isAdmin = user.role_type === 'org_admin';
    const orgInstructors = isAdmin && user.organization?.documentId
        ? await getOrgInstructors(user.organization.documentId, jwt)
        : [];

    return (
        <div style={{ fontFamily: 'monospace', maxWidth: 600 }}>
            <a href="/dashboard/courses">← Back to courses</a>
            <h1>Create New Course</h1>
            {isAdmin ? (
                <p style={{ color: '#666', fontSize: 13 }}>
                    As an org admin, your course will be <strong>published immediately</strong>.
                    You can also assign an instructor from your organization.
                </p>
            ) : (
                <p style={{ color: '#666', fontSize: 13 }}>
                    Courses you create are saved as <strong>drafts</strong> and must be approved
                    by your organization admin before going live.
                </p>
            )}
            <hr />

            <form action={createCourseAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                <label>
                    Title *
                    <input name="title" type="text" required placeholder="e.g. Intro to React"
                        style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
                </label>

                <label>
                    Description *
                    <textarea name="description" required rows={5} placeholder="Course description..."
                        style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
                </label>

                <label>
                    Thumbnail
                    <input name="thumbnail" type="file" accept="image/*"
                        style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
                </label>

                <label>
                    Level *
                    <select name="level" style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </label>

                <label>
                    Duration (minutes)
                    <input name="duration" type="number" min="0" placeholder="e.g. 120"
                        style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
                </label>

                <label>
                    Category
                    <select name="categoryId" style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
                        <option value="">— None —</option>
                        {categories.map((cat) => (
                            <option key={cat.documentId} value={cat.documentId}>{cat.icon} {cat.name}</option>
                        ))}
                    </select>
                </label>

                <label>
                    Pricing
                    <select name="isFree" style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
                        <option value="false">Paid</option>
                        <option value="true">Free</option>
                    </select>
                </label>

                <label>
                    Price (₹) — leave blank if free
                    <input name="price" type="number" min="0" step="0.01" placeholder="e.g. 299"
                        style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
                </label>

                {/* Instructor picker — only visible to org_admin */}
                {isAdmin && (
                    <label>
                        Assign Instructor
                        <select name="instructorId" style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}>
                            <option value="">— Myself ({user.username}) —</option>
                            {orgInstructors.map((inst) => (
                                <option key={inst.documentId} value={inst.documentId}>
                                    {inst.username} ({inst.email})
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                <button type="submit"
                    style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', marginTop: 8 }}>
                    {isAdmin ? '🚀 Publish Course' : '💾 Save as Draft'}
                </button>
            </form>
        </div>
    );
}
