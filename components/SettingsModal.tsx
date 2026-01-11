
import React, { useState, useRef } from 'react';
import { SenderDetails, Client, InvoiceTheme, DEFAULT_THEMES } from '../types';
import { X, Upload, Save, Trash2, User, CreditCard, Building, Settings as SettingsIcon, LayoutTemplate, Droplets, Plus, Palette, FileJson, Image as ImageIcon, Download, Sliders, Copy } from 'lucide-react';
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
  onUpdateCustomThemeDetails?: (theme: InvoiceTheme) => void;
  customWatermark?: string;
  onUpdateCustomWatermark?: (base64: string) => void;
  watermarkOpacity?: number;
  onUpdateWatermarkOpacity?: (opacity: number) => void;
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
  onUpdateCustomThemeDetails,
  customWatermark,
  onUpdateCustomWatermark,
  watermarkOpacity = 10,
  onUpdateWatermarkOpacity
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [localSender, setLocalSender] = useState<SenderDetails>(senderDetails);
  const [localPrefix, setLocalPrefix] = useState(invoicePrefix);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const themeFileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  const [isCreatingTheme, setIsCreatingTheme] = useState(false);
  const [newTheme, setNewTheme] = useState<Partial<InvoiceTheme>>({
    name: 'My Custom Theme',
    layout: 'standard',
    font: 'sans',
    colors: { primary: '#3b82f6', accent: '#fbbf24', text: '#1f2937', bg: 'white', tableColor: '#3b82f6' }
  });

  const activeCustomTheme = customThemes.find(t => t.id === templateId);
  const activeTheme = activeCustomTheme || DEFAULT_THEMES[templateId];

  const getConfig = (key: keyof NonNullable<InvoiceTheme['customConfig']>, def: number) => {
    return activeTheme?.customConfig?.[key] ?? def;
  };

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
            tableColor: newTheme.colors?.tableColor || newTheme.colors?.primary || '#000000',
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

  const handleCloneTheme = () => {
    if (!onAddTheme) return;
    const standardTheme = DEFAULT_THEMES[templateId];
    if (!standardTheme) return;

    const clonedTheme: InvoiceTheme = {
      ...JSON.parse(JSON.stringify(standardTheme)),
      id: `custom-${uuidv4()}`,
      name: `${standardTheme.name} (Custom)`,
      isCustom: true,
      colors: {
          ...standardTheme.colors,
          tableColor: standardTheme.colors.tableColor || standardTheme.colors.primary
      }
    };
    onAddTheme(clonedTheme);
    onUpdateTemplate(clonedTheme.id);
  };

  const updateActiveThemeConfig = (key: keyof NonNullable<InvoiceTheme['customConfig']>, value: number) => {
    if (activeCustomTheme && onUpdateCustomThemeDetails) {
        onUpdateCustomThemeDetails({
            ...activeCustomTheme,
            customConfig: {
                ...activeCustomTheme.customConfig,
                [key]: value
            }
        });
    } else if (!activeCustomTheme && onAddTheme && onUpdateTemplate) {
        const standardTheme = DEFAULT_THEMES[templateId];
        if (standardTheme) {
            const newThemeId = `custom-${uuidv4()}`;
            onAddTheme({
                ...JSON.parse(JSON.stringify(standardTheme)),
                id: newThemeId,
                name: `${standardTheme.name} (Custom)`,
                isCustom: true,
                customConfig: {
                    ...standardTheme.customConfig,
                    [key]: value
                }
            });
            onUpdateTemplate(newThemeId);
        }
    }
  };

  const updateActiveThemeColor = (key: keyof InvoiceTheme['colors'], value: string) => {
    if (activeCustomTheme && onUpdateCustomThemeDetails) {
        onUpdateCustomThemeDetails({
            ...activeCustomTheme,
            colors: {
                ...activeCustomTheme.colors,
                [key]: value
            }
        });
    } else if (!activeCustomTheme && onAddTheme && onUpdateTemplate) {
        const standardTheme = DEFAULT_THEMES[templateId];
        if (standardTheme) {
            const newThemeId = `custom-${uuidv4()}`;
            onAddTheme({
                ...JSON.parse(JSON.stringify(standardTheme)),
                id: newThemeId,
                name: `${standardTheme.name} (Custom)`,
                isCustom: true,
                colors: {
                    ...standardTheme.colors,
                    [key]: value
                }
            });
            onUpdateTemplate(newThemeId);
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon size={20} className="text-blue-600" />
            <span>Settings</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-200 overflow-x-auto">
          {['company', 'templates', 'payment', 'preferences', 'clients'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`flex-1 py-3 px-2 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'company' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-full">
                     <label className="block text-xs font-medium text-slate-500 mb-1">Company Name</label>
                     <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.name} onChange={e => updateSenderField('name', e.target.value)} />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Website</label>
                     <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.website} onChange={e => updateSenderField('website', e.target.value)} />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                     <input type="text" className="w-full border p-2 rounded text-sm" value={localSender.email} onChange={e => updateSenderField('email', e.target.value)} />
                  </div>
                  <div className="col-span-full">
                     <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
                     <textarea className="w-full border p-2 rounded text-sm h-20" value={localSender.address} onChange={e => updateSenderField('address', e.target.value)} />
                  </div>
                  <div 
                    className="col-span-full border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors h-32"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logo ? <img src={logo} alt="Logo" className="max-h-20 max-w-full object-contain" /> : <Upload className="text-slate-300" size={24} />}
                    <span className="text-xs text-slate-500 mt-2">{logo ? 'Click to change' : 'Upload Logo'}</span>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, onUpdateLogo)} />
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
               {isCreatingTheme ? (
                 <div className="bg-slate-50 p-5 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Palette size={18}/> Create Custom Theme</h3>
                    <div className="space-y-4">
                       <input 
                         type="text" 
                         className="w-full border p-2 rounded text-sm" 
                         placeholder="Theme Name"
                         value={newTheme.name}
                         onChange={(e) => setNewTheme(prev => ({...prev, name: e.target.value}))}
                       />
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Primary Color</label>
                             <input type="color" className="w-full h-10 rounded cursor-pointer border" value={newTheme.colors?.primary} onChange={(e) => setNewTheme(prev => ({...prev, colors: {...prev.colors!, primary: e.target.value}}))} />
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Table Color</label>
                             <input type="color" className="w-full h-10 rounded cursor-pointer border" value={newTheme.colors?.tableColor} onChange={(e) => setNewTheme(prev => ({...prev, colors: {...prev.colors!, tableColor: e.target.value}}))} />
                          </div>
                       </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                       <button onClick={() => setIsCreatingTheme(false)} className="text-sm text-slate-500">Cancel</button>
                       <button onClick={handleSaveTheme} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold">Create</button>
                    </div>
                 </div>
               ) : (
                 <>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.values(DEFAULT_THEMES).concat(customThemes).map(tpl => (
                        <button
                          key={tpl.id}
                          onClick={() => onUpdateTemplate(tpl.id)}
                          className={`relative rounded-lg border-2 p-3 flex flex-col items-center gap-2 transition-all ${templateId === tpl.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}
                        >
                           <div className="w-full h-8 rounded" style={{ backgroundColor: tpl.colors.primary }}></div>
                           <span className="text-[10px] font-bold truncate w-full">{tpl.name}</span>
                        </button>
                      ))}
                      <button onClick={() => setIsCreatingTheme(true)} className="border-2 border-dashed border-slate-300 rounded-lg p-3 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500">
                         <Plus size={20} />
                         <span className="text-[10px] font-bold">Custom</span>
                      </button>
                   </div>

                   <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2"><Sliders size={14}/> Customize Active Template</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Table Color</label>
                            <input 
                              type="color" 
                              className="w-full h-8 rounded cursor-pointer border" 
                              value={activeTheme.colors.tableColor || activeTheme.colors.primary} 
                              onChange={(e) => updateActiveThemeColor('tableColor', e.target.value)} 
                            />
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Primary Color</label>
                            <input 
                              type="color" 
                              className="w-full h-8 rounded cursor-pointer border" 
                              value={activeTheme.colors.primary} 
                              onChange={(e) => updateActiveThemeColor('primary', e.target.value)} 
                            />
                         </div>
                      </div>
                      <div className="space-y-3 pt-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400">Layout Adjustments</label>
                        <div className="grid grid-cols-2 gap-2">
                           {[['Logo X', 'logoX'], ['Logo Y', 'logoY'], ['Margin T', 'marginTop'], ['Margin B', 'marginBottom']].map(([label, key]) => (
                             <div key={key}>
                               <span className="text-[10px] text-slate-500">{label} (mm)</span>
                               <input 
                                 type="number" 
                                 className="w-full border rounded p-1 text-xs" 
                                 value={getConfig(key as any, 0)} 
                                 onChange={(e) => updateActiveThemeConfig(key as any, Number(e.target.value))} 
                               />
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                 </>
               )}
            </div>
          )}

          {/* ... other tabs ... */}
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
