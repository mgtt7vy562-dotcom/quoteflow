import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus,
  Phone,
  MessageSquare,
  User,
  Loader2,
  CheckCircle,
  X,
  Edit
} from 'lucide-react';
import AILeadSuggestions from '../components/leads/AILeadSuggestions';

export default function Leads() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    message: '',
    source: 'website',
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

      const allLeads = await base44.entities.Lead.list('-created_date');
      setLeads(allLeads);
    } catch (err) {
      navigate(createPageUrl('LicenseEntry'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Lead.create(formData);
      setFormData({ phone: '', message: '', source: 'website', notes: '' });
      setShowAddForm(false);
      await loadData();
    } catch (err) {
      alert('Error adding lead');
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      await base44.entities.Lead.update(leadId, { status: newStatus });
      await loadData();
    } catch (err) {
      alert('Error updating lead');
    }
  };

  const handleUpdateNotes = async (leadId, notes) => {
    try {
      await base44.entities.Lead.update(leadId, { notes });
      setEditingLead(null);
      await loadData();
    } catch (err) {
      alert('Error updating notes');
    }
  };

  const handleConvertToCustomer = async (lead) => {
    try {
      const customerData = {
        name: lead.phone,
        phone: lead.phone,
        notes: `Converted from lead. Initial message: ${lead.message}`,
        source: lead.source
      };

      const newCustomer = await base44.entities.Customer.create(customerData);
      
      await base44.entities.Lead.update(lead.id, {
        status: 'converted',
        converted_to_customer_id: newCustomer.id
      });

      alert('Lead converted to customer!');
      await loadData();
    } catch (err) {
      alert('Error converting lead');
    }
  };

  const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    quoted: 'bg-purple-100 text-purple-700',
    converted: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700'
  };

  const filteredLeads = {
    new: leads.filter(l => l.status === 'new'),
    active: leads.filter(l => ['contacted', 'quoted'].includes(l.status)),
    closed: leads.filter(l => ['converted', 'lost'].includes(l.status))
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
        <div className="max-w-7xl mx-auto">
          <Link to={createPageUrl('Dashboard')} className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Lead Management</h1>
              <p className="text-slate-400 mt-1">{leads.length} total leads</p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Add Lead Form */}
        {showAddForm && (
          <Card className="shadow-lg mb-6">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Add New Lead</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddLead} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  <div>
                    <Label>Source</Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) => setFormData({ ...formData, source: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Message *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="What did they say? Describe their junk removal needs..."
                    className="h-24"
                    required
                  />
                </div>

                <div>
                  <Label>Internal Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    className="h-20"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                    Add Lead
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">New Leads</p>
                  <p className="text-3xl font-bold text-blue-600">{filteredLeads.new.length}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600">{filteredLeads.active.length}</p>
                </div>
                <Phone className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Converted</p>
                  <p className="text-3xl font-bold text-green-600">
                    {filteredLeads.closed.filter(l => l.status === 'converted').length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Sections */}
        {['new', 'active', 'closed'].map((section) => (
          <div key={section} className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 capitalize">
              {section === 'new' ? 'New Leads' : section === 'active' ? 'In Progress' : 'Closed Leads'}
            </h2>
            <div className="space-y-3">
              {filteredLeads[section].map((lead) => (
                <Card key={lead.id} className="shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Phone className="w-5 h-5 text-slate-500" />
                          <span className="font-bold text-lg">{lead.phone}</span>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[lead.status]}`}>
                            {lead.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(lead.created_date).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-slate-500 mb-1">Message:</p>
                          <p className="text-slate-700">{lead.message}</p>
                        </div>

                        {lead.status === 'new' && (
                          <AILeadSuggestions leadId={lead.id} message={lead.message} />
                        )}

                        {editingLead === lead.id ? (
                          <div className="space-y-2">
                            <Textarea
                              defaultValue={lead.notes || ''}
                              id={`notes-${lead.id}`}
                              placeholder="Add notes..."
                              className="h-20"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  const notes = document.getElementById(`notes-${lead.id}`).value;
                                  handleUpdateNotes(lead.id, notes);
                                }}
                              >
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingLead(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          lead.notes && (
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="text-sm text-slate-500 mb-1">Notes:</p>
                              <p className="text-sm text-slate-700">{lead.notes}</p>
                            </div>
                          )
                        )}

                        <p className="text-xs text-slate-500 mt-2">Source: {lead.source}</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {lead.status === 'new' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(lead.id, 'contacted')}
                              className="bg-yellow-500 hover:bg-yellow-600"
                            >
                              Mark Contacted
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleConvertToCustomer(lead)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <User className="w-4 h-4 mr-1" />
                              Convert
                            </Button>
                          </>
                        )}

                        {lead.status === 'contacted' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(lead.id, 'quoted')}
                              className="bg-purple-500 hover:bg-purple-600"
                            >
                              Mark Quoted
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleConvertToCustomer(lead)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <User className="w-4 h-4 mr-1" />
                              Convert
                            </Button>
                          </>
                        )}

                        {lead.status === 'quoted' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleConvertToCustomer(lead)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <User className="w-4 h-4 mr-1" />
                              Convert
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(lead.id, 'lost')}
                              variant="outline"
                              className="text-red-600 border-red-600"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Mark Lost
                            </Button>
                          </>
                        )}

                        {!['converted', 'lost'].includes(lead.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingLead(lead.id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Notes
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredLeads[section].length === 0 && (
                <p className="text-center text-slate-500 py-8">No leads in this category</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}