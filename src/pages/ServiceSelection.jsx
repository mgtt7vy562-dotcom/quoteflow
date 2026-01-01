import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Leaf, Sparkles, Loader2 } from 'lucide-react';

export default function ServiceSelection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // If service already selected, redirect to dashboard
      if (currentUser.service_type) {
        window.location.href = '/Dashboard';
      }
    } catch (err) {
      window.location.href = '/Landing';
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = async (serviceType) => {
    setSaving(true);
    try {
      // Set 30-day free trial when selecting service
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);
      
      await base44.auth.updateMe({ 
        service_type: serviceType,
        subscription_status: 'trial',
        trial_ends_at: trialEndsAt.toISOString()
      });
      window.location.href = '/TaxRateSetup';
    } catch (err) {
      alert('Error saving service type');
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

  const services = [
    {
      id: 'junk_removal',
      name: 'Junk Removal',
      icon: Trash2,
      color: 'emerald',
      description: 'Volume-based pricing for hauling items, debris, and trash',
      features: ['Load size estimation', 'Debris categorization', 'Before/after photos', 'Dump fee tracking']
    },
    {
      id: 'lawn_care',
      name: 'Lawn Care',
      icon: Leaf,
      color: 'green',
      description: 'Square footage based pricing for mowing, edging, and landscaping',
      features: ['Property size calculator', 'Recurring service schedules', 'Seasonal packages', 'Add-on services']
    },
    {
      id: 'residential_cleaning',
      name: 'Residential Cleaning',
      icon: Sparkles,
      color: 'blue',
      description: 'Room-based pricing for home cleaning services',
      features: ['Bedroom/bathroom count', 'Cleaning frequency options', 'Deep clean packages', 'Move-in/move-out']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to QuoteFlow CRM!</h1>
          <p className="text-xl text-slate-300">Choose your service type to get started</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-12">
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            const colors = {
              emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
              green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
              blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            };

            return (
              <Card
                key={service.id}
                className="hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => !saving && handleSelectService(service.id)}
              >
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors[service.color]} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-center mb-3 text-slate-900">
                    {service.name}
                  </h3>
                  
                  <p className="text-slate-600 text-center mb-4 text-sm">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${service.color}-500`} />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    disabled={saving}
                    className={`w-full bg-gradient-to-r ${colors[service.color]} text-white border-0 h-12 text-lg font-semibold`}
                    onClick={() => !saving && handleSelectService(service.id)}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      'Select This Service'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Don't worry - you can change this later in Settings
          </p>
        </div>
      </div>
    </div>
  );
}