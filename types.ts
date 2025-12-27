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

export interface InvoiceTheme {
  id: string;
  name: string;
  layout: 'standard' | 'sidebar' | 'minimal';
  colors: {
    primary: string;
    accent: string;
    text: string;
    bg: string;
    headerText?: string;
    sidebarBg?: string;
    sidebarText?: string;
  };
  font: 'serif' | 'sans' | 'mono';
  isCustom?: boolean;
  backgroundImage?: string; // Base64 string for full page background
  customConfig?: {
    backgroundOpacity?: number; // 0-100
    marginTop?: number; // in mm
    marginBottom?: number; // in mm
    backgroundScale?: number; // 50-200 (percentage)
    backgroundPositionX?: number; // 0-100 (percentage)
    backgroundPositionY?: number; // 0-100 (percentage)
  };
}

export const DEFAULT_THEMES: Record<string, InvoiceTheme> = {
  'classic-blue': {
    id: 'classic-blue',
    name: 'Classic Blue',
    layout: 'standard',
    colors: { primary: '#0e3a5d', accent: '#fbbf24', text: '#1f2937', bg: 'white', headerText: 'white' },
    font: 'serif'
  },
  'classic-red': {
    id: 'classic-red',
    name: 'Classic Red',
    layout: 'standard',
    colors: { primary: '#7f1d1d', accent: '#fca5a5', text: '#1f2937', bg: 'white', headerText: 'white' },
    font: 'serif'
  },
  'classic-green': {
    id: 'classic-green',
    name: 'Classic Green',
    layout: 'standard',
    colors: { primary: '#064e3b', accent: '#34d399', text: '#1f2937', bg: 'white', headerText: 'white' },
    font: 'serif'
  },
  'modern-sidebar': {
    id: 'modern-sidebar',
    name: 'Modern Sidebar',
    layout: 'sidebar',
    colors: { primary: '#334155', accent: '#3b82f6', text: '#1f2937', bg: 'white', sidebarText: 'white', sidebarBg: '#1e293b' },
    font: 'sans'
  },
  'midnight-sidebar': {
    id: 'midnight-sidebar',
    name: 'Midnight Sidebar',
    layout: 'sidebar',
    colors: { primary: 'black', accent: '#94a3b8', text: '#1f2937', bg: 'white', sidebarText: 'white', sidebarBg: 'black' },
    font: 'sans'
  },
  'teal-sidebar': {
    id: 'teal-sidebar',
    name: 'Teal Sidebar',
    layout: 'sidebar',
    colors: { primary: '#0f766e', accent: '#5eead4', text: '#1f2937', bg: 'white', sidebarText: 'white', sidebarBg: '#0d9488' },
    font: 'sans'
  },
  'minimalist': {
    id: 'minimalist',
    name: 'Minimalist',
    layout: 'minimal',
    colors: { primary: 'black', accent: '#e5e7eb', text: '#1f2937', bg: 'white' },
    font: 'mono'
  },
  'minimalist-blue': {
    id: 'minimalist-blue',
    name: 'Minimalist Blue',
    layout: 'minimal',
    colors: { primary: '#2563eb', accent: '#bfdbfe', text: '#1f2937', bg: 'white' },
    font: 'sans'
  },
  'bold-header': {
    id: 'bold-header',
    name: 'Bold Orange',
    layout: 'standard',
    colors: { primary: '#f97316', accent: '#fdba74', text: '#1f2937', bg: 'white', headerText: 'white' },
    font: 'sans'
  },
  'corporate-grey': {
    id: 'corporate-grey',
    name: 'Corporate Grey',
    layout: 'standard',
    colors: { primary: '#475569', accent: '#cbd5e1', text: '#1f2937', bg: 'white', headerText: 'white' },
    font: 'sans'
  }
};

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
  website: "www.adversitysolutions.in",
  email: "billing@adversitysolutions.in"
};