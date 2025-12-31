import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Gift, Users } from 'lucide-react';

export default function LoyaltyStatus({ customer }) {
  const tierConfig = {
    bronze: {
      color: 'bg-orange-100 text-orange-700 border-orange-300',
      icon: '🥉',
      name: 'Bronze Member',
      nextTier: 'Silver',
      pointsNeeded: 500,
      benefits: ['5% discount on jobs', 'Priority scheduling']
    },
    silver: {
      color: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: '🥈',
      name: 'Silver Member',
      nextTier: 'Gold',
      pointsNeeded: 1000,
      benefits: ['10% discount on jobs', 'Priority scheduling', 'Free dump fee waiver']
    },
    gold: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      icon: '🥇',
      name: 'Gold Member',
      nextTier: null,
      pointsNeeded: null,
      benefits: ['15% discount on jobs', 'Priority scheduling', 'Free dump fee waiver', 'Free same-day service']
    }
  };

  const currentTier = tierConfig[customer.loyalty_tier || 'bronze'];
  const points = customer.loyalty_points || 0;
  const referrals = customer.referrals_made || 0;
  
  const pointsToNextTier = currentTier.nextTier 
    ? currentTier.pointsNeeded - points 
    : 0;
  
  const progressPercent = currentTier.nextTier
    ? Math.min((points / currentTier.pointsNeeded) * 100, 100)
    : 100;

  const shareLink = `${window.location.origin}/LicenseEntry?ref=${encodeURIComponent(customer.email)}`;

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Referral link copied! Share with friends to earn bonus points.');
  };

  return (
    <Card className="shadow-lg border-2" style={{ borderColor: currentTier.color.split(' ')[0].replace('bg-', '#') }}>
      <CardHeader className={`${currentTier.color.split(' ')[0]} border-b`}>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Loyalty Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Current Tier */}
        <div className="text-center">
          <div className="text-6xl mb-2">{currentTier.icon}</div>
          <Badge className={`${currentTier.color} text-lg px-4 py-2 border-2`}>
            {currentTier.name}
          </Badge>
        </div>

        {/* Points */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Points Balance</span>
            </div>
            <span className="text-2xl font-bold text-emerald-600">{points}</span>
          </div>
          
          {currentTier.nextTier && (
            <>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-slate-600 text-center mt-2">
                {pointsToNextTier} points to {currentTier.nextTier}
              </p>
            </>
          )}
        </div>

        {/* Benefits */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-600" />
            Your Benefits
          </h4>
          <ul className="space-y-2">
            {currentTier.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-emerald-600">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Referrals */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Referrals</span>
            </div>
            <Badge className="bg-purple-100 text-purple-700">{referrals}</Badge>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Earn <strong>100 points</strong> for each friend who books a job!
          </p>
          <button
            onClick={handleCopyReferralLink}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors"
          >
            Copy Referral Link
          </button>
        </div>

        {/* How to Earn */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold mb-2 text-blue-900">How to Earn Points</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Complete a job: <strong>50 points</strong></li>
            <li>• Refer a friend: <strong>100 points</strong></li>
            <li>• Book 5+ jobs: <strong>Bonus 200 points</strong></li>
            <li>• Write a review: <strong>25 points</strong></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}