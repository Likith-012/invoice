import React, { useState } from 'react';
import { InvoiceData, InvoiceTheme, DEFAULT_THEMES } from '../types';

interface InvoicePreviewProps {
  data: InvoiceData;
  logoSrc?: string;
  templateId?: string;
  showWatermark?: boolean;
  customThemes?: InvoiceTheme[];
  customWatermark?: string;
  watermarkOpacity?: number;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  data, 
  logoSrc, 
  templateId = 'classic-blue',
  showWatermark = false,
  customThemes = [],
  customWatermark,
  watermarkOpacity = 10
}) => {
  const [timestamp] = useState(Date.now());
  
  // Merge default themes with custom ones to find the active theme
  const allThemes = { ...DEFAULT_THEMES };
  customThemes.forEach(t => {
    allThemes[t.id] = t;
  });

  const theme = allThemes[templateId] || DEFAULT_THEMES['classic-blue'];
  
  // Custom Config Extraction
  const bgOpacity = theme.customConfig?.backgroundOpacity !== undefined ? theme.customConfig.backgroundOpacity / 100 : 1;
  const marginTop = theme.customConfig?.marginTop !== undefined ? `${theme.customConfig.marginTop}mm` : undefined;
  const marginBottom = theme.customConfig?.marginBottom !== undefined ? `${theme.customConfig.marginBottom}mm` : undefined;

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

  const formatDate = (d: string) => {
    if (!d) return '';
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // --- Subcomponents for Rendering ---

  const Logo = ({ className }: { className?: string }) => (
    <div className={className}>
      <img 
        src={logoSrc || `/logo.png?t=${timestamp}`}
        alt="Logo" 
        className="h-16 w-auto object-contain"
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
    const watermarkSrc = customWatermark || logoSrc;
    
    return (
       <div 
         className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden" 
         style={{ opacity: watermarkOpacity / 100 }}
       >
         {watermarkSrc ? (
            <img src={watermarkSrc} className="w-3/4 max-w-[500px] grayscale object-contain" alt="Watermark" />
         ) : (
            <svg width="400" height="400" viewBox="0 0 100 100" fill={theme.colors.primary}>
               <path d="M50 15 L85 75 H15 L50 15Z" stroke={theme.colors.primary} strokeWidth="5" fill="none" />
               <text x="50" y="50" textAnchor="middle" fontSize="10" fill={theme.colors.primary}>INVOICE</text>
            </svg>
         )}
       </div>
    );
  };

  // --- STANDARD LAYOUT IMPLEMENTATION (New Reference Design) ---

  const TopWave = () => (
    <div className="absolute top-0 left-0 right-0 h-32 z-0 overflow-hidden">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0 0 H100 V30 Q50 60 0 20 Z" fill={theme.colors.primary} />
            <path d="M0 20 Q50 60 100 30 V35 Q50 65 0 25 Z" fill={theme.colors.accent} />
        </svg>
    </div>
  );

  const BottomWave = () => (
    <div className="absolute bottom-0 left-0 right-0 h-32 z-0 overflow-hidden flex items-end">
         <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
             <path d="M0 100 H100 V50 Q50 90 0 70 Z" fill={theme.colors.accent} opacity="0.3" /> 
             <path d="M0 100 H100 V80 Q50 100 0 90 Z" fill={theme.colors.primary} />
         </svg>
    </div>
  );

  const ReferenceTable = () => (
    <div className="relative z-10 w-full mb-8">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: theme.colors.primary, color: 'white' }}>
            <th className="py-3 px-4 text-left w-[10%] font-serif font-bold uppercase tracking-wider text-sm border-r border-white/10">Item</th>
            <th className="py-3 px-4 text-left w-[50%] font-serif font-bold uppercase tracking-wider text-sm border-r border-white/10">Description</th>
            {isQuotation && (
              <th className="py-3 px-4 text-right w-[20%] font-serif font-bold uppercase tracking-wider text-sm border-r border-white/10">Rate</th>
            )}
            <th className="py-3 px-4 text-right w-[20%] font-serif font-bold uppercase tracking-wider text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="border-b border-slate-200">
              <td className="py-6 px-4 align-top text-slate-700 font-medium">{index + 1}.</td>
              <td className="py-6 px-4 align-top text-slate-800 font-medium whitespace-pre-wrap">{item.description}</td>
              {isQuotation && (
                <td className="py-6 px-4 align-top text-right text-slate-600">
                   {currencyFormatter.format(item.unitPrice)}
                </td>
              )}
              <td className="py-6 px-4 align-top text-right font-bold text-slate-900">
                {currencyFormatter.format(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- MAIN RENDER ---
  
  const containerClass = `bg-white shadow-2xl w-[210mm] min-h-[297mm] mx-auto relative flex flex-col overflow-hidden print-exact-a4 ${theme.font === 'serif' ? 'font-serif' : theme.font === 'mono' ? 'font-mono' : 'font-sans'}`;

  // Use the reference design for standard layout
  if (theme.layout === 'standard') {
      return (
        <div className={containerClass}>
            {/* Background Image or Waves */}
            {theme.backgroundImage ? (
                <div className="absolute inset-0 z-0" style={{ opacity: bgOpacity }}>
                    <img src={theme.backgroundImage} className="w-full h-full object-cover" alt="" />
                </div>
            ) : (
                <>
                  <TopWave />
                  <BottomWave />
                </>
            )}

            <div 
                className="relative z-10 px-12 pt-12 flex-grow flex flex-col"
                style={{ paddingTop: marginTop, paddingBottom: marginBottom }}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-16">
                    <div>
                        <h1 className="text-5xl font-serif text-slate-900 mb-4 tracking-tight">
                            {isQuotation ? 'QUOTATION' : 'INVOICE'}
                        </h1>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p><span className="font-medium">
                                {isQuotation ? 'Date:' : 'Invoice Number:'}
                            </span> {isQuotation ? formatDate(data.date) : data.invoiceNumber}</p>
                            {!isQuotation && <p><span className="font-medium">Date:</span> {formatDate(data.date)}</p>}
                        </div>
                    </div>
                    <div className="text-right">
                        <Logo className="mb-2 flex justify-end" />
                    </div>
                </div>

                {/* Addresses */}
                <div className="flex gap-12 mb-12">
                    <div className="w-1/2">
                        <h3 className="font-serif font-bold text-sm uppercase mb-3 tracking-widest text-slate-900">
                            {isQuotation ? 'QUOTATION TO:' : 'BILL TO:'}
                        </h3>
                        {client ? (
                            <div className="text-sm text-slate-700 leading-relaxed">
                                <p className="font-bold text-slate-900 text-lg mb-1">{client.name}</p>
                                <p className="whitespace-pre-line mb-2">{client.address}</p>
                                {client.gstin && <p>GSTIN: {client.gstin}</p>}
                                {client.vatId && <p>VAT: {client.vatId}</p>}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">Select a client...</p>
                        )}
                    </div>
                    <div className="w-1/2">
                        <h3 className="font-serif font-bold text-sm uppercase mb-3 tracking-widest text-slate-900">FROM:</h3>
                         <div className="text-sm text-slate-700 leading-relaxed">
                            <p className="font-bold text-slate-900 text-lg mb-1">{sender.name}</p>
                            <p className="whitespace-pre-line mb-2">{sender.address}</p>
                         </div>
                    </div>
                </div>

                {/* Table */}
                <div className="relative min-h-[300px]">
                    <Watermark />
                    <ReferenceTable />
                </div>

                {/* Footer Section */}
                <div className="mt-auto mb-16">
                     <div className="flex gap-8 items-start">
                         {/* Left: Payment Info or Terms */}
                         <div className="w-[60%] text-sm">
                             {isQuotation ? (
                                <>
                                  <h3 className="font-serif font-bold uppercase mb-2 text-slate-900">Terms & Conditions</h3>
                                  <div className="text-slate-700 space-y-1">
                                    {data.notes ? (
                                        <p className="whitespace-pre-line">{data.notes}</p>
                                    ) : (
                                        <>
                                            <p>1. 50% Advance</p>
                                            <p>2. 50% Post Completion of work</p>
                                        </>
                                    )}
                                  </div>
                                </>
                             ) : (
                                <>
                                   <h3 className="font-serif font-bold uppercase mb-2 text-slate-900">PAYMENT INFORMATION:</h3>
                                   <div className="text-slate-700 space-y-1 font-medium">
                                       {sender.accountName && <p><span className="font-bold">Name:</span> {sender.accountName}</p>}
                                       {sender.accountNumber && <p><span className="font-bold">Account:</span> {sender.accountNumber}</p>}
                                       {sender.pan && <p><span className="font-bold">PAN:</span> {sender.pan}</p>}
                                       {sender.branch && <p><span className="font-bold">Branch:</span> {sender.branch}</p>}
                                       {sender.ifsCode && <p><span className="font-bold">IFS code:</span> {sender.ifsCode}</p>}
                                       {sender.mobile && <p className="mt-2"><span className="font-bold">Mobile No:</span> {sender.mobile}</p>}
                                   </div>
                                </>
                             )}
                         </div>

                         {/* Right: Totals */}
                         <div className="w-[40%]">
                             <div className="border border-slate-900">
                                 <div className="flex justify-between p-3 text-slate-700 font-medium">
                                     <span>Sub Total:</span>
                                     <span>{currencyFormatter.format(subtotal)}</span>
                                 </div>
                                 <div className="p-3 text-white font-bold text-xl flex justify-between items-center" style={{ backgroundColor: theme.colors.primary }}>
                                     <span className="uppercase tracking-widest font-serif">TOTAL:</span>
                                     <span>{currencyFormatter.format(total)}/-</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
                
                {/* Website / Bottom Text */}
                <div className="text-center text-xs text-slate-500 mb-8 relative z-20">
                     <p className="flex items-center justify-center gap-1">
                        <span className="text-lg">🌐</span> {sender.website || 'www.example.com'}
                     </p>
                     {!isQuotation && (
                        <p className="absolute left-0 bottom-0 text-[10px]">*not registered under gst</p>
                     )}
                </div>

            </div>
        </div>
      );
  }

  // Fallback for Sidebar/Minimal if selected (keeping existing logic roughly, or we could just remove them if not needed, but safe to keep)
  if (theme.layout === 'sidebar') {
     return (
      <div className={containerClass}>
         {theme.backgroundImage && (
            <div className="absolute inset-0 z-0" style={{ opacity: bgOpacity }}>
                <img src={theme.backgroundImage} className="w-full h-full object-cover" alt="" />
            </div>
         )}
         <div className="relative z-10 flex w-full h-full flex-grow">
            <div className="w-[32%] min-h-[297mm] p-8 flex flex-col" style={{ backgroundColor: theme.backgroundImage ? `rgba(0,0,0,${Math.max(0, 0.8 * bgOpacity)})` : (theme.colors.sidebarBg || theme.colors.primary), color: theme.colors.sidebarText || 'white' }}>
                <div className="mb-12"><Logo className="invert brightness-0" /></div>
                <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70 border-b border-white/20 pb-2">From</h3>
                <p className="font-bold text-lg leading-tight mb-2">{sender.name}</p>
                <p className="text-sm whitespace-pre-line opacity-80">{sender.address}</p>
                <p className="text-sm mt-4 opacity-80">{sender.email}</p>
                <p className="text-sm opacity-80">{sender.website}</p>
                </div>
                <div className="mt-auto">
                {!isQuotation && (
                  <>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70 border-b border-white/20 pb-2">Bank Details</h3>
                    <div className="text-sm space-y-2 opacity-90">
                        <p>{sender.accountName}</p>
                        <p>{sender.accountNumber}</p>
                        <p>{sender.ifsCode}</p>
                    </div>
                  </>
                )}
                </div>
            </div>
            <div className="w-[68%] p-10 flex flex-col relative" style={{ backgroundColor: theme.backgroundImage ? `rgba(255,255,255,${0.95 * bgOpacity})` : 'transparent', paddingTop: marginTop, paddingBottom: marginBottom }}>
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
                <ReferenceTable />
                </div>
                <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="w-1/2 ml-auto"><div className="w-full">
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
    </div></div>
                </div>
            </div>
         </div>
      </div>
    );
  }

  // Minimal Layout (Simplified)
  return (
        <div className={`${containerClass} p-16`} style={{ paddingTop: marginTop, paddingBottom: marginBottom }}>
           {theme.backgroundImage && (
                <div className="absolute inset-0 z-0" style={{ opacity: bgOpacity }}>
                    <img src={theme.backgroundImage} className="w-full h-full object-cover" alt="" />
                </div>
            )}
           <div className="relative z-10 bg-white/90 p-8 rounded-lg min-h-full flex flex-col flex-grow">
                <div className="text-center mb-12 border-b-2 border-slate-900 pb-8" style={{ borderColor: theme.colors.primary }}>
                    <Logo className="h-16 w-auto mx-auto mb-4" />
                    <h1 className="text-3xl font-bold uppercase tracking-widest" style={{ color: theme.colors.primary }}>{sender.name}</h1>
                    <p className="text-xs mt-2 uppercase tracking-wider">{sender.website}</p>
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
                    <ReferenceTable />
                </div>
                <div className="flex justify-between items-start mt-8 pt-8 border-t-2 border-slate-900" style={{ borderColor: theme.colors.primary }}>
                    <div className="w-1/2 text-xs">
                        {!isQuotation && (
                          <>
                            <p className="font-bold uppercase mb-2">Payment Info:</p>
                            <p>{sender.accountName}</p>
                            <p>{sender.accountNumber} • {sender.ifsCode}</p>
                            <p>{sender.branch}</p>
                          </>
                        )}
                    </div>
                    <div className="w-1/3 text-right">
                        <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{currencyFormatter.format(total)}</span>
                        </div>
                    </div>
                </div>
           </div>
        </div>
  );
};

export default InvoicePreview;