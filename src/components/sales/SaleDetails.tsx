import React from 'react';
import { Sale } from '../../types';
import Button from '../ui/Button';
import { CheckCircle, AlertCircle, Calendar, CreditCard, FileText } from 'lucide-react';

interface SaleDetailsProps {
  sale: Sale;
  onClose: () => void;
  onEdit: (sale: Sale) => void;
}

const SaleDetails: React.FC<SaleDetailsProps> = ({ sale, onClose, onEdit }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Detalhes da Venda</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(sale)}>
            Editar
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Cliente</h3>
            <p className="text-lg font-medium">{sale.customerName}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <div className="flex items-center">
              {sale.paid ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="font-medium">Pago</span>
                  {sale.paymentMethod && (
                    <span className="ml-2 text-gray-500">via {sale.paymentMethod}</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <AlertCircle className="h-5 w-5 mr-1" />
                  <span className="font-medium">Pagamento Pendente</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> Data da Venda
            </h3>
            <p className="text-gray-700">{formatDate(sale.createdAt)}</p>
          </div>
          
          {sale.paid && sale.paymentDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                <CreditCard className="h-4 w-4 mr-1" /> Data do Pagamento
              </h3>
              <p className="text-gray-700">{formatDate(sale.paymentDate)}</p>
            </div>
          )}
        </div>

        {sale.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
              <FileText className="h-4 w-4 mr-1" /> Observações
            </h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{sale.notes}</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium mb-3">Itens</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Unitário
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sale.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    Total
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-base font-bold text-gray-900 text-right">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;