import React from 'react';
import { ArrowRight, CheckCircle, Zap, FileText, Shield } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 p-1.5 rounded-lg">
             <FileText className="text-white" size={20} />
           </div>
           <span className="text-xl font-bold text-slate-800 tracking-tight">Invoicify AI</span>
        </div>
        <button 
          onClick={onLogin}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300 shadow-sm"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="px-6 pt-16 pb-24 text-center max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
          New: AI-Powered Parsing
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
          Create professional invoices <span className="text-blue-600">in seconds.</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop wrestling with spreadsheets. Use our AI-driven invoice generator to create, customize, and manage invoices with zero friction.
        </p>
        
        <button 
          onClick={onGetStarted}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-full hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/10"
        >
          Get Started Now
          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
        </button>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">AI Magic Input</h3>
            <p className="text-slate-600 leading-relaxed">
              Paste rough notes or chat logs, and our AI automatically formats them into structured line items.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Custom Branding</h3>
            <p className="text-slate-600 leading-relaxed">
              Upload your logo, create custom watermarks, and tweak margins to fit your company letterhead perfectly.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Client Management</h3>
            <p className="text-slate-600 leading-relaxed">
              Store client details securely in your browser. One-click autofill for recurring invoices.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Invoicify AI. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;