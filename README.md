# 🎓 LMS Core — Enterprise Edition

> **Stack:** Next.js 14 · Strapi v5 · PostgreSQL · Stripe · TailwindCSS  
> **Type:** Multi-Tenant SaaS Learning Management System for Corporate Training

---

## 📌 Project Overview

A production-grade, multi-tenant LMS where multiple **Organizations (Tenants)** can host private courses for their **Employees**. Built to demonstrate enterprise-level patterns: tenant isolation, RBAC, custom business logic, lifecycle hooks, and content versioning.

---

## 🗂️ Project Structure

```
4_starpLearn/
├── frontend/          # Next.js 14 App Router
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
└── backend/           # Strapi v5
    ├── src/
    │   ├── api/
    │   ├── middlewares/
    │   ├── policies/
    │   └── extensions/
    └── ...
```

---

## 📦 Modules — Implementation Order

| Phase | Module | Priority | Status |
|-------|--------|----------|--------|
| 1 | Project Scaffolding & DB Setup | 🔴 Critical | `[x]` ✅ |
| 2 | Multi-Tenant Middleware | 🔴 Critical | `[x]` ✅ |
| 3 | Authentication & RBAC | 🔴 Critical | `[x]` ✅ |
| 4 | Organization Management | 🔴 Critical | `[~]` 🛠️ |
| 5 | Course & Content Management | 🔴 Critical | `[x]` ✅ |
| 6 | Lesson Management | 🔴 Critical | `[x]` ✅ |
| 7 | Enrollment System | 🟠 High | `[x]` ✅ |
| 8 | Progress Tracker (Custom API) | 🟠 High | `[x]` ✅ |
| 9 | Assessments & Quizzes | 🟠 High | `[x]` ✅ |
| 10 | Dashboard & Analytics | 🟡 Medium | `[x]` ✅ |
| 11 | Notifications System | 🟡 Medium | `[x]` ✅ |
| 12 | Content Versioning | 🟡 Medium | `[x]` ⏭️ |
| 13 | Search & Discovery | 🟢 Low | `[x]` ✅ |
| 14 | Certificate Generation | 🟢 Low | `[x]` ✅ |

---

## 📋 Detailed Module Specifications

---

### MODULE 1 — Project Scaffolding & DB Setup

**Goal:** Initialize both Next.js and Strapi projects with PostgreSQL.

#### Strapi Backend
- `npx create-strapi-app@latest backend --quickstart`
- Switch SQLite → PostgreSQL in `config/database.js`
- Configure `.env` with DB credentials

#### Next.js Frontend
- `npx create-next-app@latest frontend --typescript --app --tailwind`
- Install: `axios`, `@tanstack/react-query`, `zustand`, `lucide-react`

#### Environment Variables
```env
# backend/.env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=lms_core
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=secret
JWT_SECRET=your-jwt-secret

# frontend/.env.local
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Deliverables
- `[x]` Strapi running on port 1337
- `[x]` Next.js running on port 3000
- `[x]` PostgreSQL connected
- `[x]` Base folder structure created

---

### MODULE 2 — Multi-Tenant Middleware ⭐ (Interview Winner)

**Goal:** Every API request is scoped to the requesting organization via `x-org-slug` header.

#### Files to Create
```
backend/src/middlewares/tenant-resolver.js
```

#### Logic
```js
// tenant-resolver.js
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const orgSlug = ctx.request.headers['x-org-slug'];

    if (orgSlug) {
      const org = await strapi.db.query('api::organization.organization').findOne({
        where: { slug: orgSlug },
      });

      if (!org) return ctx.unauthorized('Unknown organization');

      // Attach org context to every request
      ctx.state.organization = org;
    }

    await next();
  };
};
```

#### Register in `config/middlewares.js`
```js
module.exports = [
  'strapi::errors',
  'strapi::security',
  {
    name: 'global::tenant-resolver',
    config: {},
  },
  // ... rest
];
```

#### Deliverables
- `[x]` Middleware file created (`src/middlewares/tenant-resolver.ts`)
- `[x]` Registered globally (after `strapi::cors` in `config/middlewares.ts`)
- `[ ]` Tested: x-org-slug=google returns only Google's courses *(needs Org content type — Module 4)*
- `[ ]` Tested: x-org-slug=amazon returns only Amazon's courses *(needs Org content type — Module 4)*
- `[x]` Returns 401 for unknown org slug *(implemented in middleware logic)*

---

### MODULE 3 — Authentication & RBAC

**Goal:** JWT-based auth with custom roles scoped per organization.

#### Strapi Roles (Settings > Roles)
| Role | Permissions |
|------|------------|
| `Super Admin` | Full system access |
| `Org Admin` | Manage own org's courses, users, publish content |
| `Instructor` | Create/edit courses (draft only), manage lessons |
| `Student` | View enrolled courses, mark progress |

#### Custom Fields on Strapi User
- `organization` → Relation (Many-to-One → Organization)
- `role_type` → Enum: `org_admin`, `instructor`, `student`

#### Next.js Auth Setup
- Use **Strapi built-in JWT** (or optionally Clerk)
- Store JWT in `httpOnly` cookie
- Create `lib/auth.ts` with login/logout/me helpers

#### API Routes (Next.js)
```
POST /api/auth/login    → calls Strapi /api/auth/local
POST /api/auth/register → calls Strapi /api/auth/local/register
GET  /api/auth/me       → returns current user with org
```

#### Deliverables
- `[x]` Custom roles created in Strapi Admin *(via GUI: Org Admin, Instructor, Student)*
- `[x]` User content type extended with `role_type` *(schema.json extension)*
- `[ ]` `organization` relation on User *(added in Module 4 after Org content type exists)*
- `[x]` Login/Register API working (`/api/auth/login`, `/api/auth/register`)
- `[x]` Auth context/provider in Next.js (`src/context/AuthContext.tsx`)
- `[x]` Protected routes via middleware (`src/middleware.ts`)
- `[x]` Role-based redirects (org_admin → /dashboard/admin, instructor → /dashboard/instructor, student → /dashboard/student)

---

### MODULE 4 — Organization Management

**Goal:** Multi-tenant core — each org is fully isolated.

#### Strapi Content Type: `Organization`
| Field | Type | Required |
|-------|------|----------|
| `name` | String | ✅ |
| `slug` | UID (auto from name) | ✅ |
| `logo` | Media (single) | ❌ |
| `primaryColor` | String | ❌ |
| `supportEmail` | Email | ❌ |
| `isActive` | Boolean (default: true) | ✅ |
| `users` | Relation (One-to-Many → User) | — |
| `courses` | Relation (One-to-Many → Course) | — |

#### Lifecycle Hook: Auto-Slug
```js
// src/api/organization/content-types/organization/lifecycles.js
const slugify = require('slugify');

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
  },
  beforeUpdate(event) {
    const { data } = event.params;
    if (data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
  },
};
```

#### Deliverables
- `[ ]` Organization content type created *(via GUI — see instructions above)*
- `[x]` Auto-slug lifecycle hook (`src/api/organization/content-types/organization/lifecycles.ts`)
- `[ ]` Org Admin can only see their own org data *(configured via Strapi permissions after content type is created)*
- `[ ]` Super Admin can manage all orgs *(configured via Strapi permissions)*
- `[x]` Org list page in Next.js Admin panel (`/dashboard/admin/organizations`)
- `[x]` Org detail/edit page (`/dashboard/admin/organizations/[id]`)

---

### MODULE 5 — Course & Content Management ⭐

**Goal:** Full course CRUD with lifecycle hooks for validation.

#### Strapi Content Type: `Course`
| Field | Type | Required |
|-------|------|----------|
| `title` | String | :white_check_mark: |
| `slug` | UID (auto from title) | :white_check_mark: |
| `description` | Rich Text | :white_check_mark: |
| `thumbnail` | Media (single image) | :x: |
| `level` | Enum: beginner/intermediate/advanced | :white_check_mark: |
| `duration` | Integer (minutes) | :x: |
| `isFree` | Boolean (default: false) | :white_check_mark: |
| `price` | Decimal | :x: |
| `organization` | Relation (Many-to-One → Organization) | :white_check_mark: |
| `instructor` | Relation (Many-to-One → User) | :white_check_mark: |
| `lessons` | Relation (One-to-Many → Lesson) | — |
| `category` | Relation (Many-to-One → Category) | :x: |
| `publishedAt` | DateTime (Draft & Publish) | — |

#### Lifecycle Hook: Validation + Slug
```js
// src/api/course/content-types/course/lifecycles.js
const slugify = require('slugify');

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    if (data.title && !data.slug) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }
    if (data.price && data.isFree) {
      throw new Error('A free course cannot have a price.');
    }
  },
  beforeUpdate(event) {
    const { data } = event.params;
    if (data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }
  },
};
```

#### Strapi Content Type: `Category`
| Field | Type |
|-------|------|
| `name` | String |
| `slug` | UID |
| `icon` | String (emoji or icon name) |

#### Next.js Pages
```
/courses                  → Course listing (filtered by org)
/courses/[slug]           → Course detail & enrollment
/dashboard/courses        → Instructor's course management
/dashboard/courses/new    → Create course form
/dashboard/courses/[id]   → Edit course form
```

#### Deliverables
- `[x]` Course content type with all fields
- `[x]` Category content type
- `[x]` Auto-slug lifecycle working
- `[x]` Draft & Publish enabled
- `[x]` Only Org Admin can publish (permission set in Strapi)
- `[x]` Instructor can only save drafts
- `[x]` Course listing page (tenant-filtered)
- `[x]` Course detail page
- `[x]` Create/Edit course forms
- `[x]` Thumbnail upload working

---

### MODULE 6 — Lesson Management

**Goal:** Structured content delivery with video support.

#### Strapi Content Type: `Lesson`
| Field | Type | Required |
|-------|------|----------|
| `title` | String | ✅ |
| `slug` | UID | ✅ |
| `content` | Rich Text (Blocks) | ❌ |
| `videoUrl` | String | ❌ |
| `videoProvider` | Enum: youtube/vimeo/upload | ❌ |
| `duration` | Integer (seconds) | ❌ |
| `order` | Integer | ✅ |
| `isFree` | Boolean (preview) | ✅ |
| `course` | Relation (Many-to-One → Course) | ✅ |
| `attachments` | Media (multiple files) | ❌ |

#### Lifecycle Hook: Video URL Validation
```js
// src/api/lesson/content-types/lesson/lifecycles.js
const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
const VIMEO_REGEX = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    if (data.videoUrl) {
      const isValid = YOUTUBE_REGEX.test(data.videoUrl) || VIMEO_REGEX.test(data.videoUrl);
      if (!isValid) throw new Error('Video URL must be a valid YouTube or Vimeo link.');
    }
  },
  beforeUpdate(event) {
    const { data } = event.params;
    if (data.videoUrl) {
      const isValid = YOUTUBE_REGEX.test(data.videoUrl) || VIMEO_REGEX.test(data.videoUrl);
      if (!isValid) throw new Error('Video URL must be a valid YouTube or Vimeo link.');
    }
  },
};
```

#### Next.js Pages
```
/courses/[courseSlug]/lessons/[lessonSlug]  → Lesson viewer
```

#### Components
- `VideoPlayer` — YouTube/Vimeo embed via iframe
- `RichTextRenderer` — Render Strapi blocks content
- `LessonSidebar` — List of lessons with completion state
- `LessonNavigation` — Prev/Next lesson buttons

#### Deliverables
- `[x]` Lesson content type created
- `[x]` Video URL validation lifecycle working
- `[x]` Lesson ordering (numeric `order` field; drag-and-drop deferred — Strapi admin handles reorder natively)
- `[x]` Video embed component in Next.js (YouTube & Vimeo iframes)
- `[x]` Rich text rendering (paragraph, heading, list, quote, code, image + inline formatting)
- `[~]` Lesson sidebar with progress indicators *(sidebar + FREE badge done; completion checkmarks deferred to Module 8 — requires Progress data)*
- `[x]` Free preview lessons accessible without enrollment

---

### MODULE 7 — Enrollment System

**Goal:** Track which users are enrolled in which courses.

#### Strapi Content Type: `Enrollment`
| Field | Type | Required |
|-------|------|----------|
| `user` | Relation (Many-to-One → User) | ✅ |
| `course` | Relation (Many-to-One → Course) | ✅ |
| `enrolledAt` | DateTime (auto) | ✅ |
| `completedAt` | DateTime | ❌ |
| `isCompleted` | Boolean (default: false) | ✅ |

#### Custom Policy: `is-enrolled`
```js
// src/api/progress/policies/is-enrolled.js
module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  const { lessonId } = policyContext.request.body;

  const lesson = await strapi.db.query('api::lesson.lesson').findOne({
    where: { id: lessonId },
    populate: ['course'],
  });

  const enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
    where: {
      user: user.id,
      course: lesson.course.id,
    },
  });

  if (!enrollment) return false;
  return true;
};
```

#### Deliverables
- `[x]` Enrollment content type created
- `[x]` Enroll API endpoint working
- `[x]` Prevents duplicate enrollments
- `[x]` `is-enrolled` policy created
- `[x]` "Enroll Now" button on course detail page
- `[x]` My Courses page for students

---

### MODULE 8 — Progress Tracker ⭐ (Interview Winner)

**Goal:** Custom endpoint to mark lessons complete and return course percentage.

#### Strapi Content Type: `Progress`
| Field | Type | Required |
|-------|------|----------|
| `user` | Relation (Many-to-One → User) | ✅ |
| `lesson` | Relation (Many-to-One → Lesson) | ✅ |
| `course` | Relation (Many-to-One → Course) | ✅ |
| `isCompleted` | Boolean (default: false) | ✅ |
| `score` | Integer | ❌ |
| `completedAt` | DateTime | ❌ |

#### Custom Route
```js
// src/api/progress/routes/custom-progress.js
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/progress/mark-complete',
      handler: 'progress.markComplete',
      config: {
        policies: ['api::progress.is-enrolled'],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/progress/course/:courseId',
      handler: 'progress.getCourseProgress',
      config: {},
    },
  ],
};
```

#### Custom Controller
```js
// src/api/progress/controllers/progress.js
module.exports = {
  async markComplete(ctx) {
    const { user } = ctx.state;
    const { lessonId, courseId } = ctx.request.body;

    // Upsert progress record
    const existing = await strapi.db.query('api::progress.progress').findOne({
      where: { user: user.id, lesson: lessonId },
    });

    if (existing) {
      await strapi.db.query('api::progress.progress').update({
        where: { id: existing.id },
        data: { isCompleted: true, completedAt: new Date() },
      });
    } else {
      await strapi.db.query('api::progress.progress').create({
        data: {
          user: user.id,
          lesson: lessonId,
          course: courseId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }

    // Calculate overall course percentage
    const totalLessons = await strapi.db.query('api::lesson.lesson').count({
      where: { course: courseId },
    });

    const completedLessons = await strapi.db.query('api::progress.progress').count({
      where: { user: user.id, course: courseId, isCompleted: true },
    });

    const percentage = Math.round((completedLessons / totalLessons) * 100);

    // Auto-complete enrollment if 100%
    if (percentage === 100) {
      await strapi.db.query('api::enrollment.enrollment').update({
        where: { user: user.id, course: courseId },
        data: { isCompleted: true, completedAt: new Date() },
      });
    }

    return ctx.send({ percentage, completedLessons, totalLessons });
  },

  async getCourseProgress(ctx) {
    const { user } = ctx.state;
    const { courseId } = ctx.params;

    const totalLessons = await strapi.db.query('api::lesson.lesson').count({
      where: { course: courseId },
    });

    const completedLessons = await strapi.db.query('api::progress.progress').count({
      where: { user: user.id, course: courseId, isCompleted: true },
    });

    return ctx.send({
      percentage: Math.round((completedLessons / totalLessons) * 100),
      completedLessons,
      totalLessons,
    });
  },
};
```

#### Deliverables
- `[x]` Progress content type created
- `[x]` Custom route file created
- `[x]` Custom controller with upsert logic
- `[x]` `is-enrolled` policy guarding the endpoint
- `[x]` Returns percentage on every mark-complete call
- `[x]` Auto-marks enrollment complete at 100%
- `[x]` Progress bar component in Next.js lesson viewer
- `[x]` Postman collection for demo (documented in README)

---

### MODULE 9 — Assessments & Quizzes

**Goal:** End-of-module quizzes to validate learning.

#### Strapi Content Types

**Quiz**
| Field | Type |
|-------|------|
| `title` | String |
| `course` | Relation (Many-to-One → Course) |
| `passingScore` | Integer (%) |
| `timeLimit` | Integer (minutes) |
| `questions` | Relation (One-to-Many → Question) |

**Question**
| Field | Type |
|-------|------|
| `text` | String |
| `type` | Enum: mcq/true-false/short-answer |
| `options` | JSON (array of options) |
| `correctAnswer` | String |
| `points` | Integer |

**QuizAttempt**
| Field | Type |
|-------|------|
| `user` | Relation → User |
| `quiz` | Relation → Quiz |
| `answers` | JSON |
| `score` | Integer |
| `isPassed` | Boolean |
| `attemptedAt` | DateTime |

#### Custom Endpoint
```
POST /api/quiz/:quizId/submit  → grades the attempt, returns score
GET  /api/quiz/:quizId/results → user's attempt history
```

#### Deliverables
- `[x]` Quiz, Question, QuizAttempt content types
- `[x]` Submit quiz custom endpoint
- `[x]` Auto-grading logic for MCQ/True-False
- `[x]` Quiz UI component in Next.js
- `[x]` Passing score enforcement
- `[x]` Quiz results page

---

### MODULE 10 — Dashboard & Analytics

**Goal:** Role-specific dashboards with key metrics.

#### Student Dashboard (`/dashboard/student`)
- Enrolled courses with progress %
- Recently accessed lesson
- Upcoming quiz deadlines
- Certificates earned

#### Instructor Dashboard (`/dashboard/instructor`)
- My courses list with enrollment counts
- Pending draft reviews
- Student progress overview
- Lesson engagement stats

#### Org Admin Dashboard (`/dashboard/admin`)
- Total users in org
- Total courses & completion rates
- Department-wise progress
- Export reports (CSV)

#### Super Admin Dashboard (`/dashboard/super`)
- All organizations overview
- System health metrics
- Global user count

#### Strapi Analytics Endpoints (Custom)
```
GET /api/analytics/org-overview      → for Org Admin
GET /api/analytics/course/:id        → course-level stats
GET /api/analytics/student/:userId   → per-student report
```

#### Deliverables
- `[x]` Stat cards components (reusable)
- `[x]` Progress bar components
- `[x]` Course completion table
- `[x]` Role-gated route rendering
- `[x]` Mock chart with Recharts (enrollment over time)

---

### MODULE 11 — Notifications System

**Goal:** In-app and email notifications for key events.

#### Notification Triggers
| Event | Recipients |
|-------|-----------|
| User enrolled in course | Instructor |
| Lesson published | Enrolled students |
| Quiz submitted | Instructor |
| Course completed | Student (+ certificate) |
| New user joined org | Org Admin |

#### Strapi: Notification Content Type
| Field | Type |
|-------|------|
| `user` | Relation → User |
| `type` | Enum: enrollment/completion/quiz/system |
| `title` | String |
| `message` | Text |
| `isRead` | Boolean |
| `link` | String |

#### Email (Strapi Email Plugin)
- Configure with SendGrid/Resend
- Templates for: enrollment confirmation, course completion, quiz results

#### Next.js
- Notification bell in navbar with unread count
- Notification dropdown panel
- Mark all as read action

#### Deliverables
- `[x]` Notification content type
- `[x]` Lifecycle hooks to create notifications on events
- `[x]` Email plugin configured
- `[x]` Notification bell component
- `[x]` Notification list with read/unread states

---

### MODULE 12 — Content Versioning (Draft & Publish) [SKIPPED BY USER]

**Goal:** Workflow control — Instructors draft, Org Admins publish.

#### Strapi Config
- Enable Draft & Publish on Course and Lesson content types
- Set permissions:
  - `Instructor` role: can `create`, `update` — cannot `publish`
  - `Org Admin` role: can `create`, `update`, `publish`, `unpublish`

#### Strapi API: Separate publish endpoint
```
PUT /api/courses/:id/publish   → Org Admin only
PUT /api/courses/:id/unpublish → Org Admin only
```

#### Custom Policy: `is-org-admin`
```js
// src/policies/is-org-admin.js
module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  return user.role_type === 'org_admin';
};
```

#### Deliverables
- `[ ]` Draft & Publish enabled for courses and lessons
- `[ ]` Role permissions configured correctly
- `[ ]` Admin UI shows "Publish" button only for Org Admins
- `[ ]` Frontend shows only published content to students
- `[ ]` Draft preview for Instructors

---

### MODULE 13 — Search & Discovery

**Goal:** Find courses quickly with filters.

#### Strapi: Filtering API
```
GET /api/courses?filters[title][$containsi]=react&filters[level]=beginner&filters[organization][slug]=google
```

#### Next.js: Search Page (`/courses/search`)
- Search input with debounce
- Filter sidebar: Level, Category, Duration, Free/Paid
- Sort: Newest, Most Popular, Alphabetical
- Instant results (no full-page reload)

#### Deliverables
- `[x]` Strapi filtering working
- `[x]` Search input with debounce (400ms)
- `[x]` Filter interface (Level, Category, Price, Sort)
- `[x]` Real-time reactive state updates
- `[x]` Empty state UI

---

### MODULE 14 — Certificate Generation

**Goal:** Auto-generate PDF certificates on course completion.

#### Flow
1. Course marks 100% complete (from Progress Tracker)
2. Certificate record created in DB
3. PDF generated with user name, course name, date
4. Download link sent via notification

#### Strapi Content Type: `Certificate`
| Field | Type |
|-------|------|
| `user` | Relation → User |
| `course` | Relation → Course |
| `issuedAt` | DateTime |
| `certificateId` | UID (unique) |
| `pdfUrl` | String |

#### PDF Generation
- Use `pdfkit` or `@react-pdf/renderer` in Next.js
- Generate client-side or as a Next.js API Route

#### Deliverables
- `[x]` Certificate content type
- `[x]` Auto-generate on completion
- `[x]` PDF download page (`/certificates/[id]`)
- `[x]` Certificate gallery in student dashboard
- `[x]` Shareable certificate URL

---

## 🎯 Postman Demo Collection

Showcase multi-tenancy in the interview:

```
1. GET /api/courses (x-org-slug: google)    → Returns Google's courses only
2. GET /api/courses (x-org-slug: amazon)    → Returns Amazon's courses only  
3. POST /api/auth/local                     → Login as student
4. POST /api/progress/mark-complete         → Mark lesson done (returns %)
5. POST /api/quiz/1/submit                  → Submit quiz answers
6. GET /api/analytics/org-overview          → Org dashboard data
```

---

## 🚀 Development Phases

### Phase 1 — Foundation (Week 1)
- Modules 1, 2, 3, 4

### Phase 2 — Core Features (Week 2)
- Modules 5, 6, 7, 8

### Phase 3 — Advanced Features (Week 3)
- Modules 9, 10, 11

### Phase 4 — Polish (Week 4)
- Modules 12, 13, 14
- Postman collection
- README & deployment

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 14 (App Router) |
| Backend CMS | Strapi v5 |
| Database | PostgreSQL |
| ORM | Strapi DB (Knex under the hood) |
| Auth | Strapi JWT (built-in) |
| Styling | TailwindCSS + shadcn/ui |
| State Management | Zustand + React Query |
| PDF Generation | @react-pdf/renderer |
| Email | Strapi Email + Resend |
| Charts | Recharts |
| File Upload | Strapi Upload Plugin (Cloudinary) |
| Deployment | Railway (Strapi) + Vercel (Next.js) |
