// Core domain types
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    city: string;
    state: string;
  };
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  prescription: Prescription;
  lastVisit: string;
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold';
  shopId: string;
}

export interface Prescription {
  sphere: EyeMeasurement;
  cylinder: EyeMeasurement;
  axis: EyeMeasurement;
  add: EyeMeasurement;
}

export interface EyeMeasurement {
  right: number;
  left: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  type: 'Eyewear' | 'Service' | 'Contact Lenses';
  brand?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  total: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  items: InvoiceItem[];
  shopId: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  shopId: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
}

// User roles and authentication
export type UserRole = 'admin' | 'owner' | 'staff' | 'doctor' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  address?: {
    city: string;
    state: string;
  };
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  prescription: Prescription;
}

export interface ProductFormData {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  type: 'Eyewear' | 'Service' | 'Contact Lenses';
  brand?: string;
  createdAt: string;
}

// Context types
export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
}

export interface CurrencyContextType {
  currency: string;
  formatCurrency: (value: number, showPlus?: boolean) => string;
  convertedValues: Record<string, number>;
  registerValue: (id: string, value: number, isDynamic?: boolean) => void;
}

export type LanguageCode = 'en' | 'es' | 'hi' | 'bn';

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Theme types
export type Theme = 'dark' | 'primary' | 'regal' | 'mint';

export interface ThemeOption {
  name: string;
  value: Theme;
  icon: React.ComponentType<{ className?: string }>;
}
