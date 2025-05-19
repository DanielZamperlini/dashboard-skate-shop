import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { Product } from '../types';

export class ProductRepository {
  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct = {
      id: uuidv4(),
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.add('products', newProduct);
    return newProduct;
  }

  async update(product: Product): Promise<Product> {
    const updatedProduct = {
      ...product,
      updatedAt: new Date(),
    };

    await db.put('products', updatedProduct);
    return updatedProduct;
  }

  async delete(id: string): Promise<void> {
    await db.delete('products', id);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await db.get('products', id);
    return product || null;
  }

  async findAll(): Promise<Product[]> {
    return db.getAll('products');
  }

  async findByCategory(category: string): Promise<Product[]> {
    const index = db.transaction('products').store.index('by-category');
    return index.getAll(category);
  }

  async findLowStock(threshold: number = 5): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter((product) => product.quantity <= threshold);
  }
}

export default new ProductRepository();
