// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: any /*: { strapi: Core.Strapi } */) {
    // Helper: ensure a permission action exists for a given role
    async function ensurePermission(roleId: number, action: string) {
      const count = await strapi.db.query('plugin::users-permissions.permission').count({
        where: { action, role: roleId }
      });
      if (count === 0) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: { action, role: roleId }
        });
      }
    }

    // Grant myAttempt to all authenticated users
    const authRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });
    if (authRole) {
      await ensurePermission(authRole.id, 'api::quiz-attempt.quiz-attempt.myAttempt');
      await ensurePermission(authRole.id, 'api::enrollment.enrollment.getOrgStats');
    }
  },
};
