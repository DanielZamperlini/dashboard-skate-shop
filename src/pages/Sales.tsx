import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import SaleList from '../components/sales/SaleList';
import SaleModal from '../components/sales/SaleModal.tsx';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { Sale } from '../types';

const Sales: React.FC = () => {
  const { state, addSale, updateSale, deleteSale } = useAppContext();
  const { sales } = state;
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const handleAddClick = () => {
    setEditingSale(null);
    setShowSaleForm(true);
  };

  const handleEditClick = (sale: Sale) => {
    setEditingSale(sale);
    setShowSaleForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      deleteSale(id);
    }
  };

  const handleFormCancel = () => {
    setShowSaleForm(false);
    setEditingSale(null);
  };

  const handleFormSubmit = (sale: Omit<Sale, 'id'>) => {
    if (editingSale) {
      updateSale({ ...sale, id: editingSale.id });
    } else {
      addSale(sale);
    }
    setShowSaleForm(false);
    setEditingSale(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendas</h1>
        <Button onClick={handleAddClick}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Venda
        </Button>
      </div>

      <SaleList
        sales={sales}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Add/Edit Sale Modal */}
      {showSaleForm && (
        <SaleModal
          isOpen={showSaleForm}
          onClose={handleFormCancel}
          initialSale={editingSale || {}}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default Sales;
