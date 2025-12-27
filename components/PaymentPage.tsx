import React, { useState } from 'react';
import { CreditCard, Lock, Check, Loader2, ShieldCheck } from 'lucide-react';

interface PaymentPageProps {
  onPaymentSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  // Simple formatter for visual appeal
  const formatCard = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().substring(0, 19);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left Side: Product Summary */}
        <div className="bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Invoicify Premium</h2>
            <p className="text-slate-400">Lifetime Access</p>
            
            <div className="mt-12">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold">₹50</span>
                <span className="text-slate-400 mb-1 line-through">₹499</span>
              </div>
              <p className="text-emerald-400 text-sm mt-2 font-medium">Limited Time Offer</p>
            </div>

            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3">
                <div className="bg-white/10 p-1 rounded-full"><Check size={14} /></div>
                <span className="text-slate-300">Unlimited Invoices</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-white/10 p-1 rounded-full"><Check size={14} /></div>
                <span className="text-slate-300">Custom Templates & Branding</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-white/10 p-1 rounded-full"><Check size={14} /></div>
                <span className="text-slate-300">AI-Powered Magic Input</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-white/10 p-1 rounded-full"><Check size={14} /></div>
                <span className="text-slate-300">No Monthly Fees</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-12 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} />
            <span>Secure 256-bit SSL Encryption</span>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="p-10">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800">Payment Details</h3>
            <p className="text-sm text-slate-500">Complete your purchase to start invoicing.</p>
          </div>

          <form onSubmit={handlePay} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Card Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  required
                />
                <CreditCard className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Expiry Date</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => {
                     let v = e.target.value.replace(/\D/g, '');
                     if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2,4);
                     setExpiry(v);
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">CVC</label>
                <div className="relative">
                  <input 
                    type="password" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    placeholder="123"
                    maxLength={3}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹50.00</>
                )}
              </button>
            </div>
            
            <p className="text-center text-xs text-slate-400 mt-4">
              This is a secure mock payment. No real money will be deducted.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;