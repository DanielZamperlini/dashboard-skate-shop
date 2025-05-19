import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import { Product, Sale, Expense, Customer } from '../types';

interface ShopDB extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { 'by-category': string };
  };
  sales: {
    key: string;
    value: Sale;
    indexes: {
      'by-date': string;
      'by-paid': string;
      'by-customer': string;
    };
  };
  expenses: {
    key: string;
    value: Expense;
    indexes: { 'by-date': string; 'by-category': string };
  };
  customers: {
    key: string;
    value: Customer;
    indexes: { 'by-phone': string };
  };
}

const dbName = 'skate-shop-db';
const dbVersion = 2;

export const db = await openDB<ShopDB>(dbName, dbVersion, {
  upgrade(db: IDBPDatabase<ShopDB>, oldVersion: number) {
    // Se for uma nova instalação (oldVersion === 0)
    if (oldVersion === 0) {
      // Products store
      const productStore = db.createObjectStore('products', { keyPath: 'id' });
      productStore.createIndex('by-category', 'category');

      // Sales store
      const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
      salesStore.createIndex('by-date', 'createdAt');
      salesStore.createIndex('by-paid', 'paid');
      salesStore.createIndex('by-customer', 'customerId');

      // Expenses store
      const expensesStore = db.createObjectStore('expenses', { keyPath: 'id' });
      expensesStore.createIndex('by-date', 'date');
      expensesStore.createIndex('by-category', 'category');

      // Customers store
      const customersStore = db.createObjectStore('customers', {
        keyPath: 'id',
      });
      customersStore.createIndex('by-phone', 'phone');
    }
  },
});

export default db;
