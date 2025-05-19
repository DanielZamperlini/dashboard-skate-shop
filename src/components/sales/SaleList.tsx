import React, { useState } from 'react';
import { Sale } from '../../types';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import Button from '../ui/Button';

interface SaleListProps {
  sales: Sale[];
  onView: (sale: Sale) => void;
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
  showPendingOnly?: boolean;
}

const SaleList: React.FC<SaleListProps> = ({
  sales,
  onView,
  onEdit,
  onDelete,
  showPendingOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales
    .filter((sale) => {
      const matchesSearch =
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPending = showPendingOnly
        ? !sale.paid && (!sale.remainingAmount || sale.remainingAmount > 0)
        : true;

      return matchesSearch && matchesPending;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const getPaymentStatus = (sale: Sale) => {
    if (sale.paid) {
      return {
        text: 'Pago',
        color: 'text-green-600 bg-green-50',
      };
    }
    if (sale.partialPayment && sale.partialPayment.length > 0) {
      return {
        text: `Parcial (${formatCurrency(sale.remainingAmount || 0)} restante)`,
        color: 'text-yellow-600 bg-yellow-50',
      };
    }
    return {
      text: 'Pendente',
      color: 'text-red-600 bg-red-50',
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por cliente ou ID da venda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {filteredSales.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">
            {showPendingOnly
              ? 'Nenhuma venda pendente encontrada.'
              : 'Nenhuma venda encontrada.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID da Venda
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Data
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Itens
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => {
                const status = getPaymentStatus(sale);
                return (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sale.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.items.length}{' '}
                      {sale.items.length === 1 ? 'item' : 'itens'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => onView(sale)}
                        className="mr-2"
                      >
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit className="h-4 w-4" />}
                        onClick={() => onEdit(sale)}
                        className="mr-2"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => onDelete(sale.id)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SaleList;
