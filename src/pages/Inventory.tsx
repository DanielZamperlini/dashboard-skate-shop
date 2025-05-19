import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const { state, addProduct, updateProduct, deleteProduct } = useAppContext();
  const { products } = state;

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    addProduct(product);
    setShowProductForm(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleUpdateProduct = (product: Product) => {
    updateProduct(product);
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const handleFormSubmit = (product: any) => {
    if (editingProduct) {
      handleUpdateProduct({ ...product, id: editingProduct.id });
    } else {
      handleAddProduct(product);
    }
  };

  const handleFormCancel = () => {
    setEditingProduct(null);
    setShowProductForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
        <Button 
          variant="primary" 
          onClick={() => setShowProductForm(true)}
          icon={<Plus size={20} />}
        >
          Adicionar Produto
        </Button>
      </div>

      <ProductList
        products={products}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Add/Edit Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">
                {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h2>
            </div>
            <div className="p-6">
              <ProductForm
                initialProduct={editingProduct || {}}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;