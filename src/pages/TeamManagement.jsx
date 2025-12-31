import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Edit2,
  Trash2, 
  Users,
  Loader2,
  Mail,
  Phone,
  DollarSign,
  Calendar
} from 'lucide-react';

export default function TeamManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'driver',
    hourly_rate: '',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active',
    emergency_contact_name: '',
    emergency_contact_phone: '',
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

      const allMembers = await base44.entities.TeamMember.list('-created_date');
      setTeamMembers(allMembers);
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
      const data = {
        ...formData,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null
      };

      if (editingMember) {
        await base44.entities.TeamMember.update(editingMember.id, data);
      } else {
        await base44.entities.TeamMember.create(data);
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'driver',
        hourly_rate: '',
        hire_date: new Date().toISOString().split('T')[0],
        status: 'active',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        notes: ''
      });
      setShowForm(false);
      setEditingMember(null);
      await loadData();
    } catch (err) {
      alert('Error saving team member');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'driver',
      hourly_rate: member.hourly_rate || '',
      hire_date: member.hire_date || new Date().toISOString().split('T')[0],
      status: member.status || 'active',
      emergency_contact_name: member.emergency_contact_name || '',
      emergency_contact_phone: member.emergency_contact_phone || '',
      notes: member.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await base44.entities.TeamMember.delete(id);
      await loadData();
    } catch (err) {
      alert('Error deleting team member');
    }
  };

  const activeMembers = teamMembers.filter(m => m.status === 'active');

  const roleColors = {
    driver: 'bg-blue-100 text-blue-700',
    helper: 'bg-green-100 text-green-700',
    technician: 'bg-purple-100 text-purple-700',
    cleaner: 'bg-pink-100 text-pink-700',
    landscaper: 'bg-emerald-100 text-emerald-700',
    manager: 'bg-orange-100 text-orange-700',
    other: 'bg-slate-100 text-slate-700'
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
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Users className="w-6 h-6 md:w-8 md:h-8" />
                Team Management
              </h1>
              <p className="text-slate-400 mt-1">{activeMembers.length} active team members</p>
            </div>
            <Button
              onClick={() => {
                setEditingMember(null);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  role: 'driver',
                  hourly_rate: '',
                  hire_date: new Date().toISOString().split('T')[0],
                  status: 'active',
                  emergency_contact_name: '',
                  emergency_contact_phone: '',
                  notes: ''
                });
                setShowForm(!showForm);
              }}
              className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {showForm && (
          <Card className="shadow-lg mb-6">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label>Role *</Label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full mt-1 h-10 px-3 rounded-md border border-slate-300 bg-white"
                      required
                    >
                      <option value="driver">Driver</option>
                      <option value="helper">Helper</option>
                      <option value="technician">Technician</option>
                      <option value="cleaner">Cleaner</option>
                      <option value="landscaper">Landscaper</option>
                      <option value="manager">Manager</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Hourly Rate</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                        placeholder="15.00"
                        className="pl-7"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Hire Date</Label>
                    <Input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Emergency Contact Name</Label>
                    <Input
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      placeholder="Jane Doe"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Emergency Contact Phone</Label>
                    <Input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      placeholder="(555) 987-6543"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Status</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full mt-1 h-10 px-3 rounded-md border border-slate-300 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional information..."
                    className="mt-1 h-20"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingMember ? 'Update Team Member' : 'Add Team Member'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMember(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-medium mb-2">No team members yet</p>
                <p className="text-slate-500 mb-6">Add your first team member to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-900">{member.name}</h3>
                        <Badge className={roleColors[member.role]}>
                          {member.role}
                        </Badge>
                        <Badge className={member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                          {member.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                        {member.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </div>
                        )}
                        {member.hourly_rate && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${member.hourly_rate}/hr
                          </div>
                        )}
                        {member.hire_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Hired: {new Date(member.hire_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(member)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(member.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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