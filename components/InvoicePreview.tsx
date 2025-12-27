import React, { useState } from 'react';
import { InvoiceData, InvoiceTheme, DEFAULT_THEMES } from '../types';

interface InvoicePreviewProps {
  data: InvoiceData;
  logoSrc?: string;
  templateId?: string;
  showWatermark?: boolean;
  customThemes?: InvoiceTheme[];
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  data, 
  logoSrc, 
  templateId = 'classic-blue',
  showWatermark = false,
  customThemes = []
}) => {
  const [timestamp] = useState(Date.now());
  
  // Merge default themes with custom ones to find the active theme
  const allThemes = { ...DEFAULT_THEMES };
  customThemes.forEach(t => {
    allThemes[t.id] = t;
  });

  const theme = allThemes[templateId] || DEFAULT_THEMES['classic-blue'];
  
  // Helpers
  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const total = subtotal;
  const isQuotation = data.type === 'quotation';
  const { sender, client, items } = data;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

  // --- Subcomponents for Rendering ---

  const Logo = ({ className }: { className?: string }) => (
    <div className={className}>
      <img 
        src={logoSrc || `/logo.png?t=${timestamp}`}
        alt="Logo" 
        className="h-20 w-auto object-contain"
        onError={(e) => {
           e.currentTarget.style.display = 'none';
           document.getElementById(`fallback-${templateId}`)?.classList.remove('hidden');
        }}
      />
      <div id={`fallback-${templateId}`} className="hidden font-bold text-2xl tracking-tighter border-2 border-current px-2 py-1 inline-block">
        {sender.name.substring(0,2).toUpperCase()}
      </div>
    </div>
  );

  const Watermark = () => {
    if (!showWatermark) return null;
    return (
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] z-0 overflow-hidden">
         {logoSrc ? (
            <img src={logoSrc} className="w-3/4 max-w-[500px] grayscale" />
         ) : (
            <svg width="400" height="400" viewBox="0 0 100 100" fill={theme.colors.primary}>
               <path d="M50 15 L85 75 H15 L50 15Z" stroke={theme.colors.primary} strokeWidth="5" fill="none" />
               <text x="50" y="50" textAnchor="middle" fontSize="10" fill={theme.colors.primary}>INVOICE</text>
            </svg>
         )}
       </div>
    );
  };

  const Table = ({ transparentHeader = false }: { transparentHeader?: boolean }) => (
    <div className="relative z-10 w-full mb-6">
      {/* Header */}
      <div 
        className={`flex text-xs font-bold py-2 px-4 uppercase tracking-wider ${transparentHeader ? 'border-b-2 border-slate-800' : ''}`}
        style={{ 
          backgroundColor: transparentHeader ? 'transparent' : theme.colors.primary, 
          color: transparentHeader ? theme.colors.text : (theme.colors.headerText || 'white')
        }}
      >
        <div className="w-[10%]">#</div>
        <div className="w-[50%]">Description</div>
        <div className="w-[20%] text-right">{isQuotation ? 'Rate' : 'Cost'}</div>
        <div className="w-[20%] text-right">Amount</div>
      </div>

      {/* Rows */}
      <div className="min-h-[200px]">
        {items.map((item, index) => (
          <div key={item.id} className="flex text-sm py-3 px-4 border-b border-slate-100 last:border-0" style={{ color: theme.colors.text }}>
              <div className="w-[10%] opacity-70">{index + 1}</div>
              <div className="w-[50%] font-medium">{item.description}</div>
              <div className="w-[20%] text-right">{currencyFormatter.format(item.unitPrice)}</div>
              <div className="w-[20%] text-right font-bold">{currencyFormatter.format(item.quantity * item.unitPrice)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const Totals = () => (
    <div className="w-full">
       <div className="flex justify-between py-2 border-b border-slate-200">
          <span className="text-slate-500 text-sm">Subtotal</span>
          <span className="font-medium">{currencyFormatter.format(subtotal)}</span>
       </div>
       <div 
         className="flex justify-between py-3 mt-2 font-bold text-lg"
         style={{ color: theme.colors.primary }}
       >
          <span>TOTAL</span>
          <span>{currencyFormatter.format(total)}</span>
       </div>
    </div>
  );

  const PaymentInfo = () => (
    <div className="text-sm space-y-1" style={{ color: theme.colors.text }}>
        <p className="font-bold text-xs uppercase mb-2 opacity-70">Payment Details</p>
        <div className="grid grid-cols-[80px_1fr] gap-x-2">
            {sender.accountName && <><span className="opacity-60">Name:</span> <span>{sender.accountName}</span></>}
            {sender.accountNumber && <><span className="opacity-60">Acc No:</span> <span>{sender.accountNumber}</span></>}
            {sender.ifsCode && <><span className="opacity-60">IFSC:</span> <span>{sender.ifsCode}</span></>}
            {sender.branch && <><span className="opacity-60">Branch:</span> <span>{sender.branch}</span></>}
            {sender.pan && <><span className="opacity-60">PAN:</span> <span>{sender.pan}</span></>}
        </div>
    </div>
  );


  // --- LAYOUTS ---

  // 1. STANDARD LAYOUT (Classic Waves/Header)
  if (theme.layout === 'standard') {
    return (
      <div className={`bg-white shadow-2xl w-[210mm] min-h-[297mm] mx-auto relative flex flex-col overflow-hidden print-exact-a4 ${theme.font === 'serif' ? 'font-serif' : theme.font === 'mono' ? 'font-mono' : 'font-sans'}`}>
        
        {/* Decorative Header (Waves or Solid Block) */}
        <div className="absolute top-0 left-0 right-0 h-40 z-0 pointer-events-none" style={{ fill: theme.colors.primary }}>
            {theme.id.includes('classic') ? (
               <svg viewBox="0 0 794 160" preserveAspectRatio="none" className="w-full h-full">
                 <path d="M0,0 L794,0 L794,40 C600,100 200,60 0,120 Z" fill={theme.colors.accent} opacity="0.4" />
                 <path d="M0,0 L794,0 L794,20 C500,60 300,60 0,40 Z" fill={theme.colors.primary} />
               </svg>
            ) : (
               <div className="w-full h-32" style={{ backgroundColor: theme.colors.primary }}></div>
            )}
        </div>

        <div className="relative z-10 px-12 pt-16 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-12">
               <div>
                  <h1 className="text-5xl mb-2 uppercase tracking-wide font-bold" style={{ color: theme.colors.text }}>
                    {isQuotation ? 'Quotation' : 'Invoice'}
                  </h1>
                  <div className="text-sm font-medium opacity-70">
                     <p># {data.invoiceNumber}</p>
                     <p>Date: {formatDate(data.date)}</p>
                  </div>
               </div>
               <div className="mt-4"><Logo /></div>
            </div>

            <div className="flex justify-between items-start mb-10 gap-8">
               <div className="flex-1">
                  <h3 className="font-bold text-xs uppercase mb-2 opacity-60">Bill To</h3>
                  {client ? (
                     <div className="text-sm font-medium leading-relaxed">
                        <p className="text-lg mb-1">{client.name}</p>
                        <p className="whitespace-pre-line opacity-80">{client.address}</p>
                        {client.gstin && <p className="mt-1 text-xs">GSTIN: {client.gstin}</p>}
                     </div>
                  ) : <p className="italic text-slate-400">Select Client...</p>}
               </div>
               <div className="flex-1 text-right">
                  <h3 className="font-bold text-xs uppercase mb-2 opacity-60">From</h3>
                  <div className="text-sm font-medium leading-relaxed">
                     <p className="text-lg mb-1">{sender.name}</p>
                     <p className="whitespace-pre-line opacity-80">{sender.address}</p>
                     <p className="mt-1">{sender.website}</p>
                  </div>
               </div>
            </div>

            <div className="relative min-h-[400px]">
               <Watermark />
               <Table />
            </div>

            <div className="mt-auto pb-16 flex justify-between items-end">
               <div className="w-[50%]"><PaymentInfo /></div>
               <div className="w-[40%]"><Totals /></div>
            </div>
        </div>

        {/* Footer Wave/Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 z-0" style={{ backgroundColor: theme.colors.primary }}></div>
      </div>
    );
  }

  // 2. SIDEBAR LAYOUT
  if (theme.layout === 'sidebar') {
    return (
      <div className={`bg-white shadow-2xl w-[210mm] min-h-[297mm] mx-auto flex overflow-hidden print-exact-a4 text-slate-800 ${theme.font === 'serif' ? 'font-serif' : theme.font === 'mono' ? 'font-mono' : 'font-sans'}`}>
         {/* Sidebar */}
         <div className="w-[32%] h-full p-8 flex flex-col" style={{ backgroundColor: theme.colors.sidebarBg || theme.colors.primary, color: theme.colors.sidebarText || 'white' }}>
            <div className="mb-12"><Logo className="invert brightness-0" /></div>
            
            <div className="mb-8">
               <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70 border-b border-white/20 pb-2">From</h3>
               <p className="font-bold text-lg leading-tight mb-2">{sender.name}</p>
               <p className="text-sm whitespace-pre-line opacity-80">{sender.address}</p>
               <p className="text-sm mt-4 opacity-80">{sender.email}</p>
               <p className="text-sm opacity-80">{sender.website}</p>
               <p className="text-sm opacity-80">{sender.mobile}</p>
            </div>

            <div className="mt-auto">
               <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70 border-b border-white/20 pb-2">Bank Details</h3>
               <div className="text-sm space-y-2 opacity-90">
                  <p>{sender.accountName}</p>
                  <p>{sender.accountNumber}</p>
                  <p>{sender.ifsCode}</p>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="w-[68%] p-10 flex flex-col relative">
            <div className="flex justify-between items-start mb-12">
               <div>
                  <h1 className="text-4xl font-bold uppercase tracking-tight text-slate-900 mb-1">{isQuotation ? 'Quotation' : 'Invoice'}</h1>
                  <span className="text-slate-400 text-sm"># {data.invoiceNumber}</span>
               </div>
               <div className="text-right">
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium">{formatDate(data.date)}</p>
               </div>
            </div>

            <div className="mb-10">
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Bill To</h3>
               {client ? (
                  <div>
                     <p className="text-xl font-bold text-slate-800">{client.name}</p>
                     <p className="text-sm text-slate-600 whitespace-pre-line mt-1">{client.address}</p>
                  </div>
               ) : <span className="text-slate-300">Select Client</span>}
            </div>

            <div className="relative flex-grow">
               <Watermark />
               <Table />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
               <div className="w-1/2 ml-auto">
                  <Totals />
               </div>
            </div>
         </div>
      </div>
    );
  }

  // 3. MINIMAL LAYOUT
  return (
    <div className={`bg-white shadow-2xl w-[210mm] min-h-[297mm] mx-auto relative flex flex-col p-16 overflow-hidden print-exact-a4 ${theme.font === 'serif' ? 'font-serif' : theme.font === 'mono' ? 'font-mono' : 'font-sans'}`}>
       <div className="text-center mb-12 border-b-2 border-slate-900 pb-8" style={{ borderColor: theme.colors.primary }}>
          <Logo className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold uppercase tracking-widest" style={{ color: theme.colors.primary }}>{sender.name}</h1>
          <p className="text-xs mt-2 uppercase tracking-wider">{sender.website} • {sender.mobile}</p>
       </div>

       <div className="flex justify-between items-end mb-16">
          <div>
             <h2 className="text-4xl font-bold" style={{ color: theme.colors.text }}>{isQuotation ? 'QUOTATION' : 'INVOICE'}</h2>
             <p className="text-sm mt-1"># {data.invoiceNumber} • {formatDate(data.date)}</p>
          </div>
          <div className="text-right max-w-[250px]">
             <p className="text-xs uppercase font-bold mb-1">Bill To:</p>
             {client && (
               <>
                 <p className="font-bold">{client.name}</p>
                 <p className="text-xs whitespace-pre-line">{client.address}</p>
               </>
             )}
          </div>
       </div>

       <div className="relative flex-grow">
          <Watermark />
          <Table transparentHeader={true} />
       </div>

       <div className="flex justify-between items-start mt-8 pt-8 border-t-2 border-slate-900" style={{ borderColor: theme.colors.primary }}>
          <div className="w-1/2 text-xs">
             <p className="font-bold uppercase mb-2">Payment Info:</p>
             <p>{sender.accountName}</p>
             <p>{sender.accountNumber} • {sender.ifsCode}</p>
             <p>{sender.branch}</p>
          </div>
          <div className="w-1/3 text-right">
             <div className="flex justify-between text-lg font-bold">
               <span>Total</span>
               <span>{currencyFormatter.format(total)}</span>
             </div>
          </div>
       </div>
    </div>
  );
};

export default InvoicePreview;