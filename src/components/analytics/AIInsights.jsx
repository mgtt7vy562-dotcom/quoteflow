import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function AIInsights({ jobs, customers, revenue, expenses }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const customerData = customers.map(c => ({
        total_jobs: c.total_jobs || 0,
        total_revenue: c.total_revenue || 0,
        source: c.source
      }));

      const jobData = jobs.map(j => ({
        load_size: j.load_size,
        debris_type: j.debris_type,
        price: j.total_price
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a business intelligence expert for a junk removal company. Analyze this data and provide actionable insights.

Business Data:
- Total Revenue: $${revenue}
- Total Expenses: $${expenses}
- Total Jobs: ${jobs.length}
- Total Customers: ${customers.length}

Job Distribution:
${JSON.stringify(jobData.slice(0, 50))}

Customer Data:
${JSON.stringify(customerData.slice(0, 30))}

Provide:
1. Top 3 upsell opportunities (specific services or add-ons to offer based on patterns)
2. Customer retention strategies (identify at-risk customers or repeat business opportunities)
3. Pricing optimization suggestions
4. Operational efficiency recommendations
5. Marketing focus areas

Be specific and actionable. Focus on revenue growth opportunities.`,
        response_json_schema: {
          type: "object",
          properties: {
            upsell_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  potential_revenue: { type: "string" }
                }
              }
            },
            retention_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            pricing_insights: { type: "string" },
            efficiency_tips: { type: "string" },
            marketing_focus: { type: "string" }
          }
        }
      });

      setInsights(response);
    } catch (err) {
      alert('Error generating insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!insights ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">Get AI-powered recommendations to grow your business</p>
          <Button
            onClick={generateInsights}
            disabled={loading || jobs.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upsell Opportunities */}
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Upsell Opportunities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insights.upsell_opportunities?.map((opp, idx) => (
                <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-1">{opp.title}</h4>
                  <p className="text-sm text-green-700 mb-2">{opp.description}</p>
                  <p className="text-xs font-bold text-green-600">{opp.potential_revenue}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Retention Strategies */}
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Customer Retention
            </h3>
            <div className="space-y-2">
              {insights.retention_strategies?.map((strategy, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-900 text-sm">{strategy.title}</h4>
                  <p className="text-sm text-blue-700">{strategy.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Pricing Insights</h4>
              <p className="text-sm text-purple-700">{insights.pricing_insights}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Efficiency Tips</h4>
              <p className="text-sm text-orange-700">{insights.efficiency_tips}</p>
            </div>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h4 className="font-semibold text-pink-900 mb-2">Marketing Focus</h4>
              <p className="text-sm text-pink-700">{insights.marketing_focus}</p>
            </div>
          </div>

          <Button
            onClick={generateInsights}
            variant="outline"
            size="sm"
            disabled={loading}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate Insights
          </Button>
        </div>
      )}
    </div>
  );
}