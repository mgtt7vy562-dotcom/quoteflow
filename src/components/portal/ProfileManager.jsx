import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';

export default function ProfileManager({ customer, user, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: customer?.name || user?.full_name || '',
    email: customer?.email || user?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (customer) {
        await base44.entities.Customer.update(customer.id, {
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        });
      } else {
        await base44.entities.Customer.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          total_jobs: 0,
          total_revenue: 0
        });
      }

      alert('Profile updated successfully!');
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle>Manage Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              disabled
              className="bg-slate-100"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label>Default Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, ST 12345"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 h-12"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}