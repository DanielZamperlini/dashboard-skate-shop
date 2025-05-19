import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import SaleList from '../components/sales/SaleList';
import SaleForm from '../components/sales/SaleForm';
import SaleDetails from '../components/sales/SaleDetails';
import Button from '../components/ui/Button';
import { Plus, AlertCircle } from 'lucide-react';
import { Sale } from '../types';

const Sales: React.FC = () => {
  const { state, addSale, updateSale, deleteSale } = useAppContext();
  const { sales } = state;

  const [showSaleForm, setShowSaleForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const handleAddSale = (sale: Omit<Sale, 'id'>) => {
    addSale(sale);
    setShowSaleForm(false);
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setViewingSale(null);
    setShowSaleForm(true);
  };

  const handleUpdateSale = (sale: Sale) => {
    updateSale(sale);
    setEditingSale(null);
    setShowSaleForm(false);
  };

  const handleDeleteSale = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      deleteSale(id);
      if (viewingSale?.id === id) {
        setViewingSale(null);
      }
    }
  };

  const handleViewSale = (sale: Sale) => {
    setViewingSale(sale);
    setEditingSale(null);
    setShowSaleForm(false);
  };

  const handleFormSubmit = (sale: any) => {
    if (editingSale) {
      handleUpdateSale({ ...sale, id: editingSale.id });
    } else {
      handleAddSale(sale);
    }
  };

  const handleFormCancel = () => {
    setEditingSale(null);
    setShowSaleForm(false);
  };

  const pendingSales = sales.filter((sale) => !sale.paid);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
        <div className="flex space-x-2">
          <Button
            variant={showPendingOnly ? 'primary' : 'outline'}
            onClick={() => setShowPendingOnly(!showPendingOnly)}
            icon={<AlertCircle size={20} />}
            className="mr-2"
          >
            {showPendingOnly ? 'Mostrando Pendentes' : 'Mostrar Pendentes'}
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowSaleForm(true)}
            icon={<Plus size={20} />}
          >
            Nova Venda
          </Button>
        </div>
      </div>

      {pendingSales.length > 0 && !showPendingOnly && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Pagamentos Pendentes
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Você tem {pendingSales.length} venda(s) com pagamentos
                  pendentes.{' '}
                  <button
                    onClick={() => setShowPendingOnly(true)}
                    className="font-medium underline"
                  >
                    Ver vendas pendentes
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <SaleList
        sales={sales}
        onView={handleViewSale}
        onEdit={handleEditSale}
        onDelete={handleDeleteSale}
        showPendingOnly={showPendingOnly}
      />

      {/* Modal Nova Venda */}
      {showSaleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">
                {editingSale ? 'Editar Venda' : 'Nova Venda'}
              </h2>
            </div>
            <div className="p-6">
              <SaleForm
                initialSale={editingSale || {}}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Venda */}
      {viewingSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <SaleDetails
              sale={viewingSale}
              onClose={() => setViewingSale(null)}
              onEdit={handleEditSale}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
