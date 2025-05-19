import { v4 as uuidv4 } from 'uuid';
import {
  loadProducts,
  loadSales,
  loadExpenses,
} from '../services/storageService';
import ProductRepository from '../repositories/ProductRepository';
import SaleRepository from '../repositories/SaleRepository';
import ExpenseRepository from '../repositories/ExpenseRepository';

export async function migrateFromLocalStorage() {
  try {
    // Migrar produtos
    const products = loadProducts();
    for (const product of products) {
      const newProduct = { ...product, id: product.id || uuidv4() };
      ProductRepository.create(newProduct);
    }
    console.log(`✓ ${products.length} produtos migrados`);

    // Migrar vendas
    const sales = loadSales();
    for (const sale of sales) {
      const newSale = { ...sale, id: sale.id || uuidv4() };
      SaleRepository.create(newSale);
    }
    console.log(`✓ ${sales.length} vendas migradas`);

    // Migrar despesas
    const expenses = loadExpenses();
    for (const expense of expenses) {
      const newExpense = { ...expense, id: expense.id || uuidv4() };
      ExpenseRepository.create(newExpense);
    }
    console.log(`✓ ${expenses.length} despesas migradas`);

    return {
      success: true,
      products: products.length,
      sales: sales.length,
      expenses: expenses.length,
    };
  } catch (error) {
    console.error('Erro durante a migração:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Erro desconhecido durante a migração',
    };
  }
}
