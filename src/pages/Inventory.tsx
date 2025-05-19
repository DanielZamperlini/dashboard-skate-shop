import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductList from '../components/products/ProductList';
import ProductModal from '../components/products/ProductModal';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const { state, addProduct, updateProduct, deleteProduct } = useAppContext();
  const { products } = state;
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddClick = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const handleFormCancel = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = (product: Omit<Product, 'id'>) => {
    if (editingProduct) {
      updateProduct({ ...product, id: editingProduct.id });
    } else {
      addProduct(product);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventário</h1>
        <Button onClick={handleAddClick}>
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <ProductList
        products={products}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Add/Edit Product Modal */}
      {showProductForm && (
        <ProductModal
          isOpen={showProductForm}
          onClose={handleFormCancel}
          initialProduct={editingProduct || {}}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default Inventory;
