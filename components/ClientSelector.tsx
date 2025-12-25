import React, { useState, useEffect, useRef } from 'react';
import { Client } from '../types';
import { Search, X, User, Plus, Save, Edit } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ClientSelectorProps {
  selectedClient: Client | null;
  onSelectClient: (client: Client | null) => void;
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ 
  selectedClient, 
  onSelectClient, 
  clients, 
  onAddClient,
  onUpdateClient 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // New/Edit Client Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (client: Client) => {
    onSelectClient(client);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectClient(null);
    setQuery('');
  };

  const handleOpenCreateModal = () => {
    setNewClient({ name: query });
    setIsOpen(false);
    setIsModalOpen(true);
  };

  const handleEditClient = () => {
    if (selectedClient) {
      setNewClient({ ...selectedClient });
      setIsModalOpen(true);
    }
  };

  const handleSaveClient = () => {
    if (!newClient.name || !newClient.address) {
        alert("Name and Address are required");
        return;
    }

    if (newClient.id) {
        // Update existing client
        onUpdateClient(newClient as Client);
    } else {
        // Create new client
        const clientToAdd: Client = {
            id: uuidv4(),
            name: newClient.name,
            address: newClient.address,
            email: newClient.email || '',
            gstin: newClient.gstin,
            vatId: newClient.vatId
        };
        onAddClient(clientToAdd);
    }

    setIsModalOpen(false);
    setQuery('');
    setNewClient({});
  };

  return (
    <div className="relative">
      {selectedClient ? (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group">
          <div className="absolute top-2 right-2 flex space-x-1 z-10">
             <button 
               onClick={handleEditClient}
               className="text-slate-400 hover:text-blue-500 transition-colors p-1"
               title="Edit Client"
             >
               <Edit size={16} />
             </button>
             <button 
               onClick={handleClear}
               className="text-slate-400 hover:text-red-500 transition-colors p-1"
               title="Remove Client"
             >
               <X size={16} />
             </button>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
               <User size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{selectedClient.name}</h3>
              <p className="text-sm text-slate-500 whitespace-pre-line">{selectedClient.address}</p>
              <p className="text-sm text-slate-400 mt-1">{selectedClient.email}</p>
              {(selectedClient.gstin || selectedClient.vatId) && (
                <p className="text-xs text-slate-400 mt-1">
                  {selectedClient.gstin ? `GSTIN: ${selectedClient.gstin}` : `VAT: ${selectedClient.vatId}`}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="relative">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Search or add client..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          </div>

          {isOpen && query.length > 0 && (
            <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleSelect(client)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex items-center space-x-3"
                  >
                     <div className="bg-slate-100 p-2 rounded-full text-slate-500">
                       <User size={16} />
                     </div>
                     <div>
                       <div className="font-medium text-slate-700">{client.name}</div>
                       <div className="text-xs text-slate-500 truncate">{client.email}</div>
                     </div>
                  </button>
                ))
              ) : (
                 <div className="p-2">
                     <button 
                        onClick={handleOpenCreateModal}
                        className="w-full flex items-center justify-center space-x-2 text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-md transition-colors font-medium text-sm"
                     >
                        <Plus size={16} />
                        <span>Create new client "{query}"</span>
                     </button>
                 </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE/EDIT CLIENT MODAL */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">{newClient.id ? 'Edit Client' : 'Add New Client'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Client Name *</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newClient.name || ''}
                            onChange={e => setNewClient(prev => ({...prev, name: e.target.value}))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Address (Multi-line) *</label>
                        <textarea 
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            value={newClient.address || ''}
                            onChange={e => setNewClient(prev => ({...prev, address: e.target.value}))}
                            placeholder="Street, City, State, Zip, Country"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                            <input 
                                type="email" 
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newClient.email || ''}
                                onChange={e => setNewClient(prev => ({...prev, email: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">GSTIN / VAT ID</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newClient.gstin || ''}
                                onChange={e => setNewClient(prev => ({...prev, gstin: e.target.value}))}
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSaveClient}
                        className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-2"
                    >
                        <Save size={16} />
                        <span>{newClient.id ? 'Update Client' : 'Save Client'}</span>
                    </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ClientSelector;