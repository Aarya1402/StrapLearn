export default {
  async afterCreate(event) {
    const { result, params } = event;
    const { data } = params;
    console.log('[Enrollment Lifecycle] afterCreate triggered for enrollment:', result.id);

    try {
      // 1. Fetch the course with its instructor
      const enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
        where: { id: result.id },
        populate: ['course', 'course.instructor', 'user'],
      });

      if (enrollment && enrollment.course && enrollment.course.instructor) {
        console.log('[Enrollment Lifecycle] Sending emails to:', enrollment.user.email, 'and', enrollment.course.instructor.email);
        // 2. Create in-app notification for the Instructor
        await strapi.service('api::notification.notification').create({
          data: {
            user: enrollment.course.instructor.id,
            type: 'enrollment',
            title: 'New Student Enrollment',
            message: `${enrollment.user.username} has enrolled in your course: ${enrollment.course.title}`,
            link: `/dashboard/courses/${enrollment.course.documentId}`,
            isRead: false,
          },
        });

        // 3. Send Email to Instructor
        await strapi.plugin('email').service('email').send({
          to: enrollment.course.instructor.email,
          subject: `New Enrollment: ${enrollment.course.title}`,
          text: `Hello ${enrollment.course.instructor.username}, ${enrollment.user.username} has just enrolled in your course: ${enrollment.course.title}.`,
        });

        // 4. Send Email to Student (Confirmation)
        await strapi.plugin('email').service('email').send({
          to: enrollment.user.email,
          subject: `Enrollment Confirmed: ${enrollment.course.title}`,
          text: `Hello ${enrollment.user.username}, you have successfully enrolled in "${enrollment.course.title}". You can start learning now at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/courses`,
        });
      }
    } catch (error) {
      console.error('Failed to trigger enrollment notification:', error);
    }
  },
  async afterUpdate(event) {
    const { result, params } = event;
    const { data } = params;
    console.log('[Enrollment Lifecycle] afterUpdate triggered for enrollment:', result.id, 'data:', data);

    // Check if the enrollment was just marked as completed
    if (data.isCompleted === true) {
      try {
        const enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
          where: { id: result.id },
          populate: ['course', 'user'],
        });

        if (enrollment && enrollment.isCompleted) {
          // Send Congratulations Email to Student
          await strapi.plugin('email').service('email').send({
            to: enrollment.user.email,
            subject: `Congratulations! You've completed ${enrollment.course.title}`,
            text: `Well done ${enrollment.user.username}! You have successfully completed the course "${enrollment.course.title}". You can download your certificate from the course page.`,
          });
        }
      } catch (error) {
        console.error('Failed to trigger completion notification:', error);
      }
    }
  },
};
