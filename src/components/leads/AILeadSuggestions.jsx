import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AILeadSuggestions({ leadId, message }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeLead = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a junk removal sales expert. Analyze this lead inquiry and provide recommendations.

Lead Message: "${message}"

Based on this inquiry, provide:
1. Estimated load size (minimum_pickup, quarter_load, half_load, three_quarter_load, full_load)
2. Likely debris type (household_items, construction_debris, outdoor_debris, mixed_trash)
3. Suggested base price range
4. Recommended services or add-ons to offer
5. Key selling points to mention
6. Urgency assessment (how quickly they need service)`,
        response_json_schema: {
          type: "object",
          properties: {
            estimated_load: { type: "string" },
            debris_type: { type: "string" },
            price_range: { type: "string" },
            recommended_services: {
              type: "array",
              items: { type: "string" }
            },
            selling_points: {
              type: "array",
              items: { type: "string" }
            },
            urgency: { type: "string" }
          }
        }
      });

      setSuggestions(response);
    } catch (err) {
      alert('Error analyzing lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      {!suggestions ? (
        <Button
          onClick={analyzeLead}
          disabled={loading}
          size="sm"
          variant="outline"
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 mr-1" />
              AI Recommendations
            </>
          )}
        </Button>
      ) : (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-purple-900">AI Recommendations</h4>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-purple-600 font-medium">Load Size</p>
              <p className="text-purple-900">{suggestions.estimated_load?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-purple-600 font-medium">Debris Type</p>
              <p className="text-purple-900">{suggestions.debris_type?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-purple-600 font-medium">Price Range</p>
              <p className="text-purple-900">{suggestions.price_range}</p>
            </div>
            <div>
              <p className="text-purple-600 font-medium">Urgency</p>
              <p className="text-purple-900">{suggestions.urgency}</p>
            </div>
          </div>

          {suggestions.recommended_services?.length > 0 && (
            <div>
              <p className="text-purple-600 font-medium text-sm mb-1">Upsell Services:</p>
              <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                {suggestions.recommended_services.map((service, idx) => (
                  <li key={idx}>{service}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.selling_points?.length > 0 && (
            <div>
              <p className="text-purple-600 font-medium text-sm mb-1">Key Selling Points:</p>
              <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                {suggestions.selling_points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}