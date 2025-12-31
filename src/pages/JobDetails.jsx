import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock,
  User,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Camera,
  DollarSign,
  Send,
  X
} from 'lucide-react';
import PhotoUploader from '../components/quote/PhotoUploader';
import AIJobUpsells from '../components/jobs/AIJobUpsells';
import InvoicePDFGenerator from '../components/invoice/InvoicePDFGenerator';

export default function JobDetails() {
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [sendingPhotos, setSendingPhotos] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

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

      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('id');
      
      if (jobId) {
        const jobs = await base44.entities.Job.filter({ id: jobId });
        if (jobs.length > 0) {
          setJob(jobs[0]);
          setCompletionNotes(jobs[0].completion_notes || '');
          setPaymentMethod(jobs[0].payment_method || '');
        }
      }
    } catch (err) {
      window.location.href = '/LicenseEntry';
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCompletionPhotos([...completionPhotos, file_url]);
    } catch (err) {
      alert('Error uploading photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSendPhotos = async () => {
    if (completionPhotos.length === 0) {
      alert('Please take at least one photo first');
      return;
    }

    if (!job.customer_email) {
      alert('No customer email available');
      return;
    }

    setSendingPhotos(true);
    try {
      const photoLinks = completionPhotos.map((url, idx) => `Photo ${idx + 1}: ${url}`).join('\n\n');
      
      await base44.integrations.Core.SendEmail({
        to: job.customer_email,
        subject: `Job Completion Photos - ${user?.company_name}`,
        body: `Hi ${job.customer_name},

Your job has been completed! Here are the completion photos:

${photoLinks}

Thank you for choosing ${user?.company_name}!

Address: ${job.customer_address}
Completed: ${new Date().toLocaleDateString()}`
      });
      alert('Photos sent via email!');
    } catch (err) {
      alert('Error sending photos: ' + err.message);
    } finally {
      setSendingPhotos(false);
    }
  };

  const updateJobStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await base44.entities.Job.update(job.id, {
        ...job,
        status: newStatus,
        completion_notes: completionNotes,
        after_photos: completionPhotos
      });
      
      // Update customer record and send thank you when job is completed
      if (newStatus === 'completed') {
        const customers = await base44.entities.Customer.filter({ 
          name: job.customer_name 
        });

        if (customers.length > 0) {
          const customer = customers[0];
          const newTotalJobs = (customer.total_jobs || 0) + 1;
          const newPoints = (customer.loyalty_points || 0) + 50;

          // Bonus points for 5+ jobs
          const bonusPoints = newTotalJobs === 5 ? 200 : 0;
          const totalNewPoints = newPoints + bonusPoints;

          // Calculate tier based on points
          let newTier = 'bronze';
          if (totalNewPoints >= 1000) newTier = 'gold';
          else if (totalNewPoints >= 500) newTier = 'silver';

          await base44.entities.Customer.update(customer.id, {
            total_jobs: newTotalJobs,
            total_revenue: (customer.total_revenue || 0) + (job.total_price || 0),
            last_job_date: job.scheduled_date,
            loyalty_points: totalNewPoints,
            loyalty_tier: newTier
          });
        } else {
          await base44.entities.Customer.create({
            name: job.customer_name,
            email: job.customer_email,
            phone: job.customer_phone,
            address: job.customer_address,
            total_jobs: 1,
            total_revenue: job.total_price || 0,
            last_job_date: job.scheduled_date,
            loyalty_points: 50,
            loyalty_tier: 'bronze'
          });
        }
        
        // Send thank you message with review links
        if (job.customer_email) {
          let reviewLinks = '';
          if (user.google_business_url) {
            reviewLinks += `\n\nLeave us a Google review: ${user.google_business_url}`;
          }
          if (user.yelp_business_url) {
            reviewLinks += `\n\nLeave us a Yelp review: ${user.yelp_business_url}`;
          }
          
          if (reviewLinks) {
            await base44.integrations.Core.SendEmail({
              to: job.customer_email,
              subject: `Thank you from ${user.company_name}!`,
              body: `Hi ${job.customer_name},\n\nThank you for choosing ${user.company_name}! We hope you're happy with our service.\n\nIf you have a moment, we'd love it if you could leave us a review:${reviewLinks}\n\nYour feedback helps us grow and serve you better!\n\nBest regards,\n${user.company_name}`
            });
          }
        }
      }
      
      setJob({ ...job, status: newStatus, completion_notes: completionNotes });
    } catch (err) {
      alert('Error updating job');
    } finally {
      setUpdating(false);
    }
  };

  const updatePhotos = async (photoType, photos) => {
    try {
      const updates = photoType === 'before' 
        ? { ...job, before_photos: photos }
        : { ...job, after_photos: photos };
      
      await base44.entities.Job.update(job.id, updates);
      setJob(updates);
    } catch (err) {
      alert('Error updating photos');
    }
  };

  const generateInvoice = () => {
    InvoicePDFGenerator.createInvoice(job, user);
  };

  const handlePaymentUpdate = async (method, status) => {
    try {
      await base44.entities.Job.update(job.id, {
        payment_method: method,
        payment_status: status
      });
      setJob({ ...job, payment_method: method, payment_status: status });
      setPaymentMethod(method);
    } catch (err) {
      alert('Error updating payment');
    }
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

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-6 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <a href="/Calendar" className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Calendar
          </a>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{job.customer_name}</h1>
              <p className="text-slate-400">Job Details</p>
            </div>
            <Badge className={`${statusColors[job.status]} text-lg px-4 py-2`}>
              {job.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </p>
                    <p className="font-medium">{new Date(job.scheduled_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time
                    </p>
                    <p className="font-medium">{job.scheduled_time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Phone
                    </p>
                    <p className="font-medium">{job.customer_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Loads
                    </p>
                    <p className="font-medium">{job.load_count}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </p>
                  <p className="font-medium">{job.customer_address}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-2">Items</p>
                  <p className="font-medium">{job.items_description}</p>
                </div>

                {job.notes && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Notes</p>
                    <p className="text-slate-700">{job.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Photos */}
            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Job Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <PhotoUploader
                  photos={job.before_photos || []}
                  onPhotosChange={(photos) => updatePhotos('before', photos)}
                  label="Before Photos"
                />
                <PhotoUploader
                  photos={job.after_photos || []}
                  onPhotosChange={(photos) => updatePhotos('after', photos)}
                  label="After Photos"
                />
              </CardContent>
            </Card>

            {/* AI Upsell Recommendations */}
            {job.status === 'in_progress' && (
              <Card className="shadow-lg border-2 border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <DollarSign className="w-5 h-5" />
                    AI Upsell Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AIJobUpsells job={job} />
                </CardContent>
              </Card>
            )}

            {/* Completion Notes */}
            {job.status !== 'cancelled' && (
              <Card className="shadow-lg">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle>Completion Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Add notes about the job completion..."
                    className="h-24 mb-4"
                  />
                  
                  <div className="mb-4">
                    <Label className="mb-2 block">Job Completion Photos</Label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {completionPhotos.map((photo, idx) => (
                          <div key={idx} className="relative">
                            <img src={photo} alt={`Completion ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setCompletionPhotos(completionPhotos.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 h-6 w-6 bg-white/90 hover:bg-white"
                            >
                              <X className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            className="hidden"
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            className="w-full" 
                            disabled={uploadingPhoto}
                            asChild
                          >
                            <span>
                              {uploadingPhoto ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Camera className="w-4 h-4 mr-2" />
                              )}
                              Take Photo
                            </span>
                          </Button>
                        </label>

                        {completionPhotos.length > 0 && (
                          <Button
                            type="button"
                            onClick={handleSendPhotos}
                            disabled={sendingPhotos}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            {sendingPhotos ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 mr-2" />
                            )}
                            Send to Customer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => updateJobStatus(job.status)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    Save Notes
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Total Price</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-4xl font-bold text-emerald-600">
                  ${job.total_price?.toLocaleString()}
                </p>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <Label className="text-sm mb-2 block">Payment Status</Label>
                    <div className={`p-3 rounded-lg text-center font-semibold ${
                      job.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {job.payment_status === 'paid' ? '✓ PAID' : 'UNPAID'}
                    </div>
                  </div>

                  {job.payment_status !== 'paid' && job.status === 'completed' && (
                    <div>
                      <Label className="text-sm mb-2 block">Mark as Paid via:</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(method) => handlePaymentUpdate(method, 'paid')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">💵 Cash</SelectItem>
                          <SelectItem value="check">📝 Check</SelectItem>
                          <SelectItem value="zelle">Zelle</SelectItem>
                          <SelectItem value="cashapp">Cash App</SelectItem>
                          <SelectItem value="venmo">Venmo</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="other_pos">Other POS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {job.payment_method && (
                    <div className="text-sm text-slate-600 text-center">
                      Paid via: <span className="font-semibold capitalize">{job.payment_method.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>

                {job.status === 'completed' && (
                  <Button
                    onClick={generateInvoice}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {job.status === 'scheduled' && (
                  <Button
                    onClick={() => updateJobStatus('in_progress')}
                    disabled={updating}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Job'}
                  </Button>
                )}

                {job.status === 'in_progress' && (
                  <Button
                    onClick={() => updateJobStatus('completed')}
                    disabled={updating}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Job
                      </>
                    )}
                  </Button>
                )}

                {job.status !== 'completed' && job.status !== 'cancelled' && (
                  <Button
                    onClick={() => updateJobStatus('cancelled')}
                    disabled={updating}
                    variant="outline"
                    className="w-full text-red-600 border-red-600 hover:bg-red-50"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Job
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}