import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Bell,
  Download,
  Trash2
} from 'lucide-react';

export default function Calendar() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser.license_validated) {
        window.location.href = '/LicenseEntry';
        return;
      }
      setUser(currentUser);

      const allJobs = await base44.entities.Job.list('-scheduled_date');
      setJobs(allJobs);
    } catch (err) {
      window.location.href = '/LicenseEntry';
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getJobsForDay = (date) => {
    if (!date) return [];
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return jobDate.toDateString() === date.toDateString();
    });
  };

  const handleImportGoogleCalendar = async () => {
    setImporting(true);
    try {
      const response = await base44.functions.invoke('importGoogleCalendar');
      await loadData();
      alert(`Successfully imported ${response.data.imported} job(s) from Google Calendar!`);
    } catch (err) {
      alert('Error importing from Google Calendar: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }
    
    try {
      await base44.entities.Job.delete(jobId);
      await loadData();
      alert('Job deleted successfully!');
    } catch (err) {
      alert('Error deleting job: ' + err.message);
    }
  };

  const sendJobReminder = async (job) => {
    if (!job.customer_phone && !job.customer_email) {
      alert('No contact info for this customer');
      return;
    }

    const jobDate = new Date(job.scheduled_date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });

    const message = `Hi ${job.customer_name}! 

Reminder: Your junk removal appointment with ${user?.company_name || 'us'} is scheduled for ${jobDate} at ${job.scheduled_time}.

Address: ${job.customer_address}
Items: ${job.items_description}

We'll see you then! Reply if you need to reschedule.`;

    try {
      if (job.customer_email) {
        await base44.integrations.Core.SendEmail({
          to: job.customer_email,
          subject: `Reminder: Junk Removal Appointment on ${jobDate}`,
          body: message
        });
        alert('Reminder sent via email!');
      } else {
        alert(`SMS ready! Send this to ${job.customer_phone}:\n\n${message}`);
      }
    } catch (err) {
      alert('Error sending reminder');
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-6 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <a href="/Dashboard" className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </a>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CalendarIcon className="w-8 h-8" />
              Job Calendar
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                onClick={handleImportGoogleCalendar}
                disabled={importing}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
              <a href="/ScheduleJob" className="w-full sm:w-auto">
                <Button className="bg-emerald-500 hover:bg-emerald-600 w-full">
                  Schedule New Job
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" onClick={previousMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-2xl font-bold">{monthName}</h2>
              <Button variant="outline" onClick={nextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-slate-600 py-2">
                  {day}
                </div>
              ))}

              {days.map((day, index) => {
                const dayJobs = day ? getJobsForDay(day) : [];
                const isToday = day && day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border rounded-lg ${
                      !day ? 'bg-slate-50' : isToday ? 'bg-emerald-50 border-emerald-300' : 'bg-white'
                    }`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayJobs.map(job => (
                            <a key={job.id} href={`/JobDetails?id=${job.id}`}>
                              <div className="text-xs bg-blue-100 text-blue-700 p-1 rounded cursor-pointer hover:bg-blue-200">
                                <div className="font-medium truncate">{job.customer_name}</div>
                                <div className="text-blue-600">{job.scheduled_time}</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Jobs List */}
        <Card className="shadow-lg mt-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Upcoming Jobs</h3>
            {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length === 0 ? (
              <p className="text-slate-500 text-center py-8">No upcoming jobs</p>
            ) : (
              <div className="space-y-3">
                {jobs
                  .filter(j => j.status !== 'completed' && j.status !== 'cancelled')
                  .slice(0, 5)
                  .map(job => (
                    <div key={job.id} className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all">
                      <a href={`/JobDetails?id=${job.id}`} className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold">{job.customer_name}</span>
                              <Badge className={statusColors[job.status]}>{job.status}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {new Date(job.scheduled_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {job.scheduled_time}
                              </span>
                              {job.customer_address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.customer_address}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">${job.total_price?.toLocaleString()}</p>
                          </div>
                        </div>
                      </a>
                      <div className="flex gap-2">
                        {job.status === 'scheduled' && (
                          <Button
                            onClick={() => sendJobReminder(job)}
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          >
                            <Bell className="w-4 h-4 mr-1" />
                            Remind
                          </Button>
                        )}
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            deleteJob(job.id);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}