import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { Customer, Sale } from '../types';

const CustomerRepository = {
  async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const newCustomer = {
      id: uuidv4(),
      ...customer,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.add('customers', newCustomer);
    return newCustomer;
  },

  async update(customer: Customer): Promise<Customer> {
    const updatedCustomer = {
      ...customer,
      updatedAt: new Date(),
    };

    await db.put('customers', updatedCustomer);
    return updatedCustomer;
  },

  async delete(id: string): Promise<void> {
    await db.delete('customers', id);
  },

  async findById(id: string): Promise<Customer | null> {
    const customer = await db.get('customers', id);
    return customer || null;
  },

  async findAll(): Promise<Customer[]> {
    return db.getAll('customers');
  },

  async findByPhone(phone: string): Promise<Customer[]> {
    const index = db.transaction('customers').store.index('by-phone');
    return index.getAll(phone);
  },

  async getPendingSales(customerId: string): Promise<Sale[]> {
    const index = db.transaction('sales').store.index('by-customer');
    const sales = await index.getAll(customerId);
    return sales.filter((sale) => !sale.paid);
  },
};

export default CustomerRepository;
