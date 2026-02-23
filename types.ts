
export interface Client {
  id: string;
  name: string;
  email: string;
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
  email: string;
}

export interface AppSettings {
  logoUrl?: string;
  invoicePrefix: string;
  templateId: string;
  showWatermark: boolean;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  type: 'invoice' | 'quotation';
  invoiceNumber: string;
  date: string;
  dueDate: string;
  sender: SenderDetails;
  client: Client | null;
  items: LineItem[];
  notes?: string;
}

export interface InvoiceHistoryItem {
  id: string;
  createdAt: number;
  lastModified: number;
  data: InvoiceData;
}

export interface InvoiceTheme {
  id: string;
  name: string;
  layout: 'standard' | 'sidebar' | 'minimal';
  colors: {
    primary: string;
    accent: string;
    text: string;
    bg: string;
    tableColor?: string; // NEW: Custom color for the items table
    headerText?: string;
    sidebarBg?: string;
    sidebarText?: string;
  };
  font: 'serif' | 'sans' | 'mono';
  isCustom?: boolean;
  backgroundImage?: string;
  customConfig?: {
    backgroundOpacity?: number;
    marginTop?: number;
    marginBottom?: number;
    backgroundScale?: number;
    backgroundPositionX?: number;
    backgroundPositionY?: number;
    logoScale?: number;
    logoX?: number;
    logoY?: number;
    watermarkScale?: number;
    watermarkX?: number;
    watermarkY?: number;
  };
}

export const DEFAULT_THEMES: Record<string, InvoiceTheme> = {
  'classic-blue': {
    id: 'classic-blue',
    name: 'Classic Blue',
    layout: 'standard',
    colors: { primary: '#0e3a5d', accent: '#fbbf24', text: '#1f2937', bg: 'white', headerText: 'white', tableColor: '#0e3a5d' },
    font: 'serif'
  },
  'classic-red': {
    id: 'classic-red',
    name: 'Classic Red',
    layout: 'standard',
    colors: { primary: '#7f1d1d', accent: '#fca5a5', text: '#1f2937', bg: 'white', headerText: 'white', tableColor: '#7f1d1d' },
    font: 'serif'
  },
  'classic-green': {
    id: 'classic-green',
    name: 'Classic Green',
    layout: 'standard',
    colors: { primary: '#064e3b', accent: '#34d399', text: '#1f2937', bg: 'white', headerText: 'white', tableColor: '#064e3b' },
    font: 'serif'
  },
  'modern-sidebar': {
    id: 'modern-sidebar',
    name: 'Modern Sidebar',
    layout: 'sidebar',
    colors: { primary: '#334155', accent: '#3b82f6', text: '#1f2937', bg: 'white', sidebarText: 'white', sidebarBg: '#1e293b', tableColor: '#334155' },
    font: 'sans'
  },
  'minimalist': {
    id: 'minimalist',
    name: 'Minimalist',
    layout: 'minimal',
    colors: { primary: 'black', accent: '#e5e7eb', text: '#1f2937', bg: 'white', tableColor: 'black' },
    font: 'mono'
  }
};

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
  website: "www.adversitysolutions.in",
  email: "billing@adversitysolutions.in"
};
