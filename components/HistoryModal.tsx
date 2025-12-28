import React, { useState } from 'react';
import { InvoiceHistoryItem, InvoiceData } from '../types';
import { X, Search, Clock, RotateCcw, Trash2, FileText, Calendar, DollarSign } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: InvoiceHistoryItem[];
  onLoad: (data: InvoiceData) => void;
  onDelete: (id: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onLoad, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    const search = searchTerm.toLowerCase();
    const invoiceNo = item.data.invoiceNumber.toLowerCase();
    const clientName = item.data.client?.name.toLowerCase() || '';
    return invoiceNo.includes(search) || clientName.includes(search);
  });

  const calculateTotal = (data: InvoiceData) => {
    return data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            <span>History</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by invoice # or client name..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-4 bg-slate-50">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Clock size={48} className="mb-4 opacity-20" />
              <p>No history yet.</p>
              <p className="text-xs mt-1">Generated invoices will appear here.</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No results found for "{searchTerm}"
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-4">
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${item.data.type === 'invoice' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {item.data.type}
                        </span>
                        <span className="font-mono font-medium text-slate-800 text-sm">#{item.data.invoiceNumber}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 ml-2">
                             <Calendar size={10} /> {formatDate(item.lastModified)}
                        </span>
                      </div>
                      <div className="font-medium text-slate-700 truncate">
                        {item.data.client?.name || 'No Client'}
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                         <div className="text-xs text-slate-400">Total</div>
                         <div className="font-bold text-slate-800 flex items-center">
                            <DollarSign size={12} className="text-slate-400" />
                            {calculateTotal(item.data).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
                         <button 
                            onClick={() => {
                                if(window.confirm('Load this version? Current unsaved changes will be lost.')) {
                                    onLoad(item.data);
                                    onClose();
                                }
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Restore"
                         >
                            <RotateCcw size={18} />
                         </button>
                         <button 
                            onClick={() => {
                                if(window.confirm('Delete this from history?')) {
                                    onDelete(item.id);
                                }
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                         >
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
