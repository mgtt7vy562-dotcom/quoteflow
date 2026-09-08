import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all scheduled jobs
    const allJobs = await base44.asServiceRole.entities.Job.filter({ status: 'scheduled' });

    // Find jobs scheduled for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const jobsTomorrow = allJobs.filter(job => {
      const jobDate = new Date(job.scheduled_date).toISOString().split('T')[0];
      return jobDate === tomorrowStr;
    });

    let sentCount = 0;

    for (const job of jobsTomorrow) {
      if (!job.customer_email) continue;

      const jobDate = new Date(job.scheduled_date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });

      const message = `Hi ${job.customer_name}!

Reminder: Your appointment with ${user.company_name || 'us'} is scheduled for TOMORROW, ${jobDate} at ${job.scheduled_time}.

Address: ${job.customer_address}
Service: ${job.service_type === 'junk_removal' ? 'Junk Removal' : job.service_type === 'lawn_care' ? 'Lawn Care' : 'Cleaning'}
${job.items_description ? `Details: ${job.items_description}` : ''}

We look forward to seeing you! Reply if you need to reschedule.

Best regards,
${user.company_name}`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: job.customer_email,
          subject: `Reminder: Appointment Tomorrow at ${job.scheduled_time}`,
          body: message
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send reminder for job ${job.id}:`, err.message);
      }
    }

    return Response.json({ 
      success: true, 
      jobs_tomorrow: jobsTomorrow.length,
      reminders_sent: sentCount
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});