import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Loader2, CheckCircle } from 'lucide-react';

export default function EmailBroadcast({ users }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Users', count: users.length },
    { value: 'active', label: 'Active Subscribers', count: users.filter(u => u.subscription_status === 'active').length },
    { value: 'trial', label: 'Trial Users', count: users.filter(u => u.subscription_status === 'trial').length },
    { value: 'inactive', label: 'Inactive Users', count: users.filter(u => !u.subscription_status || u.subscription_status === 'inactive').length }
  ];

  const getFilteredUsers = () => {
    switch (selectedFilter) {
      case 'active':
        return users.filter(u => u.subscription_status === 'active');
      case 'trial':
        return users.filter(u => u.subscription_status === 'trial');
      case 'inactive':
        return users.filter(u => !u.subscription_status || u.subscription_status === 'inactive');
      default:
        return users;
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please enter both subject and message');
      return;
    }

    const filteredUsers = getFilteredUsers();
    if (filteredUsers.length === 0) {
      alert('No users match the selected filter');
      return;
    }

    if (!confirm(`Send email to ${filteredUsers.length} users?`)) {
      return;
    }

    setSending(true);
    try {
      // Send emails to all filtered users
      await Promise.all(
        filteredUsers.map(user =>
          base44.integrations.Core.SendEmail({
            to: user.email,
            subject: subject,
            body: message
          })
        )
      );
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setSubject('');
        setMessage('');
      }, 3000);
    } catch (err) {
      alert('Error sending emails: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = getFilteredUsers();

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Email Broadcast
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Filter Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Send to:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedFilter === option.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-sm">{option.label}</div>
                <div className="text-2xl font-bold text-emerald-600">{option.count}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Email Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              disabled={sending}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Email message..."
              rows={8}
              disabled={sending}
            />
          </div>
        </div>

        {/* Send Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-slate-600">
            Will send to <strong>{filteredUsers.length}</strong> user{filteredUsers.length !== 1 ? 's' : ''}
          </p>
          <Button
            onClick={handleSend}
            disabled={sending || sent}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : sent ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Sent!
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}