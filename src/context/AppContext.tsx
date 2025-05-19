/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { Product, Sale, Expense, Customer } from '../types';
import ProductRepository from '../repositories/ProductRepository';
import SaleRepository from '../repositories/SaleRepository';
import ExpenseRepository from '../repositories/ExpenseRepository';
import CustomerRepository from '../repositories/CustomerRepository';

type AppState = {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
};

type AppContextType = {
  state: AppState;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  updateSale: (sale: Sale) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getBalance: () => number;
  getTotalSales: () => number;
  getTotalExpenses: () => number;
  getPendingSales: () => Promise<Sale[]>;
  getLowStockProducts: (threshold?: number) => Promise<Product[]>;
};

const initialState: AppState = {
  products: [],
  sales: [],
  expenses: [],
  customers: [],
};

type Action =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_SALES'; payload: Sale[] }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'UPDATE_SALE'; payload: Sale }
  | { type: 'DELETE_SALE'; payload: string }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product,
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(
          (product) => product.id !== action.payload,
        ),
      };
    case 'SET_SALES':
      return { ...state, sales: action.payload };
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'UPDATE_SALE':
      return {
        ...state,
        sales: state.sales.map((sale) =>
          sale.id === action.payload.id ? action.payload : sale,
        ),
      };
    case 'DELETE_SALE':
      return {
        ...state,
        sales: state.sales.filter((sale) => sale.id !== action.payload),
      };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id ? action.payload : expense,
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(
          (expense) => expense.id !== action.payload,
        ),
      };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((customer) =>
          customer.id === action.payload.id ? action.payload : customer,
        ),
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(
          (customer) => customer.id !== action.payload,
        ),
      };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        const products = await ProductRepository.findAll();
        const sales = await SaleRepository.findAll();
        const expenses = await ExpenseRepository.findAll();
        const customers = await CustomerRepository.findAll();

        dispatch({ type: 'SET_PRODUCTS', payload: products });
        dispatch({ type: 'SET_SALES', payload: sales });
        dispatch({ type: 'SET_EXPENSES', payload: expenses });
        dispatch({ type: 'SET_CUSTOMERS', payload: customers });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct = await ProductRepository.create(product);
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
  };

  const updateProduct = async (product: Product) => {
    const updatedProduct = await ProductRepository.update(product);
    dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
  };

  const deleteProduct = async (id: string) => {
    await ProductRepository.delete(id);
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  };

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    const newSale = await SaleRepository.create(sale);
    dispatch({ type: 'ADD_SALE', payload: newSale });

    // Update product quantities
    for (const item of sale.items) {
      const product = state.products.find((p) => p.id === item.productId);
      if (product) {
        const updatedProduct = {
          ...product,
          quantity: product.quantity - item.quantity,
        };
        await updateProduct(updatedProduct);
      }
    }
  };

  const updateSale = async (sale: Sale) => {
    const updatedSale = await SaleRepository.update(sale);
    dispatch({ type: 'UPDATE_SALE', payload: updatedSale });
  };

  const deleteSale = async (id: string) => {
    await SaleRepository.delete(id);
    dispatch({ type: 'DELETE_SALE', payload: id });
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = await ExpenseRepository.create(expense);
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const updateExpense = async (expense: Expense) => {
    const updatedExpense = await ExpenseRepository.update(expense);
    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
  };

  const deleteExpense = async (id: string) => {
    await ExpenseRepository.delete(id);
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    const newCustomer = await CustomerRepository.create(customer);
    dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
  };

  const updateCustomer = async (customer: Customer) => {
    const updatedCustomer = await CustomerRepository.update(customer);
    dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
  };

  const deleteCustomer = async (id: string) => {
    await CustomerRepository.delete(id);
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  };

  const getBalance = () => {
    const totalSales = getTotalSales();
    const totalExpenses = getTotalExpenses();
    return totalSales - totalExpenses;
  };

  const getTotalSales = () => {
    return state.sales.reduce((total, sale) => {
      if (sale.paid) {
        return total + sale.total;
      }
      return total;
    }, 0);
  };

  const getTotalExpenses = () => {
    return state.expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getPendingSales = async () => {
    return SaleRepository.findPending();
  };

  const getLowStockProducts = async (threshold = 5) => {
    return ProductRepository.findLowStock(threshold);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addProduct,
        updateProduct,
        deleteProduct,
        addSale,
        updateSale,
        deleteSale,
        addExpense,
        updateExpense,
        deleteExpense,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getBalance,
        getTotalSales,
        getTotalExpenses,
        getPendingSales,
        getLowStockProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
