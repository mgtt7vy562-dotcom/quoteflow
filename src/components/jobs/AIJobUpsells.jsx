import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, DollarSign } from 'lucide-react';

export default function AIJobUpsells({ job }) {
  const [upsells, setUpsells] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateUpsells = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a junk removal sales expert. Based on this current job, suggest upsell opportunities.

Current Job Details:
- Customer: ${job.customer_name}
- Load Size: ${job.load_size}
- Debris Type: ${job.debris_type}
- Items: ${job.items_description}
- Price: $${job.total_price}
- Address: ${job.customer_address}

Provide 3-5 specific upsell recommendations that would be relevant to this customer. Consider:
- Additional services they might need while you're there
- Future recurring services
- Related services based on debris type
- Seasonal opportunities

For each recommendation, include a compelling pitch and estimated price.`,
        response_json_schema: {
          type: "object",
          properties: {
            upsells: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  service: { type: "string" },
                  pitch: { type: "string" },
                  estimated_price: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setUpsells(response.upsells);
    } catch (err) {
      alert('Error generating upsell recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!upsells ? (
        <div className="text-center py-4">
          <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-3" />
          <p className="text-sm text-slate-600 mb-3">
            Get AI-powered upsell recommendations for this job
          </p>
          <Button
            onClick={generateUpsells}
            disabled={loading}
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
                Generate Recommendations
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {upsells.map((upsell, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                upsell.priority === 'high'
                  ? 'bg-green-50 border-green-300'
                  : 'bg-purple-50 border-purple-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-slate-900">{upsell.service}</h4>
                <span className="text-sm font-bold text-emerald-600">
                  {upsell.estimated_price}
                </span>
              </div>
              <p className="text-sm text-slate-700 mb-2">{upsell.pitch}</p>
              {upsell.priority === 'high' && (
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">
                  HIGH PRIORITY
                </span>
              )}
            </div>
          ))}
          
          <Button
            onClick={generateUpsells}
            variant="outline"
            size="sm"
            disabled={loading}
            className="w-full mt-2"
          >
            <Sparkles className="w-3 h-3 mr-2" />
            Refresh Recommendations
          </Button>
        </div>
      )}
    </div>
  );
}