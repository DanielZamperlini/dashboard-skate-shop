export type ProductCategory =
  | 'Shapes'
  | 'Trucks'
  | 'Rodas'
  | 'Rolamentos'
  | 'Lixas'
  | 'Parafusos'
  | 'Ferramentas'
  | 'Acessórios'
  | 'Roupas'
  | 'Tênis'
  | 'Outros';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  quantity: number;
  category: ProductCategory;
  minStock?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName: string;
  items: SaleItem[];
  total: number;
  paid: boolean;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  paymentDate?: Date;
  partialPayment?: {
    amount: number;
    date: Date;
    method: string;
  }[];
  remainingAmount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  notes?: string;
  paymentMethod: string;
}
