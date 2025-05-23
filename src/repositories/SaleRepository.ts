import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { Sale } from '../types';

export class SaleRepository {
  async create(sale: Omit<Sale, 'id'>): Promise<Sale> {
    const newSale = {
      id: uuidv4(),
      ...sale,
      createdAt: new Date(),
      discount: sale.discount || 0,
    };

    await db.add('sales', newSale);
    return newSale;
  }

  async update(sale: Sale): Promise<Sale> {
    const updatedSale = {
      ...sale,
      discount: sale.discount || 0,
    };
    await db.put('sales', updatedSale);
    return updatedSale;
  }

  async delete(id: string): Promise<void> {
    await db.delete('sales', id);
  }

  async findById(id: string): Promise<Sale | null> {
    const sale: Sale | undefined = await db.get('sales', id);
    return sale || null;
  }

  async findAll(): Promise<Sale[]> {
    return db.getAll('sales');
  }

  async findPending(): Promise<Sale[]> {
    const allSales = await this.findAll();
    return allSales.filter(
      (sale) =>
        !sale.paid || (sale.remainingAmount && sale.remainingAmount > 0),
    );
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    const index = db.transaction('sales').store.index('by-date');
    return index.getAll(IDBKeyRange.bound(startDate, endDate));
  }

  async findByCustomerId(customerId: string): Promise<Sale[]> {
    const allSales = await this.findAll();
    return allSales.filter((sale) => sale.customerId === customerId);
  }
}

export default new SaleRepository();
