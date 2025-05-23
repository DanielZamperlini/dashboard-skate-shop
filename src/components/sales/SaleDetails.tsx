import React, { useState } from 'react';
import { Sale } from '../../types';
import Button from '../ui/Button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface SaleDetailsProps {
  sale: Sale;
  onClose: () => void;
  onEdit: (sale: Sale) => void;
  onUpdate: (sale: Sale) => void;
}

const SaleDetails: React.FC<SaleDetailsProps> = ({
  sale,
  onClose,
  onEdit,
  onUpdate,
}) => {
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [partialAmountInput, setPartialAmountInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const handlePartialAmountFocus = () => {
    setPartialAmountInput('');
  };

  const handlePartialAmountBlur = () => {
    if (!partialAmountInput) {
      setPartialAmountInput('0,00');
      setPartialAmount(0);
      return;
    }

    let value = partialAmountInput;
    value = value.replace(/[^\d,]/g, '');

    const commaCount = value.split(',').length - 1;
    if (commaCount > 1) {
      value = value.replace(/,+$/, '');
    }

    if (value.includes(',')) {
      const parts = value.split(',');
      const integerPart = parts[0].replace(/\D/g, '') || '0';
      const decimalPart = (parts[1] || '')
        .replace(/\D/g, '')
        .substring(0, 2)
        .padEnd(2, '0');
      value = `${integerPart},${decimalPart}`;
    } else {
      const numericValue = value.replace(/\D/g, '');
      value = `${numericValue || '0'},00`;
    }

    setPartialAmountInput(value);
    const numericValue = parseFloat(value.replace(',', '.')) || 0;
    setPartialAmount(numericValue);
  };

  const handlePartialAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let value = e.target.value;
    value = value.replace(/[^\d,]/g, '');

    const commaCount = value.split(',').length - 1;
    if (commaCount > 1) {
      value = value.replace(/,+$/, '');
    }

    setPartialAmountInput(value);
  };

  const handlePartialPayment = () => {
    if (!partialAmount || partialAmount <= 0 || !paymentMethod) return;

    const newPayment = {
      amount: partialAmount,
      date: new Date(),
      method: paymentMethod,
    };

    const remaining = sale.remainingAmount - partialAmount;
    const isFullyPaid = remaining <= 0;

    const updatedSale: Sale = {
      ...sale,
      partialPayment: [...(sale.partialPayment || []), newPayment],
      remainingAmount: Math.max(0, remaining),
      paid: isFullyPaid,
      paymentDate: isFullyPaid ? new Date() : undefined,
      paymentMethod: paymentMethod,
    };

    onUpdate(updatedSale);
    setPartialAmount(0);
    setPartialAmountInput('');
    setPaymentMethod('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {sale.isCreditOnly ? 'Venda Avulsa' : 'Detalhes da Venda'}
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
              <div className="flex justify-between text-sm text-red-600">
                <span>Desconto:</span>
                <span>-{formatCurrency(sale.discount || 0)}</span>
              </div>
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

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor do Pagamento
              </label>
              <input
                type="text"
                value={partialAmountInput}
                onChange={handlePartialAmountChange}
                onFocus={handlePartialAmountFocus}
                onBlur={handlePartialAmountBlur}
                min="0"
                max={sale.remainingAmount}
                step="0.01"
                className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="PIX">PIX</option>
                <option value="Transferência Bancária">
                  Transferência Bancária
                </option>
                <option value="Boleto">Boleto</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <Button
              onClick={handlePartialPayment}
              disabled={!partialAmount || !paymentMethod}
              className="w-full"
            >
              Registrar Pagamento
            </Button>
          </div>
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
