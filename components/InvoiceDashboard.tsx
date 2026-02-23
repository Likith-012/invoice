
import React, { useState, useEffect, useRef } from 'react';
import { 
  InvoiceData, 
  DEFAULT_SENDER, 
  LineItem,
  Client,
  MOCK_CLIENTS,
  SenderDetails,
  InvoiceTheme,
  InvoiceHistoryItem
} from '../types';
import ClientSelector from './ClientSelector';
import InvoicePreview from './InvoicePreview';
import SmartInput from './SmartInput';
import SettingsModal from './SettingsModal';
import HistoryModal from './HistoryModal';
import { Plus, Trash2, Download, Eye, Edit, ArrowLeft, FileText, Settings as SettingsIcon, Mail, LogOut, Loader2, Clock, Save as SaveIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface InvoiceDashboardProps {
  onLogout: () => void;
}

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ onLogout }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('invoicify_clients');
      return saved ? JSON.parse(saved) : MOCK_CLIENTS;
    } catch (e) { return MOCK_CLIENTS; }
  });

  const [senderDetails, setSenderDetails] = useState<SenderDetails>(() => {
    try {
      const saved = localStorage.getItem('invoicify_sender');
      return saved ? JSON.parse(saved) : DEFAULT_SENDER;
    } catch { return DEFAULT_SENDER; }
  });

  const [customLogo, setCustomLogo] = useState<string | undefined>(() => localStorage.getItem('invoicify_logo') || undefined);
  const [customWatermark, setCustomWatermark] = useState<string | undefined>(() => localStorage.getItem('invoicify_custom_watermark') || undefined);
  const [invoicePrefix, setInvoicePrefix] = useState<string>(() => localStorage.getItem('invoicify_prefix') || 'AS');
  const [templateId, setTemplateId] = useState<string>(() => localStorage.getItem('invoicify_template') || 'classic-blue');
  const [customThemes, setCustomThemes] = useState<InvoiceTheme[]>(() => {
    try {
      const saved = localStorage.getItem('invoicify_custom_themes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showWatermark, setShowWatermark] = useState<boolean>(() => localStorage.getItem('invoicify_watermark') === 'true');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('invoicify_watermark_opacity');
    return saved ? parseInt(saved, 10) : 10;
  });

  const [history, setHistory] = useState<InvoiceHistoryItem[]>(() => {
      try {
          const saved = localStorage.getItem('invoicify_history');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    type: 'invoice',
    invoiceNumber: `${invoicePrefix}00125`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sender: senderDetails,
    client: null,
    items: [{ id: '1', description: 'Consulting Services', quantity: 1, unitPrice: 0 }],
    notes: ''
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('invoicify_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => {
    localStorage.setItem('invoicify_sender', JSON.stringify(senderDetails));
    setInvoiceData(prev => ({ ...prev, sender: senderDetails }));
  }, [senderDetails]);
  useEffect(() => { if (customLogo) localStorage.setItem('invoicify_logo', customLogo); else localStorage.removeItem('invoicify_logo'); }, [customLogo]);
  useEffect(() => { if (customWatermark) localStorage.setItem('invoicify_custom_watermark', customWatermark); else localStorage.removeItem('invoicify_custom_watermark'); }, [customWatermark]);
  useEffect(() => { localStorage.setItem('invoicify_prefix', invoicePrefix); }, [invoicePrefix]);
  useEffect(() => { localStorage.setItem('invoicify_template', templateId); }, [templateId]);
  useEffect(() => { localStorage.setItem('invoicify_custom_themes', JSON.stringify(customThemes)); }, [customThemes]);
  useEffect(() => { localStorage.setItem('invoicify_watermark', String(showWatermark)); }, [showWatermark]);
  useEffect(() => { localStorage.setItem('invoicify_watermark_opacity', String(watermarkOpacity)); }, [watermarkOpacity]);
  useEffect(() => { localStorage.setItem('invoicify_history', JSON.stringify(history)); }, [history]);

  const saveToHistory = (dataToSave: InvoiceData) => {
      setHistory(prev => {
          const index = prev.findIndex(item => item.data.invoiceNumber === dataToSave.invoiceNumber);
          if (index >= 0) {
              const updatedHistory = [...prev];
              updatedHistory[index] = { ...updatedHistory[index], lastModified: Date.now(), data: dataToSave };
              return updatedHistory;
          } else {
              return [{ id: uuidv4(), createdAt: Date.now(), lastModified: Date.now(), data: dataToSave }, ...prev];
          }
      });
  };

  const handleExport = async () => {
    saveToHistory(invoiceData);
    setIsExporting(true);
    
    // Crucial: Give images/fonts time to render in the hidden export root
    // We use a longer delay to be safe on slower devices.
    await new Promise(resolve => setTimeout(resolve, 1500));

    const element = exportRef.current;
    if (!element) {
        setIsExporting(false);
        return;
    }

    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
        alert("PDF generator not found. Printing instead.");
        window.print();
        setIsExporting(false);
        return;
    }

    // Force A4 dimensions in pixels (794x1123 is standard A4 at 96 DPI)
    // windowWidth forces the media queries to treat it as a full-size desktop screen
    // scale: 3 ensures high definition for text and graphics
    const opt = {
        margin: 0,
        filename: `${invoiceData.invoiceNumber || 'invoice'}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 3, 
            useCORS: true, 
            logging: false,
            letterRendering: true,
            windowWidth: 794,
            width: 794,
            height: 1123,
            backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error("PDF export failed:", err);
        alert("PDF generation failed. Using browser print instead.");
        window.print();
    } finally {
        setIsExporting(false);
    }
  };

  const addItem = () => {
    setInvoiceData(prev => ({ ...prev, items: [...prev.items, { id: uuidv4(), description: '', quantity: 1, unitPrice: 0 }] }));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setInvoiceData(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i) }));
  };

  const removeItem = (id: string) => {
    setInvoiceData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} 
        senderDetails={senderDetails} onUpdateSender={setSenderDetails} 
        logo={customLogo} onUpdateLogo={setCustomLogo} 
        invoicePrefix={invoicePrefix} onUpdatePrefix={setInvoicePrefix} 
        clients={clients} onDeleteClient={(id) => setClients(c => c.filter(x => x.id !== id))} 
        templateId={templateId} onUpdateTemplate={setTemplateId} 
        showWatermark={showWatermark} onToggleWatermark={setShowWatermark} 
        customThemes={customThemes} onAddTheme={(t) => setCustomThemes(prev => [...prev, t])} 
        onDeleteTheme={(id) => setCustomThemes(prev => prev.filter(t => t.id !== id))} 
        onUpdateCustomThemeDetails={(ut) => setCustomThemes(prev => prev.map(t => t.id === ut.id ? ut : t))}
        customWatermark={customWatermark} onUpdateCustomWatermark={setCustomWatermark} 
        watermarkOpacity={watermarkOpacity} onUpdateWatermarkOpacity={setWatermarkOpacity} 
      />

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} onLoad={setInvoiceData} onDelete={(id) => setHistory(h => h.filter(x => x.id !== id))} />

      <div className="min-h-screen flex flex-col md:flex-row font-sans print:hidden">
        {/* Editor Panel */}
        <div className={`w-full md:w-5/12 lg:w-4/12 bg-white border-r border-slate-200 h-[calc(100vh-60px)] md:h-screen overflow-y-auto ${activeTab === 'preview' ? 'hidden md:block' : ''}`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Invoicify</h1>
              <div className="flex gap-2">
                <button onClick={() => setIsHistoryOpen(true)} className="p-2 text-slate-400 hover:text-blue-600"><Clock size={20} /></button>
                <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-slate-600"><SettingsIcon size={20} /></button>
                <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-600"><LogOut size={20} /></button>
              </div>
            </div>
            
            <section className="mb-8">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Bill To</h2>
              <ClientSelector selectedClient={invoiceData.client} onSelectClient={(client) => setInvoiceData(prev => ({ ...prev, client }))} clients={clients} onAddClient={(c) => setClients(prev => [...prev, c])} onUpdateClient={(c) => setClients(prev => prev.map(x => x.id === c.id ? c : x))} />
            </section>

            <section className="mb-8">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Items</h2>
              <SmartInput onItemsParsed={(items) => setInvoiceData(prev => ({ ...prev, items: [...prev.items, ...items] }))} />
              <div className="space-y-4">
                {invoiceData.items.map((item) => (
                  <div key={item.id} className="bg-slate-50 p-4 rounded-lg border relative group">
                    <button onClick={() => removeItem(item.id)} className="absolute right-2 top-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    <input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full bg-white border p-2 rounded text-sm mb-3" placeholder="Description" />
                    <div className="flex gap-3">
                      <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} className="w-1/4 bg-white border p-2 rounded text-sm" />
                      <input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))} className="w-3/4 bg-white border p-2 rounded text-sm" />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addItem} className="mt-4 w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 text-sm"><Plus size={16} /> Add Item</button>
            </section>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`w-full md:w-7/12 lg:w-8/12 bg-slate-100 h-[calc(100vh-60px)] md:h-screen overflow-y-auto relative ${activeTab === 'edit' ? 'hidden md:block' : ''}`}>
          <div className="sticky top-0 z-10 p-4 flex justify-end gap-3 pointer-events-none">
             <div className="pointer-events-auto flex gap-3">
                <button onClick={() => saveToHistory(invoiceData)} className="bg-white p-2.5 rounded-full shadow-lg border hover:bg-slate-50 transition-all"><SaveIcon size={18} /></button>
                <button onClick={handleExport} disabled={isExporting} className="bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 font-medium disabled:bg-slate-600">
                  {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
                </button>
             </div>
          </div>
          <div className="p-4 md:p-12 flex justify-center items-start min-h-full">
             <div className="transform scale-[0.45] sm:scale-[0.7] lg:scale-100 origin-top shadow-2xl bg-white">
                <InvoicePreview data={invoiceData} logoSrc={customLogo} templateId={templateId} showWatermark={showWatermark} customThemes={customThemes} customWatermark={customWatermark} watermarkOpacity={watermarkOpacity} />
             </div>
          </div>
        </div>
      </div>

      {/* FIXED EXPORT ROOT: Use visibility hidden so it still renders correctly for snapshotting */}
      {/* We set absolute sizing (794px) to exactly match A4 at standard capture density */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '210mm', pointerEvents: 'none', zIndex: -100, visibility: 'hidden' }}>
        <div ref={exportRef} style={{ width: '794px', height: '1123px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
            <InvoicePreview data={invoiceData} logoSrc={customLogo} templateId={templateId} showWatermark={showWatermark} customThemes={customThemes} customWatermark={customWatermark} watermarkOpacity={watermarkOpacity} />
        </div>
      </div>
    </>
  );
};

export default InvoiceDashboard;
