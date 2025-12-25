import React from 'react';
import { InvoiceData } from '../types';

interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const total = subtotal;

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Colors based on screenshot
  const theme = {
    blue: '#0e3a5d', // Deep Navy Blue
    gold: '#fcd34d', // Light Gold/Yellow
    text: '#1f2937', // Slate 800
  };

  const isQuotation = data.type === 'quotation';

  return (
    <div className="bg-white shadow-2xl min-h-[1123px] w-[794px] mx-auto print-full-width relative flex flex-col font-sans text-slate-900 overflow-hidden">
      
      {/* --- TOP WAVES SVG --- */}
      <div className="absolute top-0 left-0 right-0 h-40 z-0 pointer-events-none">
        <svg viewBox="0 0 794 160" preserveAspectRatio="none" className="w-full h-full">
           <defs>
             <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="#fbbf24" />
               <stop offset="100%" stopColor="#fde68a" />
             </linearGradient>
           </defs>
           {/* Gold Wave (Back) */}
           <path d="M0,0 L794,0 L794,40 C600,100 200,60 0,120 Z" fill="url(#goldGradient)" opacity="0.4" />
           {/* Blue Wave (Front) */}
           <path d="M0,0 L794,0 L794,20 C500,60 300,60 0,40 Z" fill={theme.blue} />
           {/* Secondary thin gold line accent */}
           <path d="M0,40 C300,60 500,60 794,20 L794,25 C500,65 300,65 0,45 Z" fill="#fbbf24" />
        </svg>
      </div>

      <div className="relative z-10 px-12 pt-24 flex-grow flex flex-col">
        
        {/* --- HEADER CONTENT --- */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-serif text-black mb-2 tracking-wide uppercase">
              {isQuotation ? 'QUOTATION' : 'INVOICE'}
            </h1>
            <div className="text-sm text-slate-700 font-medium leading-relaxed">
              <p>{isQuotation ? 'Quotation' : 'Invoice'} Number: {data.invoiceNumber}</p>
              <p>Date: {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</p>
            </div>
          </div>
          
          {/* Logo */}
          <div className="flex items-center gap-3 mt-2">
             <div className="relative w-10 h-10">
                {/* Abstract Triangle Icon */}
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 10 L90 80 H10 L50 10Z" fill="#fbbf24" rx="10" stroke="#fbbf24" strokeWidth="8" strokeLinejoin="round" />
                  <circle cx="25" cy="80" r="12" fill="#fbbf24" />
                  <circle cx="75" cy="80" r="12" fill="#fbbf24" />
                  <circle cx="50" cy="25" r="12" fill="#fbbf24" />
                </svg>
             </div>
             <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900 leading-none">ADVERSITY</span>
                <div className="flex justify-between w-full">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-slate-500 font-medium">SOLUTIONS</span>
                </div>
             </div>
          </div>
        </div>

        {/* --- ADDRESS SECTION --- */}
        <div className="flex justify-between items-start mb-8 gap-8">
           {/* BILL TO */}
           <div className="flex-1">
              <h3 className="font-bold text-slate-900 uppercase text-sm mb-2">
                 {isQuotation ? 'QUOTATION TO:' : 'BILL TO:'}
              </h3>
              {data.client ? (
                <div className="text-sm text-slate-800 leading-snug space-y-1">
                   <p className="font-semibold">{data.client.name}</p>
                   <p className="whitespace-pre-line text-slate-600">{data.client.address}</p>
                   {data.client.gstin && <p>GSTIN: {data.client.gstin}</p>}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Select a client...</p>
              )}
           </div>

           {/* FROM */}
           <div className="flex-1">
              <h3 className="font-bold text-slate-900 uppercase text-sm mb-2">FROM:</h3>
              <div className="text-sm text-slate-800 leading-snug space-y-1">
                 <p className="font-semibold">{data.sender.name}</p>
                 <p className="uppercase whitespace-pre-line text-slate-600">{data.sender.address}</p>
              </div>
           </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="mb-6 relative min-h-[350px]">
          
          {/* Watermark Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] z-0">
              <svg width="300" height="300" viewBox="0 0 100 100" fill="#fbbf24">
                  <path d="M50 15 L85 75 H15 L50 15Z" stroke="#fbbf24" strokeWidth="15" strokeLinejoin="round" />
              </svg>
          </div>

          <div className="relative z-10 border border-slate-900">
             {/* Header */}
             <div className="bg-[#0e3a5d] text-white flex text-sm font-bold py-2.5 px-4 uppercase tracking-wider">
                <div className="w-[10%]">ITEM</div>
                <div className="w-[50%]">DESCRIPTION</div>
                <div className="w-[20%] text-right">{isQuotation ? 'RATE' : 'COST'}</div>
                <div className="w-[20%] text-right">AMOUNT</div>
             </div>

             {/* Rows */}
             <div className="bg-white min-h-[300px]">
               {data.items.map((item, index) => (
                  <div key={item.id} className="flex text-sm text-slate-800 py-4 px-4">
                     <div className="w-[10%] font-medium">{index + 1}.</div>
                     <div className="w-[50%] font-medium">{item.description}</div>
                     <div className="w-[20%] text-right font-medium">
                        {isQuotation ? `${currencyFormatter.format(item.unitPrice).replace('₹', '₹')} / V` : currencyFormatter.format(item.unitPrice).replace('₹', '₹')}
                     </div>
                     <div className="w-[20%] text-right font-bold">{currencyFormatter.format(item.quantity * item.unitPrice).replace('₹', '₹')}</div>
                  </div>
               ))}
             </div>
          </div>
        </div>

        {/* --- FOOTER CONTENT --- */}
        <div className="mt-auto relative z-10 pb-20">
           <div className="flex justify-between items-start">
              
              {/* Payment Info / Terms */}
              {isQuotation ? (
                 <div className="w-[55%] text-sm text-slate-900">
                     <h3 className="font-bold text-slate-900 uppercase mb-2">Terms & Conditions</h3>
                     <div className="space-y-1 font-medium text-slate-800 text-sm">
                        <p>1. 50% Advance</p>
                        <p>2. 50% Post Completion of work</p>
                     </div>
                 </div>
              ) : (
                 <div className="w-[55%] text-sm text-slate-900">
                    <h3 className="font-bold text-slate-900 uppercase mb-2">PAYMENT INFORMATION:</h3>
                    <div className="space-y-1 font-semibold text-slate-800">
                        <div className="flex"><span className="w-24">Name:</span> <span>{data.sender.accountName}</span></div>
                        <div className="flex"><span className="w-24">Account:</span> <span>{data.sender.accountNumber}</span></div>
                        <div className="flex"><span className="w-24">PAN:</span> <span>{data.sender.pan}</span></div>
                        <div className="flex"><span className="w-24">Branch:</span> <span>{data.sender.branch}</span></div>
                        <div className="flex"><span className="w-24">IFS code:</span> <span>{data.sender.ifsCode}</span></div>
                        <div className="flex"><span className="w-24">Mobile No:</span> <span>{data.sender.mobile}</span></div>
                    </div>
                 </div>
              )}

              {/* Totals */}
              <div className="w-[40%]">
                 <div className="border border-slate-900 flex justify-between items-center p-3 mb-2 bg-white">
                    <span className="text-slate-600 font-medium text-sm">Sub Total:</span>
                    <span className="font-medium text-slate-800">{currencyFormatter.format(subtotal).replace('₹', '₹ ')}</span>
                 </div>
                 <div className="bg-[#0e3a5d] text-white flex justify-between items-center p-3">
                    <span className="font-bold text-lg uppercase tracking-wider font-serif">TOTAL:</span>
                    <span className="font-bold text-lg font-serif">{currencyFormatter.format(total).replace('₹', '₹ ')}/-</span>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Bottom Text */}
        <div className="absolute bottom-6 left-12 text-[10px] text-slate-500 italic z-20">
           *not registered under gst
        </div>
        
        <div className="absolute bottom-6 left-0 right-0 text-center z-20">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
               <span>🌐</span>
               <span>{data.sender.website}</span>
            </div>
        </div>

      </div>

      {/* --- BOTTOM WAVES SVG --- */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-0 pointer-events-none">
        <svg viewBox="0 0 794 120" preserveAspectRatio="none" className="w-full h-full">
           {/* Gold Wave (Back) */}
           <path d="M0,120 L794,120 L794,20 C500,100 300,0 0,60 Z" fill="#fde68a" opacity="0.5" />
           {/* Blue Wave (Bottom-most) */}
           <path d="M0,120 L794,120 L794,80 C500,120 200,80 0,100 Z" fill={theme.blue} />
           {/* Gold Accent */}
           <path d="M0,100 C200,80 500,120 794,80 L794,90 C500,130 200,90 0,110 Z" fill="#fbbf24" />
        </svg>
      </div>

    </div>
  );
};

export default InvoicePreview;