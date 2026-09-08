import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Google Calendar access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    // Fetch calendar events from now onwards
    const now = new Date().toISOString();
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=50&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!calendarResponse.ok) {
      return Response.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
    }

    const calendarData = await calendarResponse.json();
    const events = calendarData.items || [];

    // Get existing jobs to avoid duplicates
    const existingJobs = await base44.entities.Job.list();
    
    let importedCount = 0;

    for (const event of events) {
      // Skip all-day events or events without start time
      if (!event.start?.dateTime) continue;

      const eventTitle = event.summary || 'Untitled Event';
      
      // Check if we already imported this event (by checking title and date)
      const duplicate = existingJobs.some(job => {
        return job.customer_name === eventTitle && 
               job.scheduled_date === event.start.dateTime;
      });

      if (duplicate) continue;

      // Extract customer info from event description or location
      const description = event.description || '';
      const location = event.location || '';
      
      // Convert UTC time to Central Time for display
      const startDateTime = new Date(event.start.dateTime);
      const timeString = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Chicago'
      }).format(startDateTime);
      
      // Create job from calendar event
      await base44.entities.Job.create({
        customer_name: eventTitle,
        customer_address: location,
        customer_phone: '',
        scheduled_date: event.start.dateTime,
        scheduled_time: timeString,
        status: 'scheduled',
        service_type: user.service_type || 'junk_removal',
        items_description: description || 'Imported from Google Calendar',
        total_price: 0,
        notes: `Imported from Google Calendar on ${new Date().toLocaleDateString()}`
      });

      importedCount++;
    }

    return Response.json({ 
      success: true, 
      imported: importedCount,
      total_events: events.length 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});