import React, { useState, useRef } from 'react';
import { SenderDetails, Client, InvoiceTheme, DEFAULT_THEMES } from '../types';
import { X, Upload, Save, Trash2, User, CreditCard, Building, Settings as SettingsIcon, LayoutTemplate, Droplets, Plus, Palette, FileJson, Image as ImageIcon, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderDetails: SenderDetails;
  onUpdateSender: (details: SenderDetails) => void;
  logo: string | undefined;
  onUpdateLogo: (base64: string) => void;
  invoicePrefix: string;
  onUpdatePrefix: (prefix: string) => void;
  clients: Client[];
  onDeleteClient: (id: string) => void;
  templateId: string;
  onUpdateTemplate: (id: string) => void;
  showWatermark: boolean;
  onToggleWatermark: (show: boolean) => void;
  customThemes?: InvoiceTheme[];
  onAddTheme?: (theme: InvoiceTheme) => void;
  onDeleteTheme?: (id: string) => void;
  customWatermark?: string;
  onUpdateCustomWatermark?: (base64: string) => void;
}

type Tab = 'company' | 'payment' | 'preferences' | 'clients' | 'templates';

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  senderDetails,
  onUpdateSender,
  logo,
  onUpdateLogo,
  invoicePrefix,
  onUpdatePrefix,
  clients,
  onDeleteClient,
  templateId,
  onUpdateTemplate,
  showWatermark,
  onToggleWatermark,
  customThemes = [],
  onAddTheme,
  onDeleteTheme,
  customWatermark,
  onUpdateCustomWatermark
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [localSender, setLocalSender] = useState<SenderDetails>(senderDetails);
  const [localPrefix, setLocalPrefix] = useState(invoicePrefix);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const themeFileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  // Template Creator State
  const [isCreatingTheme, setIsCreatingTheme] = useState(false);
  const [newTheme, setNewTheme] = useState<Partial<InvoiceTheme>>({
    name: 'My Custom Theme',
    layout: 'standard',
    font: 'sans',
    colors: { primary: '#3b82f6', accent: '#fbbf24', text: '#1f2937', bg: 'white' }
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSender(localSender);
    onUpdatePrefix(localPrefix);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSenderField = (field: keyof SenderDetails, value: string) => {
    setLocalSender(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveTheme = () => {
    if (!onAddTheme || !newTheme.name) return;
    
    const themeToSave: InvoiceTheme = {
        id: `custom-${uuidv4()}`,
        name: newTheme.name,
        layout: newTheme.layout as any || 'standard',
        font: newTheme.font as any || 'sans',
        colors: {
            primary: newTheme.colors?.primary || '#000000',
            accent: newTheme.colors?.accent || '#888888',
            text: '#1f2937',
            bg: 'white',
            headerText: newTheme.layout === 'standard' ? 'white' : undefined,
            sidebarBg: newTheme.layout === 'sidebar' ? newTheme.colors?.primary : undefined,
            sidebarText: 'white'
        },
        isCustom: true,
        backgroundImage: newTheme.backgroundImage
    };
    
    onAddTheme(themeToSave);
    setIsCreatingTheme(false);
    onUpdateTemplate(themeToSave.id);
  };

  const handleImportTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAddTheme) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                if (imported.name && imported.colors) {
                    const themeWithNewId = { ...imported, id: `imported-${uuidv4()}`, isCustom: true };
                    onAddTheme(themeWithNewId);
                    onUpdateTemplate(themeWithNewId.id);
                } else {
                    alert("Invalid theme file format.");
                }
            } catch (err) {
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
    }
  };

  const handleCreateFromImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, (base64) => {
        if (!onAddTheme) return;
        const themeToSave: InvoiceTheme = {
            id: `img-theme-${uuidv4()}`,
            name: 'Custom Image Theme',
            layout: 'standard', // Image backgrounds usually imply a standard overlay
            font: 'sans',
            colors: {
                primary: '#000000',
                accent: '#000000',
                text: '#000000',
                bg: 'transparent'
            },
            isCustom: true,
            backgroundImage: base64
        };
        onAddTheme(themeToSave);
        onUpdateTemplate(themeToSave.id);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon size={20} className="text-blue-600" />
            <span>Settings</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'company' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Building size={16} /> Company
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'templates' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutTemplate size={16} /> Templates
          </button>
          <button 
            onClick={() => setActiveTab('payment')}
            className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'payment' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <CreditCard size={16} /> Payment
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'preferences' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <SettingsIcon size={16} /> Prefs
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'clients' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <User size={16} /> Clients
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'company' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-1 space-y-4 w-full">
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Company Name ("From")</label>
                     <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.name} onChange={e => updateSenderField('name', e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Website URL</label>
                     <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.website} onChange={e => updateSenderField('website', e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
                     <textarea className="w-full border p-2 rounded text-sm h-24" value={localSender.address} onChange={e => updateSenderField('address', e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Mobile</label>
                     <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.mobile} onChange={e => updateSenderField('mobile', e.target.value)} />
                   </div>
                </div>
                
                {/* Logo Upload */}
                <div className="w-full sm:w-1/3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Company Logo (PNG)</label>
                  <div 
                    className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors h-40 text-center relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logo ? (
                      <img src={logo} alt="Logo" className="max-h-24 max-w-full object-contain mb-2 z-10" />
                    ) : (
                      <Upload className="text-slate-300 mb-2 z-10" size={32} />
                    )}
                    <span className="text-xs text-slate-500 z-10">{logo ? 'Click to change' : 'Upload PNG Logo'}</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={(e) => handleFileChange(e, onUpdateLogo)}
                    />
                  </div>
                  {logo && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateLogo(''); }}
                      className="text-red-500 text-xs mt-2 w-full text-center hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
               {isCreatingTheme ? (
                 <div className="bg-slate-50 p-5 rounded-xl border border-blue-200 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                           <Palette size={18} className="text-blue-600" />
                           Create Custom Theme
                        </h3>
                        <button onClick={() => setIsCreatingTheme(false)} className="text-slate-400 hover:text-slate-600">
                           <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-4">
                       <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Theme Name</label>
                          <input 
                            type="text" 
                            className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="My Awesome Theme"
                            value={newTheme.name}
                            onChange={(e) => setNewTheme(prev => ({...prev, name: e.target.value}))}
                          />
                       </div>
                       
                       <div>
                          <label className="block text-xs font-medium text-slate-500 mb-2">Layout Structure</label>
                          <div className="grid grid-cols-3 gap-3">
                             {['standard', 'sidebar', 'minimal'].map(layout => (
                                <button
                                   key={layout}
                                   onClick={() => setNewTheme(prev => ({...prev, layout: layout as any}))}
                                   className={`py-2 px-3 rounded border text-sm capitalize ${newTheme.layout === layout ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                                >
                                   {layout}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-medium text-slate-500 mb-1">Primary Color</label>
                             <div className="flex gap-2 items-center">
                                <input 
                                   type="color" 
                                   className="w-10 h-10 rounded cursor-pointer border-0"
                                   value={newTheme.colors?.primary}
                                   onChange={(e) => setNewTheme(prev => ({...prev, colors: {...prev.colors!, primary: e.target.value}}))}
                                />
                                <span className="text-xs text-slate-500 font-mono">{newTheme.colors?.primary}</span>
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-medium text-slate-500 mb-1">Accent Color</label>
                             <div className="flex gap-2 items-center">
                                <input 
                                   type="color" 
                                   className="w-10 h-10 rounded cursor-pointer border-0"
                                   value={newTheme.colors?.accent}
                                   onChange={(e) => setNewTheme(prev => ({...prev, colors: {...prev.colors!, accent: e.target.value}}))}
                                />
                                <span className="text-xs text-slate-500 font-mono">{newTheme.colors?.accent}</span>
                             </div>
                          </div>
                       </div>

                       <div>
                          <label className="block text-xs font-medium text-slate-500 mb-2">Typography</label>
                          <select 
                             className="w-full border p-2 rounded text-sm bg-white"
                             value={newTheme.font}
                             onChange={(e) => setNewTheme(prev => ({...prev, font: e.target.value as any}))}
                          >
                             <option value="sans">Sans Serif (Modern)</option>
                             <option value="serif">Serif (Classic)</option>
                             <option value="mono">Monospace (Technical)</option>
                          </select>
                       </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                       <button onClick={() => setIsCreatingTheme(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                       <button onClick={handleSaveTheme} className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save Theme</button>
                    </div>
                 </div>
               ) : (
                 <>
                   <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Select Design Template</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                         {/* Default Themes */}
                         {Object.values(DEFAULT_THEMES).map(tpl => (
                           <button
                             key={tpl.id}
                             onClick={() => onUpdateTemplate(tpl.id)}
                             className={`relative rounded-lg border-2 p-3 flex flex-col items-center gap-2 transition-all hover:bg-slate-50 ${templateId === tpl.id ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50' : 'border-slate-200'}`}
                           >
                              <div className="w-12 h-16 rounded shadow-sm" style={{ backgroundColor: tpl.colors.primary }}></div>
                              <span className="text-xs font-medium text-slate-700 text-center">{tpl.name}</span>
                              {templateId === tpl.id && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></div>}
                           </button>
                         ))}
                         
                         {/* Custom Themes */}
                         {customThemes.map(tpl => (
                           <button
                             key={tpl.id}
                             onClick={() => onUpdateTemplate(tpl.id)}
                             className={`relative rounded-lg border-2 p-3 flex flex-col items-center gap-2 transition-all hover:bg-slate-50 group ${templateId === tpl.id ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50' : 'border-slate-200'}`}
                           >
                              <div className="w-12 h-16 rounded shadow-sm overflow-hidden" style={{ backgroundColor: tpl.colors.primary }}>
                                {tpl.backgroundImage && <img src={tpl.backgroundImage} className="w-full h-full object-cover opacity-50" />}
                              </div>
                              <span className="text-xs font-medium text-slate-700 text-center truncate w-full">{tpl.name}</span>
                              {templateId === tpl.id && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></div>}
                              <div 
                                onClick={(e) => { e.stopPropagation(); onDeleteTheme && onDeleteTheme(tpl.id); }}
                                className="absolute top-1 left-1 bg-white rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-opacity border border-red-100 shadow-sm"
                                title="Delete Theme"
                              >
                                <Trash2 size={12} />
                              </div>
                           </button>
                         ))}

                         {/* Add New Button */}
                         <button
                             onClick={() => setIsCreatingTheme(true)}
                             className="relative rounded-lg border-2 border-dashed border-slate-300 p-3 flex flex-col items-center justify-center gap-2 transition-all hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-500"
                           >
                              <Plus size={24} />
                              <span className="text-xs font-medium text-center">Create Custom</span>
                           </button>
                      </div>
                      
                      {/* Advanced Actions */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                           onClick={() => themeFileInputRef.current?.click()}
                           className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium text-slate-600 transition-colors border border-slate-200"
                        >
                            <FileJson size={14} /> Import Theme (JSON)
                            <input 
                                type="file" 
                                ref={themeFileInputRef} 
                                className="hidden" 
                                accept=".json" 
                                onChange={handleImportTheme}
                            />
                        </button>
                        <button
                           onClick={() => bgImageInputRef.current?.click()}
                           className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium text-slate-600 transition-colors border border-slate-200"
                        >
                            <ImageIcon size={14} /> New from Background
                            <input 
                                type="file" 
                                ref={bgImageInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleCreateFromImage}
                            />
                        </button>
                      </div>
                   </div>

                   <div className="border-t pt-4">
                      <div className="flex flex-col gap-4">
                          <label className="flex items-center gap-3 cursor-pointer group">
                             <div className={`w-10 h-6 rounded-full p-1 transition-colors ${showWatermark ? 'bg-blue-600' : 'bg-slate-300'}`} onClick={() => onToggleWatermark(!showWatermark)}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${showWatermark ? 'translate-x-4' : ''}`}></div>
                             </div>
                             <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Droplets size={16} className="text-slate-400" />
                                Show Watermark
                             </span>
                          </label>
                          
                          {/* Custom Watermark Upload */}
                          {showWatermark && (
                            <div className="ml-12 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <label className="block text-xs font-medium text-slate-500 mb-2">Custom Watermark Image (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center bg-white cursor-pointer hover:border-blue-400"
                                        onClick={() => watermarkInputRef.current?.click()}
                                    >
                                        {customWatermark ? (
                                            <img src={customWatermark} className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <Upload size={16} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="file" 
                                            ref={watermarkInputRef} 
                                            className="hidden" 
                                            accept="image/png,image/jpeg"
                                            onChange={(e) => handleFileChange(e, (base64) => onUpdateCustomWatermark && onUpdateCustomWatermark(base64))}
                                        />
                                        <button 
                                            onClick={() => watermarkInputRef.current?.click()}
                                            className="text-xs text-blue-600 hover:underline block mb-1"
                                        >
                                            Upload Image
                                        </button>
                                        {customWatermark && (
                                            <button 
                                                onClick={() => onUpdateCustomWatermark && onUpdateCustomWatermark('')}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Remove Custom Watermark
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">Overrides your logo for the watermark.</p>
                            </div>
                          )}
                      </div>
                   </div>
                 </>
               )}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">Account Name</label>
                 <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.accountName} onChange={e => updateSenderField('accountName', e.target.value)} />
               </div>
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">Account Number</label>
                 <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.accountNumber} onChange={e => updateSenderField('accountNumber', e.target.value)} />
               </div>
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">Bank Branch</label>
                 <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.branch} onChange={e => updateSenderField('branch', e.target.value)} />
               </div>
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">IFSC Code</label>
                 <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.ifsCode} onChange={e => updateSenderField('ifsCode', e.target.value)} />
               </div>
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">PAN Number</label>
                 <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.pan} onChange={e => updateSenderField('pan', e.target.value)} />
               </div>
            </div>
          )}

          {activeTab === 'preferences' && (
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Invoice Number Format (Prefix)</label>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    className="w-1/2 border p-2 rounded-l text-sm bg-white" 
                    value={localPrefix} 
                    onChange={e => setLocalPrefix(e.target.value)} 
                    placeholder="e.g. INV-"
                  />
                  <div className="bg-slate-100 border border-l-0 p-2 rounded-r text-sm text-slate-500">00123</div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Example: If you set prefix to "AS", invoice numbers will look like "AS00123".</p>
             </div>
          )}

          {activeTab === 'clients' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-700">Stored Clients</h3>
                <span className="text-xs text-slate-500">{clients.length} clients found</span>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-500 font-medium">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.id} className="border-t border-slate-200 hover:bg-white transition-colors">
                        <td className="p-3 font-medium text-slate-800">{client.name}</td>
                        <td className="p-3 text-slate-600">{client.email || '-'}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => {
                              if(window.confirm(`Delete client ${client.name}?`)) onDeleteClient(client.id);
                            }}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {clients.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-slate-400">No clients stored yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;