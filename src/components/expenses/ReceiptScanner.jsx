import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ReceiptScanner({ onExpenseExtracted, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload the receipt image
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setReceiptImage(file_url);
      
      // Analyze with AI
      setAnalyzing(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this receipt and extract the following information:
- Total amount (just the number, no currency symbol)
- Date (in YYYY-MM-DD format, if visible)
- Vendor/merchant name
- Category (choose the most appropriate: fuel, dump_fees, equipment, maintenance, labor, fertilizer, seeds_plants, lawn_equipment, cleaning_supplies, cleaning_equipment, marketing, insurance, vehicle_maintenance, or other)
- Description (brief description of what was purchased)

If any field is not visible or unclear, return null for that field.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            amount: { type: "number" },
            date: { type: "string" },
            vendor: { type: "string" },
            category: { type: "string" },
            description: { type: "string" }
          }
        }
      });

      // Call parent with extracted data + receipt URL
      onExpenseExtracted({
        ...result,
        amount: result.amount?.toString() || '',
        date: result.date || new Date().toISOString().split('T')[0],
        description: result.description || `Receipt from ${result.vendor || 'vendor'}`,
        receipt_url: file_url
      });
    } catch (err) {
      alert('Error scanning receipt: ' + err.message);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Scan Receipt</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {receiptImage && (
            <div className="mb-4">
              <img src={receiptImage} alt="Receipt" className="w-full rounded-lg border" />
            </div>
          )}

          {(uploading || analyzing) ? (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">
                {uploading ? 'Uploading receipt...' : 'Analyzing with AI...'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                  <span>
                    <Camera className="w-5 h-5 mr-2" />
                    Take Photo
                  </span>
                </Button>
              </label>

              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Image
                  </span>
                </Button>
              </label>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}