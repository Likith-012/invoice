import React, { useState } from 'react';
import { parseInvoiceItemsFromText } from '../services/geminiService';
import { LineItem } from '../types';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface SmartInputProps {
  onItemsParsed: (items: LineItem[]) => void;
}

const SmartInput: React.FC<SmartInputProps> = ({ onItemsParsed }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const items = await parseInvoiceItemsFromText(input);
      onItemsParsed(items);
      setInput('');
    } catch (err) {
      setError("Failed to parse. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
      <div className="flex items-center space-x-2 mb-3 text-indigo-700">
        <Sparkles size={18} />
        <h3 className="font-semibold text-sm uppercase tracking-wide">AI Magic Fill</h3>
      </div>
      <p className="text-slate-600 text-sm mb-3">
        Paste a work log or describe items naturally (e.g., "Web design 10 hours at $50, Hosting $20").
      </p>
      
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
          className="w-full p-3 pr-12 rounded-lg border border-blue-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm shadow-sm min-h-[80px]"
        />
        <button
          onClick={handleParse}
          disabled={loading || !input.trim()}
          className="absolute bottom-3 right-3 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default SmartInput;