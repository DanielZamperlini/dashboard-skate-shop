import React, { useState, useEffect } from 'react';
import { Sale, SaleItem } from '../../types';
import { formatCurrency } from '../../utils/format';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { X, Plus } from 'lucide-react';

interface SaleFormProps {
  initialSale?: Partial<Sale>;
  onSubmit: (sale: Omit<Sale, 'id'>) => void;
  onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({
  initialSale = {},
  onSubmit,
  onCancel,
}) => {
  const { state } = useAppContext();
  const { products, customers } = state;

  const [sale, setSale] = useState<Partial<Sale>>({
    customerName: '',
    customerId: '',
    items: [],
    total: 0,
    paid: false,
    paymentMethod: '',
    notes: '',
    partialPayment: [],
    remainingAmount: 0,
    isCreditOnly: false,
    discount: 0,
    ...initialSale,
  });

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditAmountInput, setCreditAmountInput] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>('0,00');

  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState<number>(0);

  useEffect(() => {
    const subtotal = (sale.items || []).reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    const discount = sale.discount || 0;
    const total = Math.max(0, subtotal - discount);
    setSale((prev) => ({ ...prev, total }));
  }, [sale.items, sale.discount]);

  useEffect(() => {
    if (initialSale.isCreditOnly) {
      setCreditAmountInput(
        initialSale.total?.toFixed(2).replace('.', ',') || '',
      );
    }
  }, [initialSale]);

  const handleCreditAmountFocus = () => {
    setCreditAmountInput('');
  };

  const handleCreditAmountBlur = () => {
    if (!creditAmountInput) {
      setCreditAmountInput('0,00');
      setCreditAmount(0);
      return;
    }

    let value = creditAmountInput;
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

    setCreditAmountInput(value);
    const numericValue = parseFloat(value.replace(',', '.')) || 0;
    setCreditAmount(numericValue);
  };

  const handleCreditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d,]/g, '');

    const commaCount = value.split(',').length - 1;
    if (commaCount > 1) {
      value = value.replace(/,+$/, '');
    }

    setCreditAmountInput(value);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === 'customerId') {
      const selectedCustomer = customers.find((c) => c.id === value);
      setSale((prev) => ({
        ...prev,
        customerId: value,
        customerName: selectedCustomer?.name || '',
      }));
    } else {
      setSale((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addItem = () => {
    if (!selectedProductId || quantity <= 0) {
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (quantity > product.quantity) {
      setErrors({
        quantity: `Apenas ${product.quantity} unidades disponíveis em estoque`,
      });
      return;
    }

    const existingItemIndex = (sale.items || []).findIndex(
      (item) => item.productId === selectedProductId,
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...(sale.items || [])];
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.quantity) {
        setErrors({
          quantity: `Limite excedido. Apenas ${
            product.quantity - existingItem.quantity
          } unidades disponíveis`,
        });
        return;
      }

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        subtotal: product.price * newQuantity,
      };

      setSale((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
      };

      setSale((prev) => ({
        ...prev,
        items: [...(prev.items || []), newItem],
      }));
    }

    setSelectedProductId('');
    setQuantity(1);
    setErrors({});
  };

  const removeItem = (index: number) => {
    const updatedItems = [...(sale.items || [])];
    updatedItems.splice(index, 1);
    setSale((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!sale.customerId?.trim()) {
      newErrors.customerId = 'Selecione um cliente';
    }

    if (!sale.isCreditOnly && !sale.items?.length) {
      newErrors.items = 'Adicione pelo menos um item à venda';
    }

    if (sale.isCreditOnly && (!creditAmount || creditAmount <= 0)) {
      newErrors.creditAmount = 'Informe o valor do fiado';
    }

    if (sale.paid && !sale.paymentMethod?.trim()) {
      newErrors.paymentMethod = 'Selecione a forma de pagamento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const finalSale: Omit<Sale, 'id'> = {
      customerId: sale.customerId || '',
      customerName: sale.customerName || '',
      items: sale.isCreditOnly ? [] : sale.items || [],
      total: sale.isCreditOnly ? creditAmount : sale.total || 0,
      paid: paymentType === 'full',
      paymentMethod: sale.paymentMethod || '',
      notes: sale.notes || '',
      createdAt: initialSale.createdAt || new Date(),
      paymentDate: sale.paid ? new Date() : undefined,
      partialPayment: sale.partialPayment || [],
      remainingAmount:
        paymentType === 'full'
          ? 0
          : sale.remainingAmount ||
            (sale.isCreditOnly ? creditAmount : sale.total || 0),
      isCreditOnly: sale.isCreditOnly,
    };

    onSubmit(finalSale);
  };

  const handleCreditOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isCreditOnly = e.target.checked;
    setSale((prev) => ({
      ...prev,
      isCreditOnly,
      items: isCreditOnly ? [] : prev.items,
      total: isCreditOnly ? creditAmount : prev.total,
    }));
  };

  const availableProducts = products.filter((p) => p.quantity > 0);

  const handlePaymentTypeChange = (type: 'full' | 'partial') => {
    setPaymentType(type);
    if (type === 'full') {
      setSale((prev) => ({
        ...prev,
        paid: true,
        remainingAmount: 0,
        partialPayment: [],
        paymentDate: new Date(),
      }));
    } else {
      setSale((prev) => ({
        ...prev,
        paid: false,
        remainingAmount: prev.total || 0,
        partialPayment: [],
        paymentDate: undefined,
      }));
    }
  };

  const handlePartialPayment = () => {
    if (!partialAmount || partialAmount <= 0 || !sale.paymentMethod) return;

    const newPayment = {
      amount: partialAmount,
      date: new Date(),
      method: sale.paymentMethod,
    };

    const remaining = (sale.remainingAmount || sale.total || 0) - partialAmount;
    const isFullyPaid = remaining <= 0;

    setSale((prev) => ({
      ...prev,
      partialPayment: [...(prev.partialPayment || []), newPayment],
      remainingAmount: Math.max(0, remaining),
      paid: isFullyPaid,
      paymentDate: isFullyPaid ? new Date() : undefined,
    }));

    setPartialAmount(0);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d,]/g, '');

    const commaCount = value.split(',').length - 1;
    if (commaCount > 1) {
      value = value.replace(/,+$/, '');
    }

    setDiscountInput(value);
  };

  const handleDiscountBlur = () => {
    if (!discountInput) {
      setDiscountInput('0,00');
      setSale((prev) => ({ ...prev, discount: 0 }));
      return;
    }

    let value = discountInput;
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

    setDiscountInput(value);
    const numericValue = parseFloat(value.replace(',', '.')) || 0;
    setSale((prev) => ({ ...prev, discount: numericValue }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="customerId"
          className="block text-sm font-medium text-gray-700"
        >
          Cliente*
        </label>
        <select
          id="customerId"
          name="customerId"
          value={sale.customerId || ''}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.customerId ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
        >
          <option value="">Selecione um cliente</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} - {customer.phone}
            </option>
          ))}
        </select>
        {errors.customerId && (
          <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
        )}
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          id="isCreditOnly"
          checked={sale.isCreditOnly}
          onChange={handleCreditOnlyChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="isCreditOnly"
          className="text-sm font-medium text-gray-700"
        >
          Venda Fiada (Sem Produto)
        </label>
      </div>

      {sale.isCreditOnly ? (
        <div>
          <label
            htmlFor="creditAmount"
            className="block text-sm font-medium text-gray-700"
          >
            Valor do Fiado*
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">R$</span>
            </div>
            <input
              type="text"
              id="creditAmount"
              value={creditAmountInput}
              onChange={handleCreditAmountChange}
              onFocus={handleCreditAmountFocus}
              onBlur={handleCreditAmountBlur}
              className={`block w-full pl-7 rounded-md border ${
                errors.creditAmount ? 'border-red-500' : 'border-gray-300'
              } p-2 focus:border-blue-500 focus:ring-blue-500`}
            />
          </div>
          {errors.creditAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.creditAmount}</p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Itens da Venda
          </h3>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <div className="flex-1">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um produto</option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.price)} (
                    {product.quantity} em estoque)
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-32">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setQuantity(isNaN(value) ? 1 : value);
                  if (errors.quantity) setErrors({});
                }}
                className={`block w-full rounded-md border ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>
            <div>
              <Button
                type="button"
                onClick={addItem}
                icon={<Plus size={16} />}
                disabled={!selectedProductId}
              >
                Adicionar
              </Button>
            </div>
          </div>

          {sale.items?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Produto
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Preço Unitário
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantidade
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Subtotal
                    </th>
                    <th scope="col" className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sale.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remover item"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={3}
                      className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right"
                    >
                      Total da Venda
                    </td>
                    <td
                      colSpan={2}
                      className="px-4 py-2 whitespace-nowrap text-base font-bold text-gray-900 text-right"
                    >
                      {formatCurrency(sale.total || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {errors.items ? (
                <p className="text-red-600">{errors.items}</p>
              ) : (
                <p>Nenhum item adicionado</p>
              )}
            </div>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Subtotal:
              </span>
              <span className="text-sm text-gray-900">
                {formatCurrency(
                  (sale.items || []).reduce(
                    (sum, item) => sum + item.subtotal,
                    0,
                  ),
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <label
                htmlFor="discount"
                className="text-sm font-medium text-gray-700"
              >
                Desconto:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  id="discount"
                  value={discountInput}
                  onChange={handleDiscountChange}
                  onBlur={handleDiscountBlur}
                  className="block w-32 rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 text-right"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-base font-medium text-gray-900">
                Total:
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(sale.total || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Pagamento
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="paymentType"
                value="full"
                checked={paymentType === 'full'}
                onChange={() => handlePaymentTypeChange('full')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                Pagamento Total
              </span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="paymentType"
                value="partial"
                checked={paymentType === 'partial'}
                onChange={() => handlePaymentTypeChange('partial')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                Pagamento Parcial
              </span>
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor="paymentMethod"
            className="block text-sm font-medium text-gray-700"
          >
            Forma de Pagamento*
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={sale.paymentMethod || ''}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
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
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
          )}
        </div>
      </div>

      {paymentType === 'partial' && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Pagamento Parcial
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="partialAmount"
                className="block text-sm font-medium text-gray-700"
              >
                Valor do Pagamento
              </label>
              <input
                type="number"
                id="partialAmount"
                value={partialAmount}
                onChange={(e) => setPartialAmount(Number(e.target.value))}
                min="0"
                max={sale.remainingAmount || sale.total || 0}
                step="0.01"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={handlePartialPayment}
                disabled={!partialAmount || !sale.paymentMethod}
              >
                Registrar Pagamento
              </Button>
            </div>
          </div>

          {sale.partialPayment && sale.partialPayment.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Pagamentos Realizados
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Data
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Método
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sale.partialPayment.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {payment.method}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Valor Total:
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(sale.total || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-gray-700">
                Valor Restante:
              </span>
              <span
                className={`text-lg font-bold ${
                  sale.remainingAmount ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {formatCurrency(sale.remainingAmount || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={sale.notes || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Informações adicionais sobre a venda"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {initialSale.id ? 'Atualizar Venda' : 'Finalizar Venda'}
        </Button>
      </div>
    </form>
  );
};

export default SaleForm;
