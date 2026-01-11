
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
  
  const allThemes = { ...DEFAULT_THEMES };
  customThemes.forEach(t => {
    allThemes[t.id] = t;
  });

  const theme = allThemes[templateId] || DEFAULT_THEMES['classic-blue'];
  const tableColor = theme.colors.tableColor || theme.colors.primary;
  
  const bgOpacity = theme.customConfig?.backgroundOpacity !== undefined ? theme.customConfig.backgroundOpacity / 100 : 1;
  const marginTop = theme.customConfig?.marginTop !== undefined ? `${theme.customConfig.marginTop}mm` : '30mm';
  const marginBottom = theme.customConfig?.marginBottom !== undefined ? `${theme.customConfig.marginBottom}mm` : '20mm';
  
  const bgScale = theme.customConfig?.backgroundScale !== undefined ? theme.customConfig.backgroundScale / 100 : 1;
  const bgX = theme.customConfig?.backgroundPositionX !== undefined ? theme.customConfig.backgroundPositionX : 50;
  const bgY = theme.customConfig?.backgroundPositionY !== undefined ? theme.customConfig.backgroundPositionY : 50;

  const logoScale = theme.customConfig?.logoScale !== undefined ? theme.customConfig.logoScale / 100 : 1;
  const logoX = theme.customConfig?.logoX ?? 0;
  const logoY = theme.customConfig?.logoY ?? 0;
  
  const wmScale = theme.customConfig?.watermarkScale !== undefined ? theme.customConfig.watermarkScale / 100 : 1;
  const wmX = theme.customConfig?.watermarkX ?? 0;
  const wmY = theme.customConfig?.watermarkY ?? 0;

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
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  const Logo = ({ className }: { className?: string }) => (
    <div 
      className={className} 
      style={{ 
        transform: `translate(${logoX}mm, ${logoY}mm) scale(${logoScale})`,
        transformOrigin: 'right top',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <img 
        src={logoSrc || `/logo.png?t=${timestamp}`}
        alt="Logo" 
        style={{ height: '70px', width: 'auto', objectFit: 'contain' }}
        onError={(e) => {
           e.currentTarget.style.display = 'none';
           document.getElementById(`fallback-${templateId}`)?.classList.remove('hidden');
        }}
      />
      <div id={`fallback-${templateId}`} className="hidden font-bold text-2xl tracking-tighter border-2 border-current px-2 py-1 inline-block" style={{ color: theme.colors.primary }}>
        {sender.name.substring(0,2).toUpperCase()}
      </div>
    </div>
  );

  const Watermark = () => {
    if (!showWatermark) return null;
    const watermarkSrc = customWatermark || logoSrc;
    
    return (
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden" style={{ opacity: watermarkOpacity / 100 }}>
         <div style={{ transform: `translate(${wmX}mm, ${wmY}mm) scale(${wmScale})` }}>
           {watermarkSrc ? (
              <img src={watermarkSrc} style={{ width: '500px', objectFit: 'contain' }} alt="Watermark" />
           ) : (
              <svg width="400" height="400" viewBox="0 0 100 100" fill={tableColor}>
                 <path d="M50 15 L85 75 H15 L50 15Z" stroke={tableColor} strokeWidth="5" fill="none" />
                 <text x="50" y="50" textAnchor="middle" fontSize="10" fill={tableColor}>INVOICE</text>
              </svg>
           )}
         </div>
       </div>
    );
  };

  const TopWave = () => (
    <div className="absolute top-0 left-0 right-0 h-40 z-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="160" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill={theme.colors.accent} d="M0,0L1440,0L1440,60C1100,60 1000,120 0,60Z"></path>
            <path fill={theme.colors.primary} d="M0,0L1440,0L1440,40C1100,40 1000,100 0,40Z"></path>
        </svg>
    </div>
  );

  const BottomWave = () => (
    <div className="absolute bottom-0 left-0 right-0 h-40 z-0 overflow-hidden flex items-end pointer-events-none">
         <svg width="100%" height="160" viewBox="0 0 1440 320" preserveAspectRatio="none">
             <path fill={theme.colors.accent} fillOpacity="0.4" d="M0,320L1440,320L1440,220C1000,300 600,200 0,300Z"></path>
             <path fill={theme.colors.primary} d="M0,320L1440,320L1440,300C1000,300 400,280 0,320Z"></path>
             <path fill={theme.colors.accent} d="M0,320L1440,320L1440,280C1200,320 800,320 0,320Z"></path>
         </svg>
    </div>
  );

  const ReferenceTable = () => (
    <div className="relative z-10 w-full mb-4">
      <div className="flex w-full" style={{ backgroundColor: tableColor, color: '#ffffff' }}>
          <div className="py-2.5 px-4 text-left w-[15%] font-serif font-bold uppercase tracking-widest text-[10px]">Item</div>
          <div className="py-2.5 px-4 text-left w-[60%] font-serif font-bold uppercase tracking-widest text-[10px]">Description</div>
          <div className="py-2.5 px-4 text-right w-[25%] font-serif font-bold uppercase tracking-widest text-[10px]">Amount</div>
      </div>
      <div style={{ borderLeft: `2px solid ${tableColor}`, borderRight: `2px solid ${tableColor}`, borderBottom: `2px solid ${tableColor}`, backgroundColor: 'rgba(255, 255, 255, 0.5)' }} className="relative">
          {items.map((item, index) => (
            <div key={item.id} className="flex w-full" style={{ borderBottom: index === items.length - 1 ? 'none' : '1px solid #94a3b8' }}>
               <div className="py-3 px-4 w-[15%] text-slate-800 font-medium text-center text-xs">{index + 1}.</div>
               <div className="py-3 px-4 w-[60%] text-slate-800 font-medium whitespace-pre-wrap text-xs">{item.description}</div>
               <div className="py-3 px-4 w-[25%] text-right font-bold text-slate-900 text-xs">
                  {currencyFormatter.format(item.quantity * item.unitPrice).replace('₹', '₹ ')}
               </div>
            </div>
          ))}
      </div>
    </div>
  );

  const containerClass = `bg-white w-[210mm] min-w-[210mm] min-h-[297mm] mx-auto relative flex flex-col overflow-hidden ${theme.font === 'serif' ? 'font-serif' : theme.font === 'mono' ? 'font-mono' : 'font-sans'}`;

  if (theme.layout === 'standard') {
      return (
        <div className={containerClass} style={{ backgroundColor: '#ffffff', colorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
            {theme.backgroundImage ? (
                <div className="absolute inset-0 z-0 overflow-hidden" style={{ opacity: bgOpacity }}>
                    <img src={theme.backgroundImage} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${bgX}% ${bgY}%`, transform: `scale(${bgScale})`, transformOrigin: `${bgX}% ${bgY}%` }} alt="" />
                </div>
            ) : (
                <><TopWave /><BottomWave /></>
            )}

            <div className="relative z-10 px-12 flex-grow flex flex-col" style={{ paddingTop: marginTop, paddingBottom: marginBottom }}>
                <div className="flex justify-between items-start mb-6">
                    <div className="mt-4">
                        <h1 className="text-4xl font-serif text-slate-900 mb-2 tracking-tight">
                            {isQuotation ? 'QUOTATION' : 'INVOICE'}
                        </h1>
                        <div className="text-xs text-slate-700 space-y-0.5">
                            <p><span className="font-bold text-slate-900">Document #:</span> {data.invoiceNumber}</p>
                            <p><span className="font-bold text-slate-900">Date:</span> {formatDate(data.date)}</p>
                        </div>
                    </div>
                    <div className="text-right"><Logo /></div>
                </div>

                <div className="flex gap-4 mb-8">
                    <div className="w-1/2">
                        <h3 className="font-bold text-[10px] uppercase mb-2 tracking-widest text-slate-900 border-b border-slate-200 pb-1">{isQuotation ? 'QUOTATION TO:' : 'BILL TO:'}</h3>
                        {client ? (
                            <div className="text-slate-800 font-medium">
                                <p className="text-sm font-bold mb-1">{client.name}</p>
                                <p className="whitespace-pre-line text-[10px] leading-normal">{client.address}</p>
                            </div>
                        ) : <p className="text-slate-300 text-[10px] italic">No client selected.</p>}
                    </div>
                    <div className="w-1/2 pl-4">
                        <h3 className="font-bold text-[10px] uppercase mb-2 tracking-widest text-slate-900 border-b border-slate-200 pb-1">FROM:</h3>
                         <div className="text-slate-800 font-medium">
                            <p className="text-sm font-bold mb-1">{sender.name}</p>
                            <p className="whitespace-pre-line text-[10px] leading-normal">{sender.address}</p>
                         </div>
                    </div>
                </div>

                <div className="relative mb-6"><Watermark /><ReferenceTable /></div>

                <div className="mt-auto mb-12">
                     <div className="flex gap-6 items-start">
                         <div className="w-[60%]">
                             <h3 className="font-serif font-bold uppercase mb-2 text-slate-900 text-[10px] tracking-widest">{isQuotation ? 'Terms & Conditions:' : 'Payment Info:'}</h3>
                             <div className="text-slate-700 font-medium space-y-0.5 text-[9px] leading-tight">
                                {isQuotation ? <p className="whitespace-pre-line">{data.notes || "1. 50% Advance"}</p> : 
                                  <>{sender.accountName && <p>Name: {sender.accountName}</p>}{sender.accountNumber && <p>Acc: {sender.accountNumber}</p>}</>
                                }
                             </div>
                         </div>
                         <div className="w-[40%]">
                             <div style={{ border: `2px solid ${tableColor}`, backgroundColor: '#ffffff' }}>
                                 <div className="flex justify-between p-2 text-slate-800 font-bold text-xs">
                                     <span>Sub Total:</span>
                                     <span>{currencyFormatter.format(subtotal)}</span>
                                 </div>
                                 <div className="p-2 text-white font-bold text-base flex justify-between items-center" style={{ backgroundColor: tableColor, borderTop: `2px solid ${tableColor}` }}>
                                     <span className="uppercase tracking-widest font-serif text-sm">TOTAL:</span>
                                     <span>{currencyFormatter.format(total)}</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 text-center text-slate-500 text-[10px] font-bold">🌐 {sender.website}</div>
            </div>
        </div>
      );
  }

  return (
    <div className={containerClass} style={{ backgroundColor: '#ffffff' }}>
        <div className="p-12 flex flex-col h-full relative z-10">
            <div className="flex justify-between mb-8"><Logo /><div className="text-right"><h1 className="text-3xl font-bold" style={{ color: theme.colors.primary }}>{isQuotation ? 'QUOTATION' : 'INVOICE'}</h1></div></div>
            <ReferenceTable />
            <div className="flex justify-end mt-8">
                <div className="w-1/3 p-4 rounded-lg" style={{ backgroundColor: tableColor + '10' }}>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t" style={{ color: tableColor }}><span>TOTAL</span><span>{currencyFormatter.format(total)}</span></div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default InvoicePreview;
