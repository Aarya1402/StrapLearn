/**
 * analytics router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/analytics/system-overview",
      handler: "analytics.systemOverview",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/analytics/org-overview",
      handler: "analytics.orgOverview",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/analytics/course/:id",
      handler: "analytics.courseStats",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/analytics/student/:userId",
      handler: "analytics.studentReport",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
