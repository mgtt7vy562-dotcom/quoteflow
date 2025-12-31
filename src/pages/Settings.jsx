import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    phone: '',
    address: '',
    logo_url: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser.license_validated) {
        window.location.href = '/LicenseEntry';
        return;
      }
      setUser(currentUser);
      setFormData({
        company_name: currentUser.company_name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        logo_url: currentUser.logo_url || ''
      });
    } catch (err) {
      window.location.href = '/LicenseEntry';
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
          <a href="/Dashboard" className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="space-y-6">
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