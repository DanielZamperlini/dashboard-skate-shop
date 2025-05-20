import React from 'react';
import { Sale } from '../../types';
import Button from '../ui/Button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface SaleDetailsProps {
  sale: Sale;
  onClose: () => void;
  onEdit: (sale: Sale) => void;
}

const SaleDetails: React.FC<SaleDetailsProps> = ({ sale, onClose, onEdit }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {sale.isCreditOnly ? 'Venda Fiada' : 'Detalhes da Venda'}
          </h2>
          <p className="text-sm text-gray-500">Cliente: {sale.customerName}</p>
          <p className="text-sm text-gray-500">
            Data: {new Date(sale.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-gray-900">
            Total: {formatCurrency(sale.total)}
          </p>
          <div className="flex items-center mt-1">
            {sale.paid ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Pago
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <AlertCircle className="w-4 h-4 mr-1" />
                Pendente
              </span>
            )}
          </div>
        </div>
      </div>

      {sale.isCreditOnly ? (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Valor do Fiado
          </h3>
          <p className="text-lg font-medium text-gray-900">
            {formatCurrency(sale.total)}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Itens da Venda
          </h3>
          <div className="space-y-2">
            {sale.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}

            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>
                  {formatCurrency(
                    sale.items.reduce((sum, item) => sum + item.subtotal, 0),
                  )}
                </span>
              </div>
              {sale.discount && sale.discount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Desconto:</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-medium mt-2">
                <span>Total:</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!sale.paid && sale.remainingAmount > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-700 mb-2">
            Valor Pendente
          </h3>
          <p className="text-lg font-medium text-yellow-900">
            {formatCurrency(sale.remainingAmount)}
          </p>
        </div>
      )}

      {sale.partialPayment && sale.partialPayment.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Pagamentos Parciais
          </h3>
          <div className="space-y-2">
            {sale.partialPayment.map((payment, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {new Date(payment.date).toLocaleDateString()} -{' '}
                  {payment.method}
                </span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="primary" onClick={() => onEdit(sale)}>
          Editar
        </Button>
      </div>
    </div>
  );
};

export default SaleDetails;
