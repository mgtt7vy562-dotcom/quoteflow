import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Send, 
  Mail, 
  Loader2, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EmailBroadcast({ users }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Filter users based on selection
  const getFilteredUsers = () => {
    switch (filter) {
      case 'active':
        return users.filter(u => u.subscription_status === 'active');
      case 'trial':
        return users.filter(u => u.subscription_status === 'trial');
      case 'inactive':
        return users.filter(u => 
          u.subscription_status === 'inactive' || 
          u.subscription_status === 'cancelled'
        );
      default:
        return users;
    }
  };

  const filteredUsers = getFilteredUsers();

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(u => u.email));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (email, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, email]);
    } else {
      setSelectedUsers(selectedUsers.filter(e => e !== email));
    }
  };

  const handleSend = async () => {
    if (!subject || !message || selectedUsers.length === 0) {
      alert('Please fill in subject, message, and select at least one recipient');
      return;
    }

    setSending(true);
    setSent(false);

    try {
      // Send emails to all selected users
      const promises = selectedUsers.map(email =>
        base44.integrations.Core.SendEmail({
          to: email,
          subject: subject,
          body: message,
          from_name: 'QuoteFlow CRM'
        })
      );

      await Promise.all(promises);
      
      setSent(true);
      setSubject('');
      setMessage('');
      setSelectedUsers([]);
      
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      alert('Error sending emails: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-blue-100 text-blue-700',
    inactive: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Compose Email */}
      <Card className="shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Compose Email
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subject
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              className="w-full h-64"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>{selectedUsers.length}</strong> recipient{selectedUsers.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          <Button
            onClick={handleSend}
            disabled={sending || !subject || !message || selectedUsers.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : sent ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Sent Successfully!
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Select Recipients */}
      <Card className="shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Select Recipients
            </span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Select All */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <Checkbox
              checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label className="text-sm font-medium">
              Select All ({filteredUsers.length})
            </label>
          </div>

          {/* User List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No users in this category</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.email)}
                    onCheckedChange={(checked) => handleSelectUser(user.email, checked)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.full_name || 'No Name'}
                    </p>
                    <p className="text-xs text-slate-600 truncate">{user.email}</p>
                  </div>
                  <Badge className={statusColors[user.subscription_status] || statusColors.inactive}>
                    {user.subscription_status || 'inactive'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}