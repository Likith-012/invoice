import React, { useState, useEffect } from 'react';
import { 
  InvoiceData, 
  DEFAULT_SENDER, 
  LineItem,
  Client,
  MOCK_CLIENTS,
  SenderDetails,
  InvoiceTheme
} from '../types';
import ClientSelector from './ClientSelector';
import InvoicePreview from './InvoicePreview';
import SmartInput from './SmartInput';
import SettingsModal from './SettingsModal';
import { Plus, Trash2, Printer, Eye, Edit, ArrowLeft, FileText, Settings as SettingsIcon, Mail, LogOut } from 'lucide-react';

interface InvoiceDashboardProps {
  onLogout: () => void;
}

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ onLogout }) => {
  // Load clients from local storage or use mocks
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('invoicify_clients');
      return saved ? JSON.parse(saved) : MOCK_CLIENTS;
    } catch (e) {
      return MOCK_CLIENTS;
    }
  });

  // Load Sender Details from local storage
  const [senderDetails, setSenderDetails] = useState<SenderDetails>(() => {
    try {
      const saved = localStorage.getItem('invoicify_sender');
      return saved ? JSON.parse(saved) : DEFAULT_SENDER;
    } catch {
      return DEFAULT_SENDER;
    }
  });

  // Load Logo from local storage (Base64)
  const [customLogo, setCustomLogo] = useState<string | undefined>(() => {
    return localStorage.getItem('invoicify_logo') || undefined;
  });

  // Load Custom Watermark
  const [customWatermark, setCustomWatermark] = useState<string | undefined>(() => {
    return localStorage.getItem('invoicify_custom_watermark') || undefined;
  });

  // Load Invoice Prefix
  const [invoicePrefix, setInvoicePrefix] = useState<string>(() => {
    return localStorage.getItem('invoicify_prefix') || 'AS';
  });

  // Load Template ID
  const [templateId, setTemplateId] = useState<string>(() => {
    return localStorage.getItem('invoicify_template') || 'classic-blue';
  });

  // Load Custom Templates
  const [customThemes, setCustomThemes] = useState<InvoiceTheme[]>(() => {
    try {
      const saved = localStorage.getItem('invoicify_custom_themes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load Watermark setting
  const [showWatermark, setShowWatermark] = useState<boolean>(() => {
    return localStorage.getItem('invoicify_watermark') === 'true';
  });

  // Load Watermark Opacity
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('invoicify_watermark_opacity');
    return saved ? parseInt(saved, 10) : 10;
  });

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    type: 'invoice',
    invoiceNumber: `${invoicePrefix}00125`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sender: senderDetails,
    client: null,
    items: [
      { id: '1', description: 'Consulting Services', quantity: 1, unitPrice: 0 }
    ],
    notes: ''
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('invoicify_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('invoicify_sender', JSON.stringify(senderDetails));
    setInvoiceData(prev => ({ ...prev, sender: senderDetails }));
  }, [senderDetails]);

  useEffect(() => {
    if (customLogo) localStorage.setItem('invoicify_logo', customLogo);
    else localStorage.removeItem('invoicify_logo');
  }, [customLogo]);

  useEffect(() => {
    if (customWatermark) localStorage.setItem('invoicify_custom_watermark', customWatermark);
    else localStorage.removeItem('invoicify_custom_watermark');
  }, [customWatermark]);

  useEffect(() => {
    localStorage.setItem('invoicify_prefix', invoicePrefix);
  }, [invoicePrefix]);

  useEffect(() => {
    localStorage.setItem('invoicify_template', templateId);
  }, [templateId]);

  useEffect(() => {
    localStorage.setItem('invoicify_custom_themes', JSON.stringify(customThemes));
  }, [customThemes]);

  useEffect(() => {
    localStorage.setItem('invoicify_watermark', String(showWatermark));
  }, [showWatermark]);

  useEffect(() => {
    localStorage.setItem('invoicify_watermark_opacity', String(watermarkOpacity));
  }, [watermarkOpacity]);

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substring(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0
    };
    setInvoiceData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (id: string) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const addParsedItems = (newItems: LineItem[]) => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }));
  };

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    setInvoiceData(prev => ({ ...prev, client: newClient }));
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    if (invoiceData.client && invoiceData.client.id === updatedClient.id) {
      setInvoiceData(prev => ({ ...prev, client: updatedClient }));
    }
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    if (invoiceData.client?.id === id) {
      setInvoiceData(prev => ({ ...prev, client: null }));
    }
  };

  const handleAddTheme = (theme: InvoiceTheme) => {
    setCustomThemes(prev => [...prev, theme]);
  };

  const handleDeleteTheme = (id: string) => {
    setCustomThemes(prev => prev.filter(t => t.id !== id));
    if (templateId === id) {
       setTemplateId('classic-blue');
    }
  };

  const handleUpdateThemeDetails = (updatedTheme: InvoiceTheme) => {
    setCustomThemes(prev => prev.map(t => t.id === updatedTheme.id ? updatedTheme : t));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    if (!invoiceData.client?.email) {
       alert("Please select a client with an email address first.");
       return;
    }
    const total = invoiceData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const docName = invoiceData.type === 'invoice' ? 'Invoice' : 'Quotation';
    const subject = `${docName} ${invoiceData.invoiceNumber} from ${invoiceData.sender.name}`;
    const body = `Dear ${invoiceData.client.name},\n\nPlease find attached the ${docName.toLowerCase()} #${invoiceData.invoiceNumber}.\n\nTotal Amount: ${total.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}\n\nRegards,\n${invoiceData.sender.name}`;
    
    // Alert user about attachment limitation
    if(window.confirm(`Opening email draft to ${invoiceData.client.email}.\n\nNOTE: You must manually attach the PDF after printing/saving it.`)) {
        window.open(`mailto:${invoiceData.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        senderDetails={senderDetails}
        onUpdateSender={setSenderDetails}
        logo={customLogo}
        onUpdateLogo={setCustomLogo}
        invoicePrefix={invoicePrefix}
        onUpdatePrefix={setInvoicePrefix}
        clients={clients}
        onDeleteClient={handleDeleteClient}
        templateId={templateId}
        onUpdateTemplate={setTemplateId}
        showWatermark={showWatermark}
        onToggleWatermark={setShowWatermark}
        customThemes={customThemes}
        onAddTheme={handleAddTheme}
        onDeleteTheme={handleDeleteTheme}
        onUpdateCustomThemeDetails={handleUpdateThemeDetails}
        customWatermark={customWatermark}
        onUpdateCustomWatermark={setCustomWatermark}
        watermarkOpacity={watermarkOpacity}
        onUpdateWatermarkOpacity={setWatermarkOpacity}
      />

      {/* SCREEN LAYOUT (Hidden during print) */}
      <div className="min-h-screen flex flex-col md:flex-row font-sans print:hidden">
        {/* Editor Panel (Left) */}
        <div className={`w-full md:w-5/12 lg:w-4/12 bg-white border-r border-slate-200 h-[calc(100vh-60px)] md:h-screen overflow-y-auto ${activeTab === 'preview' ? 'hidden md:block' : ''}`}>
          
          {/* Navbar for Mobile */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white/90 backdrop-blur z-20">
            <span className="font-bold text-lg text-slate-800">Invoicify</span>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button 
                onClick={() => setActiveTab('edit')} 
                className={`px-3 py-1.5 text-sm rounded-md flex items-center space-x-1 transition-all ${activeTab === 'edit' ? 'bg-white shadow-sm text-slate-800 font-medium' : 'text-slate-500'}`}
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => setActiveTab('preview')} 
                className={`px-3 py-1.5 text-sm rounded-md flex items-center space-x-1 transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-slate-800 font-medium' : 'text-slate-500'}`}
              >
                <Eye size={14} />
                <span>View</span>
              </button>
            </div>
          </div>

          <div className="p-6 pb-20">
            <div className="mb-8 hidden md:block flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                   Invoicify
                </h1>
                <p className="text-slate-500 text-sm mt-1">Generate standard invoices</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  title="Settings"
                >
                  <SettingsIcon size={20} />
                </button>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
            
            <div className="md:hidden mb-6 flex justify-between">
               <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 px-3 py-2"
              >
                <LogOut size={16} />
                <span>Exit</span>
              </button>
               <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-lg"
              >
                <SettingsIcon size={16} />
                <span>Config</span>
              </button>
            </div>

            <section className="mb-8">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Client Details (Bill To)</h2>
              <ClientSelector 
                selectedClient={invoiceData.client} 
                onSelectClient={(client) => setInvoiceData(prev => ({ ...prev, client }))} 
                clients={clients}
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
              />
            </section>

            <section className="mb-8">
               <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items</h2>
              </div>
              
              <SmartInput onItemsParsed={addParsedItems} />

              <div className="space-y-4">
                {invoiceData.items.map((item, index) => (
                  <div key={item.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 group relative transition-all hover:shadow-sm">
                    <div className="absolute right-2 top-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => removeItem(item.id)} className="bg-white text-slate-400 hover:text-red-500 p-2 rounded-full shadow-sm border border-slate-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mb-3 pr-8">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Item description"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <div className="w-1/4">
                         <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                         <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Cost</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                       <div className="w-1/3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Total</label>
                        <div className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-2 text-sm text-slate-600 font-medium truncate">
                          ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={addItem}
                className="mt-4 w-full py-3 md:py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 text-sm active:bg-slate-100"
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </section>

            <section className="mb-8">
               <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Info</h2>
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Document Type</label>
                   <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setInvoiceData(prev => ({...prev, type: 'invoice'}))}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm rounded-md transition-all ${invoiceData.type === 'invoice' ? 'bg-white shadow text-slate-900 font-medium' : 'text-slate-500'}`}
                      >
                         <FileText size={14} />
                         <span>Invoice</span>
                      </button>
                      <button 
                        onClick={() => setInvoiceData(prev => ({...prev, type: 'quotation'}))}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm rounded-md transition-all ${invoiceData.type === 'quotation' ? 'bg-white shadow text-slate-900 font-medium' : 'text-slate-500'}`}
                      >
                         <FileText size={14} />
                         <span>Quotation</span>
                      </button>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">
                        {invoiceData.type === 'invoice' ? 'Invoice #' : 'Quotation #'}
                     </label>
                     <input 
                        type="text" 
                        value={invoiceData.invoiceNumber}
                        onChange={(e) => setInvoiceData(prev => ({...prev, invoiceNumber: e.target.value}))}
                        className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                     <input 
                        type="date" 
                        value={invoiceData.date}
                        onChange={(e) => setInvoiceData(prev => ({...prev, date: e.target.value}))}
                        className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                     />
                   </div>
                 </div>
               </div>
            </section>
          </div>
        </div>

        {/* Preview Panel (Right) */}
        <div className={`w-full md:w-7/12 lg:w-8/12 bg-slate-100 h-[calc(100vh-60px)] md:h-screen overflow-y-auto relative ${activeTab === 'edit' ? 'hidden md:block' : ''}`}>
          
          {/* Header Actions */}
          <div className="sticky top-0 z-10 p-4 flex justify-between items-center pointer-events-none">
             {/* Back Button (Mobile Only) */}
             <div className="pointer-events-auto">
                <button 
                  onClick={() => setActiveTab('edit')}
                  className="md:hidden bg-white/90 backdrop-blur text-slate-700 px-4 py-2.5 rounded-full shadow-lg border border-slate-200 flex items-center space-x-2 font-medium active:scale-95"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </button>
             </div>

             {/* Action Buttons */}
             <div className="pointer-events-auto flex space-x-3">
                <button 
                  onClick={handleEmail}
                  className="bg-white text-slate-700 px-5 py-2.5 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center space-x-2 font-medium active:scale-95"
                >
                  <Mail size={18} />
                  <span>Email Client</span>
                </button>
                <button 
                  onClick={handlePrint}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all flex items-center space-x-2 font-medium active:scale-95"
                >
                  <Printer size={18} />
                  <span>Print / PDF</span>
                </button>
             </div>
          </div>

          <div className="p-2 md:p-8 lg:p-12 flex justify-center items-start min-h-full overflow-hidden pb-20">
             {/* Responsive Scaling for Visual Preview */}
             <div className="transform scale-[0.42] sm:scale-[0.6] md:scale-[0.85] lg:scale-100 origin-top shadow-2xl transition-transform duration-300 bg-white">
                <InvoicePreview 
                  data={invoiceData} 
                  logoSrc={customLogo} 
                  templateId={templateId}
                  showWatermark={showWatermark}
                  customThemes={customThemes}
                  customWatermark={customWatermark}
                  watermarkOpacity={watermarkOpacity}
                />
             </div>
          </div>
        </div>
      </div>

      {/* PRINT LAYOUT (Visible only during print) 
          This renders a clean, unscaled version at the document root for perfect PDF generation.
      */}
      <div className="hidden print:block print:w-full print:h-auto print:overflow-visible">
        <InvoicePreview 
          data={invoiceData} 
          logoSrc={customLogo} 
          templateId={templateId}
          showWatermark={showWatermark}
          customThemes={customThemes}
          customWatermark={customWatermark}
          watermarkOpacity={watermarkOpacity}
        />
      </div>
    </>
  );
};

export default InvoiceDashboard;