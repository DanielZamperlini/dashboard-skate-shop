import React, { useState } from 'react';
import { Expense } from '../../types';
import Button from '../ui/Button';

interface ExpenseFormProps {
  initialExpense?: Partial<Expense>;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

const categoryOptions = [
  'Reposição de Estoque',
  'Aluguel',
  'Contas (Água/Luz/Internet)',
  'Salários e Benefícios',
  'Marketing e Publicidade',
  'Manutenção de Equipamentos',
  'Frete e Entregas',
  'Materiais de Escritório',
  'Taxas e Impostos',
  'Viagens e Transportes',
  'Outros Gastos',
];

const paymentMethodOptions = [
  'Dinheiro',
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Transferência Bancária',
  'Boleto',
  'Outro',
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialExpense = {},
  onSubmit,
  onCancel,
}) => {
  const [expense, setExpense] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    category: 'Outros Gastos',
    paymentMethod: 'PIX',
    date: new Date(),
    notes: '',
    ...initialExpense,
  });

  const [amountInput, setAmountInput] = useState<string>(
    initialExpense.amount
      ? (initialExpense.amount / 100).toFixed(2).replace('.', ',')
      : '',
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d,]/g, '');

    const commaCount = value.split(',').length - 1;
    if (commaCount > 1) {
      value = value.replace(/,+$/, '');
    }

    setAmountInput(value);
  };

  const handleAmountFocus = () => {
    setAmountInput('');
  };

  const handleAmountBlur = () => {
    if (!amountInput) {
      setAmountInput('0,00');
      return;
    }

    let value = amountInput;

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

    setAmountInput(value);

    const numericValue = parseFloat(value.replace(',', '.')) || 0;
    setExpense((prev) => ({
      ...prev,
      amount: numericValue,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === 'amount') return;

    let parsedValue: string | Date = value;
    if (name === 'date') {
      parsedValue = new Date(value);
    }

    setExpense((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!expense.description?.trim()) {
      newErrors.description = 'Por favor, informe uma descrição para a despesa';
    } else if (expense.description.length < 5) {
      newErrors.description = 'A descrição deve ter pelo menos 5 caracteres';
    }

    if (!expense.amount || expense.amount <= 0) {
      newErrors.amount = 'O valor da despesa deve ser maior que zero';
    } else if (expense.amount > 1000000) {
      newErrors.amount = 'Valor muito alto. Verifique o valor digitado';
    }

    if (!expense.date) {
      newErrors.date = 'Por favor, informe a data da despesa';
    } else if (new Date(expense.date) > new Date()) {
      newErrors.date = 'A data não pode ser futura';
    }

    if (!expense.paymentMethod) {
      newErrors.paymentMethod = 'Selecione a forma de pagamento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      ...(expense as Omit<Expense, 'id'>),
      date: expense.date || new Date(),
    });
  };

  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descrição da Despesa*
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={expense.description || ''}
            onChange={handleChange}
            placeholder="Ex: Compra de lixas para estoque"
            className={`mt-1 block w-full rounded-md border ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Categoria*
          </label>
          <select
            id="category"
            name="category"
            value={expense.category || 'Outros Gastos'}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Valor (R$)*
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">R$</span>
            </div>
            <input
              type="text"
              id="amount"
              name="amount"
              value={amountInput}
              onChange={handleAmountChange}
              onFocus={handleAmountFocus}
              onBlur={handleAmountBlur}
              placeholder="0,00"
              className={`block w-full pl-7 rounded-md border ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              } p-2 focus:border-blue-500 focus:ring-blue-500`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Data*
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={expense.date ? formatDateForInput(expense.date) : ''}
            onChange={handleChange}
            max={formatDateForInput(new Date())}
            className={`mt-1 block w-full rounded-md border ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
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
            value={expense.paymentMethod || 'PIX'}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
          >
            {paymentMethodOptions.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Detalhes Adicionais
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={expense.notes || ''}
          onChange={handleChange}
          placeholder="Informações complementares sobre esta despesa"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {initialExpense.id ? 'Atualizar Despesa' : 'Registrar Despesa'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
