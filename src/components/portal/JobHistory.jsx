import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function JobHistory({ userEmail }) {
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
        ['completed', 'cancelled'].includes(j.status)
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
          <p className="text-slate-600 text-lg">No job history yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {new Date(job.scheduled_date).toLocaleDateString()}
              </CardTitle>
              {job.status === 'completed' ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  COMPLETED
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700">
                  <XCircle className="w-3 h-3 mr-1" />
                  CANCELLED
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="font-semibold text-sm">{job.customer_address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Load Size</p>
                  <p className="font-semibold">{job.load_size?.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="font-semibold text-emerald-600">
                    ${job.total_price?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {job.completion_notes && job.status === 'completed' && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-slate-500 mb-2">Completion Notes</p>
                <p className="text-slate-700">{job.completion_notes}</p>
              </div>
            )}

            {job.after_photos?.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-slate-500 mb-3">Photos</p>
                <div className="grid grid-cols-3 gap-3">
                  {job.after_photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt="Job completion"
                      className="rounded-lg border w-full h-24 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}