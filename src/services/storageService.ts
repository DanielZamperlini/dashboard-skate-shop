/* eslint-disable @typescript-eslint/no-explicit-any */
import { Product, Sale, Expense } from '../types';

// Keys for localStorage
const PRODUCTS_KEY = 'skate-shop-products';
const SALES_KEY = 'skate-shop-sales';
const EXPENSES_KEY = 'skate-shop-expenses';

// Helper functions for date handling
const serializeDate = (obj: any): any => {
  const newObj: any = { ...obj };

  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof Date) {
      newObj[key] = obj[key].toISOString();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[key] = serializeDate(obj[key]);
    }
  });

  return newObj;
};

const deserializeDate = (obj: any): any => {
  const newObj: any = { ...obj };

  Object.keys(obj).forEach((key) => {
    if (
      typeof obj[key] === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj[key])
    ) {
      newObj[key] = new Date(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[key] = deserializeDate(obj[key]);
    }
  });

  return newObj;
};

// Products
export const saveProducts = (products: Product[]): void => {
  try {
    const serializedProducts = products.map((product) =>
      serializeDate(product),
    );
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(serializedProducts));
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
  }
};

export const loadProducts = (): Product[] => {
  try {
    const productsJson = localStorage.getItem(PRODUCTS_KEY);
    if (!productsJson) return [];

    const products = JSON.parse(productsJson);
    return products.map((product: any) => deserializeDate(product));
  } catch (error) {
    console.error('Error loading products from localStorage:', error);
    return [];
  }
};

// Sales
export const saveSales = (sales: Sale[]): void => {
  try {
    const serializedSales = sales.map((sale) => serializeDate(sale));
    localStorage.setItem(SALES_KEY, JSON.stringify(serializedSales));
  } catch (error) {
    console.error('Error saving sales to localStorage:', error);
  }
};

export const loadSales = (): Sale[] => {
  try {
    const salesJson = localStorage.getItem(SALES_KEY);
    if (!salesJson) return [];

    const sales = JSON.parse(salesJson);
    return sales.map((sale: any) => deserializeDate(sale));
  } catch (error) {
    console.error('Error loading sales from localStorage:', error);
    return [];
  }
};

// Expenses
export const saveExpenses = (expenses: Expense[]): void => {
  try {
    const serializedExpenses = expenses.map((expense) =>
      serializeDate(expense),
    );
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(serializedExpenses));
  } catch (error) {
    console.error('Error saving expenses to localStorage:', error);
  }
};

export const loadExpenses = (): Expense[] => {
  try {
    const expensesJson = localStorage.getItem(EXPENSES_KEY);
    if (!expensesJson) return [];

    const expenses = JSON.parse(expensesJson);
    return expenses.map((expense: any) => deserializeDate(expense));
  } catch (error) {
    console.error('Error loading expenses from localStorage:', error);
    return [];
  }
};

// Clear all data - useful for testing or resetting the app
export const clearAllData = (): void => {
  localStorage.removeItem(PRODUCTS_KEY);
  localStorage.removeItem(SALES_KEY);
  localStorage.removeItem(EXPENSES_KEY);
};
