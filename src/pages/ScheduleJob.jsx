import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ScheduleJob() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quotes, setQuotes] = useState([]);
  
  const [formData, setFormData] = useState({
    quote_id: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    scheduled_date: '',
    scheduled_time: '',
    items_description: '',
    load_size: 'half_load',
    total_price: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser.license_validated) {
        navigate(createPageUrl('LicenseEntry'));
        return;
      }
      setUser(currentUser);

      const allQuotes = await base44.entities.Quote.filter({ status: 'accepted' });
      setQuotes(allQuotes);

      // Check if coming from a quote
      const urlParams = new URLSearchParams(window.location.search);
      const quoteId = urlParams.get('quoteId');
      if (quoteId) {
        const quote = allQuotes.find(q => q.id === quoteId);
        if (quote) {
          setFormData({
            quote_id: quote.id,
            customer_name: quote.customer_name,
            customer_phone: quote.customer_phone || '',
            customer_address: quote.customer_address || '',
            scheduled_date: '',
            scheduled_time: '',
            items_description: quote.items_description,
            load_size: quote.load_size || 'half_load',
            total_price: quote.total,
            notes: quote.notes || ''
          });
        }
      }
    } catch (err) {
      navigate(createPageUrl('LicenseEntry'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const jobData = {
        ...formData,
        status: 'scheduled',
        before_photos: [],
        after_photos: []
      };

      await base44.entities.Job.create(jobData);

      // Update quote if linked
      if (formData.quote_id) {
        await base44.entities.Quote.update(formData.quote_id, {
          status: 'completed',
          job_id: formData.quote_id
        });
      }

      navigate(createPageUrl('Calendar'));
    } catch (err) {
      alert('Error scheduling job');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-6 px-4 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            Schedule New Job
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name *</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Address *</Label>
                <Input
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Schedule Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Time *</Label>
                  <Input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Items Description *</Label>
                <Textarea
                  value={formData.items_description}
                  onChange={(e) => setFormData({ ...formData, items_description: e.target.value })}
                  className="h-24"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Load Size *</Label>
                  <Select
                    value={formData.load_size}
                    onValueChange={(value) => setFormData({ ...formData, load_size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select load size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimum_pickup">Minimum Fee</SelectItem>
                      <SelectItem value="quarter_load">1/4 Load</SelectItem>
                      <SelectItem value="half_load">1/2 Load</SelectItem>
                      <SelectItem value="three_quarter_load">3/4 Load</SelectItem>
                      <SelectItem value="full_load">Full Load</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input
                      type="number"
                      className="pl-7"
                      value={formData.total_price}
                      onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional fees (extra labor, stairs, etc.) or helpful prep notes for this job..."
                  className="h-20"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 h-14 text-lg font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Schedule Job'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}