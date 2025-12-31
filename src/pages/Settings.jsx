import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Upload, 
  Loader2,
  Building2,
  Save,
  LogOut
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    service_type: '',
    company_name: '',
    phone: '',
    address: '',
    logo_url: '',
    stripe_publishable_key: '',
    stripe_account_id: '',
    google_business_url: '',
    yelp_business_url: '',
    default_tax_rate: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser.license_validated) {
        navigate(createPageUrl('LicenseEntry'));
        return;
      }
      setUser(currentUser);
      setFormData({
        service_type: currentUser.service_type || '',
        company_name: currentUser.company_name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        logo_url: currentUser.logo_url || '',
        stripe_publishable_key: currentUser.stripe_publishable_key || '',
        stripe_account_id: currentUser.stripe_account_id || '',
        google_business_url: currentUser.google_business_url || '',
        yelp_business_url: currentUser.yelp_business_url || '',
        default_tax_rate: currentUser.default_tax_rate || ''
      });
    } catch (err) {
      navigate(createPageUrl('LicenseEntry'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
    } catch (err) {
      alert('Error uploading logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      alert('Settings saved!');
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      base44.auth.logout('/LicenseEntry');
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
      {/* Header */}
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
            <Building2 className="w-8 h-8" />
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="space-y-6">
          {/* Service Type */}
          <Card className="shadow-lg border-2 border-emerald-200">
            <CardHeader className="bg-emerald-50 border-b">
              <CardTitle>Service Type</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Label>Your Business Type</Label>
              <select
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="mt-2 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select service type...</option>
                <option value="junk_removal">Junk Removal</option>
                <option value="lawn_care">Lawn Care</option>
                <option value="residential_cleaning">Residential Cleaning</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                💡 This customizes your quote fields and templates
              </p>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Your Company LLC"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Business St, City, ST 12345"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Google Business Review Link</Label>
                <Input
                  value={formData.google_business_url}
                  onChange={(e) => setFormData({ ...formData, google_business_url: e.target.value })}
                  placeholder="https://g.page/r/YOUR_ID/review"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  💡 Auto-sent after job completion
                </p>
              </div>

              <div>
                <Label>Yelp Business Review Link</Label>
                <Input
                  value={formData.yelp_business_url}
                  onChange={(e) => setFormData({ ...formData, yelp_business_url: e.target.value })}
                  placeholder="https://www.yelp.com/biz/your-business"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  💡 Auto-sent after job completion
                </p>
              </div>

              <div>
                <Label>Default Tax Rate (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.default_tax_rate}
                    onChange={(e) => setFormData({ ...formData, default_tax_rate: e.target.value })}
                    placeholder="7.5"
                    className="mt-1 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 translate-y-[-10%] text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Auto-fills on new quotes (varies by state)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Company Logo</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Upload your logo once - it'll appear on all your quotes
              </p>

              {formData.logo_url && (
                <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <img 
                    src={formData.logo_url} 
                    alt="Company logo" 
                    className="h-24 object-contain"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <label htmlFor="logo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById('logo-upload').click()}
                    className="cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                      </>
                    )}
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Stripe Settings */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Stripe Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Connect your Stripe account to accept payments from customers
              </p>
              <div>
                <Label>Stripe Publishable Key</Label>
                <Input
                  value={formData.stripe_publishable_key}
                  onChange={(e) => setFormData({ ...formData, stripe_publishable_key: e.target.value })}
                  placeholder="pk_test_..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Stripe Account ID (Optional)</Label>
                <Input
                  value={formData.stripe_account_id}
                  onChange={(e) => setFormData({ ...formData, stripe_account_id: e.target.value })}
                  placeholder="acct_..."
                  className="mt-1"
                />
              </div>
              <p className="text-xs text-slate-500">
                💡 Get your keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe Dashboard</a>
              </p>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{user?.email}</p>
                  <p className="text-sm text-slate-600">License Key: {user?.license_key}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 h-14 text-lg font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}