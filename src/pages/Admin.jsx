import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Key, 
  Trash2, 
  Plus,
  Loader2,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Admin() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [newKey, setNewKey] = useState({
    key: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const allKeys = await base44.entities.LicenseKey.list('-created_date');
      setKeys(allKeys);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 4;
    
    let key = '';
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segmentLength; j++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < segments - 1) key += '-';
    }
    
    setNewKey({ ...newKey, key });
  };

  const handleCreate = async () => {
    if (!newKey.key || !newKey.email) {
      alert('Please fill in all fields');
      return;
    }

    setGenerating(true);
    try {
      await base44.entities.LicenseKey.create({
        key: newKey.key,
        email: newKey.email,
        is_active: true,
        product_name: 'Quote Generator'
      });
      
      setNewKey({ key: '', email: '', is_active: true });
      await loadKeys();
      alert('License key created!');
    } catch (err) {
      alert('Error creating key');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this license key?')) return;
    
    try {
      await base44.entities.LicenseKey.delete(id);
      await loadKeys();
    } catch (err) {
      alert('Error deleting key');
    }
  };

  const handleToggleActive = async (keyData) => {
    try {
      await base44.entities.LicenseKey.update(keyData.id, {
        ...keyData,
        is_active: !keyData.is_active
      });
      await loadKeys();
    } catch (err) {
      alert('Error updating key');
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
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Admin - License Keys
          </h1>
          <p className="text-slate-400 mt-2">Manage license keys for Quote Generator</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Create New Key */}
        <Card className="shadow-lg mb-8">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New License Key
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label>License Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newKey.key}
                    onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomKey}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <Label>Customer Email</Label>
                <Input
                  type="email"
                  value={newKey.email}
                  onChange={(e) => setNewKey({ ...newKey, email: e.target.value })}
                  placeholder="customer@email.com"
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={generating}
                className="w-full bg-emerald-500 hover:bg-emerald-600 h-12"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create License Key
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Keys List */}
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>All License Keys ({keys.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {keys.length === 0 ? (
              <div className="text-center py-12">
                <Key className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No license keys yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((keyData) => (
                  <div
                    key={keyData.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-sm font-mono bg-white px-3 py-1 rounded border">
                          {keyData.key}
                        </code>
                        {keyData.is_active ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{keyData.email}</p>
                      <p className="text-xs text-slate-500">
                        Created: {new Date(keyData.created_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(keyData)}
                        className={keyData.is_active ? 'text-orange-600 border-orange-600' : 'text-green-600 border-green-600'}
                      >
                        {keyData.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(keyData.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
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