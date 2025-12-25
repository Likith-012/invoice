export interface Client {
  id: string;
  name: string;
  email: string; // Keep for internal use/search
  address: string;
  gstin?: string;
  vatId?: string;
}

export interface SenderDetails {
  name: string;
  address: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  ifsCode: string;
  pan: string;
  mobile: string;
  website: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string; // Not in screenshot explicitly but good to keep in data structure
  sender: SenderDetails;
  client: Client | null;
  items: LineItem[];
  notes?: string;
}

// Mock Data
export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Power Marine Clothing LLP',
    email: 'billing@powermarine.com',
    address: 'Plot Numbers S18, S19, S20, KIADB,Apparel\nPark,Bhashettihalli, Doddaballapura\nIndustrialArea, Bangalore RuralBangalore,\nKarnataka, 561203India',
    gstin: '29AAYFP7498K1ZS'
  },
  {
    id: '2',
    name: 'Acme Corp',
    email: 'billing@acme.com',
    address: '123 Innovation Dr, Tech City, CA 94000',
    vatId: 'US123456789'
  },
  {
    id: '3',
    name: 'Globex Corporation',
    email: 'accounts@globex.com',
    address: '42 Wallaby Way, Sydney, NSW 2000',
    vatId: 'AU987654321'
  }
];

export const DEFAULT_SENDER: SenderDetails = {
  name: "Adversity Solutions",
  address: "#1492/11 RT STREET , KOTE\nCHANNAPATNA, RAMNAGRA DISTRICT,\nKARNATAKA -562160",
  accountName: "VIJETH M",
  accountNumber: "50100562362268",
  branch: "Vijaynagar ,Mysore",
  ifsCode: "HDFC0003668",
  pan: "CQFPV6920D",
  mobile: "8050187327",
  website: "www.adversitysolutions.in"
};