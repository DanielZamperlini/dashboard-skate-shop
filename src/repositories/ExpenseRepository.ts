import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { Expense } from '../types';

export class ExpenseRepository {
  async create(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const newExpense = {
      id: uuidv4(),
      ...expense,
      createdAt: new Date(),
    };

    await db.add('expenses', newExpense);
    return newExpense;
  }

  async update(expense: Expense): Promise<Expense> {
    await db.put('expenses', expense);
    return expense;
  }

  async delete(id: string): Promise<void> {
    await db.delete('expenses', id);
  }

  async findById(id: string): Promise<Expense | null> {
    const expense = await db.get('expenses', id);
    return expense || null;
  }

  async findAll(): Promise<Expense[]> {
    return db.getAll('expenses');
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    const index = db.transaction('expenses').store.index('by-date');
    return index.getAll(IDBKeyRange.bound(startDate, endDate));
  }

  async findByCategory(category: string): Promise<Expense[]> {
    const index = db.transaction('expenses').store.index('by-category');
    return index.getAll(category);
  }
}

export default new ExpenseRepository();
