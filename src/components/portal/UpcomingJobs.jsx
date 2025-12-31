import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, FileText, Loader2 } from 'lucide-react';

export default function UpcomingJobs({ userEmail }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [userEmail]);

  const loadJobs = async () => {
    try {
      const allJobs = await base44.entities.Job.list('-scheduled_date');
      const userJobs = allJobs.filter(j => 
        j.customer_email === userEmail &&
        ['scheduled', 'in_progress'].includes(j.status)
      );
      setJobs(userJobs);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">No upcoming jobs scheduled</p>
          <p className="text-slate-500 text-sm mt-2">Request a quote to get started</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700'
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {new Date(job.scheduled_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
              <Badge className={statusColors[job.status]}>
                {job.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Time</p>
                  <p className="font-semibold">{job.scheduled_time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-semibold">{job.customer_address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Load Size</p>
                  <p className="font-semibold">{job.load_size?.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="font-semibold text-emerald-600">
                    ${job.total_price?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {job.items_description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-slate-500 mb-2">Items</p>
                <p className="text-slate-700">{job.items_description}</p>
              </div>
            )}

            {job.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-slate-500 mb-2">Notes</p>
                <p className="text-slate-700">{job.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}