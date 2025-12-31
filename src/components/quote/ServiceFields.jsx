import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Junk Removal Fields
export function JunkRemovalFields({ formData, setFormData }) {
  return (
    <>
      <div>
        <Label>Load Size *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {[
            { value: 'minimum_pickup', label: 'Minimum Pickup' },
            { value: 'quarter_load', label: '1/4 Load' },
            { value: 'half_load', label: '1/2 Load' },
            { value: 'three_quarter_load', label: '3/4 Load' },
            { value: 'full_load', label: 'Full Load' },
            { value: 'other', label: 'Other' }
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={formData.load_size === option.value ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, load_size: option.value })}
              className={formData.load_size === option.value ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Type of Debris *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { value: 'household_items', label: 'Household Items' },
            { value: 'construction_debris', label: 'Construction Debris' },
            { value: 'outdoor_debris', label: 'Outdoor Debris' },
            { value: 'mixed_trash', label: 'Mixed Trash' },
            { value: 'other', label: 'Other' }
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={formData.debris_type === option.value ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, debris_type: option.value })}
              className={formData.debris_type === option.value ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}

// Lawn Care Fields
export function LawnCareFields({ formData, setFormData }) {
  return (
    <>
      <div>
        <Label>Property Size (sq ft)</Label>
        <Input
          type="number"
          value={formData.property_size || ''}
          onChange={(e) => setFormData({ ...formData, property_size: e.target.value })}
          placeholder="5000 (optional)"
          className="mt-2"
        />
      </div>

      <div>
        <Label>Service Type *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { value: 'one_time', label: 'One-Time' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'bi_weekly', label: 'Bi-Weekly' },
            { value: 'monthly', label: 'Monthly' }
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={formData.service_frequency === option.value ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, service_frequency: option.value })}
              className={formData.service_frequency === option.value ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Services Included</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['mowing', 'edging', 'trimming', 'fertilizing', 'leaf_removal', 'aeration'].map((service) => (
            <label key={service} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={(formData.lawn_services || []).includes(service)}
                onChange={(e) => {
                  const services = formData.lawn_services || [];
                  if (e.target.checked) {
                    setFormData({ ...formData, lawn_services: [...services, service] });
                  } else {
                    setFormData({ ...formData, lawn_services: services.filter(s => s !== service) });
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm capitalize">{service.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

// Residential Cleaning Fields
export function ResidentialCleaningFields({ formData, setFormData }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Bedrooms *</Label>
          <Input
            type="number"
            min="0"
            value={formData.bedrooms || ''}
            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            placeholder="3"
            className="mt-2"
          />
        </div>
        <div>
          <Label>Bathrooms *</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={formData.bathrooms || ''}
            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            placeholder="2"
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label>Square Footage (optional)</Label>
        <Input
          type="number"
          value={formData.square_footage || ''}
          onChange={(e) => setFormData({ ...formData, square_footage: e.target.value })}
          placeholder="1500"
          className="mt-2"
        />
      </div>

      <div>
        <Label>Cleaning Type *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { value: 'standard', label: 'Standard Clean' },
            { value: 'deep', label: 'Deep Clean' },
            { value: 'move_in', label: 'Move-In/Out' },
            { value: 'post_construction', label: 'Post-Construction' }
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={formData.cleaning_type === option.value ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, cleaning_type: option.value })}
              className={formData.cleaning_type === option.value ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Frequency *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { value: 'one_time', label: 'One-Time' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'bi_weekly', label: 'Bi-Weekly' },
            { value: 'monthly', label: 'Monthly' }
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={formData.cleaning_frequency === option.value ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, cleaning_frequency: option.value })}
              className={formData.cleaning_frequency === option.value ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Add-On Services</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['windows', 'oven', 'fridge', 'laundry', 'baseboards', 'walls'].map((service) => (
            <label key={service} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={(formData.cleaning_addons || []).includes(service)}
                onChange={(e) => {
                  const addons = formData.cleaning_addons || [];
                  if (e.target.checked) {
                    setFormData({ ...formData, cleaning_addons: [...addons, service] });
                  } else {
                    setFormData({ ...formData, cleaning_addons: addons.filter(s => s !== service) });
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm capitalize">{service}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}