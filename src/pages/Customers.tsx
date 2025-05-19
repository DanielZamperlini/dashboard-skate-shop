import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Customer } from '../types';
import { Phone, User, Calendar, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Button from '../components/ui/Button';

const Customers: React.FC = () => {
  const { state, addCustomer, updateCustomer, deleteCustomer } =
    useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [showingCustomerDetails, setShowingCustomerDetails] = useState<
    string | null
  >(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
      // Mobile number: (XX) XXXXX-XXXX
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
        7,
      )}`;
    } else if (cleaned.length === 10) {
      // Landline: (XX) XXXX-XXXX
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
        6,
      )}`;
    } else if (cleaned.length === 8) {
      // Local number without area code: XXXX-XXXX
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else if (cleaned.length === 9) {
      // Mobile number without area code: XXXXX-XXXX
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }

    return cleaned; // Return cleaned number if it doesn't match any format
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      notes: formData.get('notes') as string,
    };

    if (selectedCustomer) {
      await updateCustomer({
        id: selectedCustomer.id,
        ...customerData,
        updatedAt: new Date(),
      } as Customer);
    } else {
      const newCustomer: Omit<Customer, 'id'> = {
        ...customerData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addCustomer(newCustomer);
    }

    setShowForm(false);
    setSelectedCustomer(null);
  };

  const handleDelete = async (customer: Customer) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o cliente ${customer.name}?`,
      )
    ) {
      await deleteCustomer(customer.id);
      setShowingCustomerDetails(null);
    }
  };

  const filteredCustomers = state.customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  );

  const getPendingAmount = (customerId: string) => {
    return state.sales
      .filter((sale) => sale.customerId === customerId && !sale.paid)
      .reduce((total, sale) => total + (sale.remainingAmount || sale.total), 0);
  };

  const getCustomerSales = (customerId: string) => {
    return state.sales.filter((sale) => sale.customerId === customerId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedCustomer(null);
            setShowForm(true);
          }}
          icon={<Plus size={20} />}
        >
          Novo Cliente
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Telefone
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Valor Pendente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cadastrado em
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
              {filteredCustomers.map((customer) => (
                <React.Fragment key={customer.id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          {customer.notes && (
                            <div className="text-sm text-gray-500">
                              {customer.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-1 text-gray-500" />
                        {formatPhone(customer.phone)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPendingAmount(customer.id) > 0 ? (
                        <div className="text-sm font-medium text-red-600">
                          {formatCurrency(getPendingAmount(customer.id))}
                        </div>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Sem débitos
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(customer.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => setShowingCustomerDetails(customer.id)}
                        className="mr-2"
                      >
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit className="h-4 w-4" />}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowForm(true);
                        }}
                        className="mr-2"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => handleDelete(customer)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                  {showingCustomerDetails === customer.id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">
                              Histórico de Compras
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowingCustomerDetails(null)}
                            >
                              Fechar
                            </Button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-white">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                  >
                                    Data
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                  >
                                    Itens
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                                  >
                                    Valor
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                                  >
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {getCustomerSales(customer.id)
                                  .sort(
                                    (a, b) =>
                                      new Date(b.createdAt).getTime() -
                                      new Date(a.createdAt).getTime(),
                                  )
                                  .map((sale) => (
                                    <tr key={sale.id}>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(sale.createdAt)}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        <ul>
                                          {sale.items.map((item, index) => (
                                            <li key={index}>
                                              {item.quantity}x{' '}
                                              {item.productName}
                                            </li>
                                          ))}
                                        </ul>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                                        {formatCurrency(sale.total)}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                        {sale.paid ? (
                                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Pago
                                          </span>
                                        ) : (
                                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            Pendente
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">
                {selectedCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nome*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={selectedCustomer?.name}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Telefone*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    defaultValue={selectedCustomer?.phone}
                    placeholder="(00) 00000-0000"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
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
                    defaultValue={selectedCustomer?.notes}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedCustomer(null);
                  }}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  {selectedCustomer ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
