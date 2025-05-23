import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import StatCard from '../components/ui/StatCard';
import {
  AreaChart,
  BarChart2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import ExpenseModal from '../components/expenses/ExpenseModal';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Expense } from '../types';

const Dashboard: React.FC = () => {
  const { state, getTotalExpenses, addExpense, updateExpense, deleteExpense } =
    useAppContext();

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalExpenses = getTotalExpenses();
  const totalSales = state.sales.reduce((sum, sale) => sum + sale.total, 0);
  const paidSales = state.sales.reduce((sum, sale) => {
    if (sale.paid) {
      return sum + sale.total;
    }
    return sum + (sale.total - sale.remainingAmount);
  }, 0);
  const pendingAmount = state.sales.reduce((sum, sale) => {
    return sum + (sale.remainingAmount || 0);
  }, 0);

  // Calcula o saldo real (vendas pagas - despesas)
  const realBalance = paidSales - totalExpenses;

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      updateExpense({ ...expense, id: editingExpense.id });
    } else {
      addExpense(expense);
    }
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      deleteExpense(id);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  const lowStockProducts = state.products.filter(
    (product) => product.quantity <= (product.minStock || 5),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Painel de Controle</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingExpense(null);
            setShowExpenseForm(true);
          }}
        >
          Registrar Despesa
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo"
          value={formatCurrency(realBalance)}
          icon={<DollarSign size={24} />}
          className={
            realBalance >= 0
              ? 'border-l-4 border-green-500'
              : 'border-l-4 border-red-500'
          }
        />
        <StatCard
          title="Vendas Totais"
          value={formatCurrency(totalSales)}
          icon={<TrendingUp size={24} />}
          className="border-l-4 border-blue-500"
        />
        <StatCard
          title="Despesas Totais"
          value={formatCurrency(totalExpenses)}
          icon={<TrendingDown size={24} />}
          className="border-l-4 border-red-500"
        />
        <StatCard
          title="Pagamentos Pendentes"
          value={formatCurrency(pendingAmount)}
          icon={<AreaChart size={24} />}
          className="border-l-4 border-yellow-500"
        />
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Alerta de Estoque Baixo
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {lowStockProducts.length} produto(s) precisam ser
                  reabastecidos.{' '}
                  <Link to="/inventory" className="font-medium underline">
                    Ver estoque
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent sales */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Vendas Recentes</h2>
            <Link
              to="/sales"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver Todas
            </Link>
          </div>

          {state.sales.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Package className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>Nenhuma venda registrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cliente
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.sales
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .slice(0, 5)
                    .map((sale) => (
                      <tr key={sale.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sale.customerName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(sale.total)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expenses section */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Despesas</h2>
            <button
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={() => setShowAllExpenses(!showAllExpenses)}
            >
              {showAllExpenses ? 'Mostrar Recentes' : 'Ver Todas'}
            </button>
          </div>

          {state.expenses.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>Nenhuma despesa registrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Descrição
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Valor
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.expenses
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .slice(0, showAllExpenses ? undefined : 5)
                    .map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            {expense.category}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-red-600 text-right">
                          -{formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showExpenseForm && (
        <ExpenseModal
          isOpen={showExpenseForm}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          initialExpense={editingExpense || {}}
          onSubmit={handleAddExpense}
        />
      )}
    </div>
  );
};

export default Dashboard;
