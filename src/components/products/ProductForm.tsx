import React, { useState } from 'react';
import { Product, ProductCategory } from '../../types';
import Button from '../ui/Button';

interface ProductFormProps {
  initialProduct?: Partial<Product>;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}

const categoryOptions: ProductCategory[] = [
  'Shapes',
  'Trucks',
  'Rodas',
  'Rolamentos',
  'Lixas',
  'Parafusos',
  'Ferramentas',
  'Acessórios',
  'Roupas',
  'Tênis',
  'Outros',
];

const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct = {},
  onSubmit,
  onCancel,
}) => {
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    quantity: 0,
    category: 'Shapes',
    minStock: 5,
    imageUrl: '',
    ...initialProduct,
  });

  const [priceInput, setPriceInput] = useState<string>(
    initialProduct.price
      ? initialProduct.price.toFixed(2).replace('.', ',')
      : '',
  );

  const [costPriceInput, setCostPriceInput] = useState<string>(
    initialProduct.costPrice
      ? initialProduct.costPrice.toFixed(2).replace('.', ',')
      : '',
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'price' | 'costPrice',
  ) => {
    let value = e.target.value;
    value = value.replace(/[^\d,]/g, '');

    const commaCount = value.split(',').length - 1;
    if (commaCount > 1) {
      value = value.replace(/,+$/, '');
    }

    if (field === 'price') {
      setPriceInput(value);
    } else {
      setCostPriceInput(value);
    }
  };

  const handlePriceFocus = (field: 'price' | 'costPrice') => {
    if (field === 'price') {
      setPriceInput('');
    } else {
      setCostPriceInput('');
    }
  };

  const handlePriceBlur = (field: 'price' | 'costPrice') => {
    const input = field === 'price' ? priceInput : costPriceInput;

    if (!input) {
      if (field === 'price') {
        setPriceInput('0,00');
      } else {
        setCostPriceInput('0,00');
      }
      return;
    }

    let value = input;

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

    if (field === 'price') {
      setPriceInput(value);
    } else {
      setCostPriceInput(value);
    }

    const numericValue = parseFloat(value.replace(',', '.')) || 0;
    setProduct((prev) => ({
      ...prev,
      [field]: numericValue,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === 'price' || name === 'costPrice') {
      return;
    }

    let parsedValue: string | number = value;
    if (name === 'quantity' || name === 'minStock') {
      parsedValue = Number(value);
    }

    setProduct((prev) => ({
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

    if (!product.name?.trim()) {
      newErrors.name = 'Nome do produto é obrigatório';
    }

    if (!product.description?.trim()) {
      newErrors.description = 'Descrição do produto é obrigatória';
    }

    if (!product.price || product.price <= 0) {
      newErrors.price = 'O preço de venda deve ser maior que zero';
    } else if (product.costPrice && product.costPrice >= product.price) {
      newErrors.price = 'Preço de venda deve ser maior que o preço de custo';
    }

    if (!product.costPrice || product.costPrice < 0) {
      newErrors.costPrice = 'O preço de custo deve ser maior ou igual a zero';
    }

    if (product.quantity === undefined || product.quantity < 0) {
      newErrors.quantity = 'Quantidade em estoque não pode ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      ...(product as Omit<Product, 'id'>),
      createdAt: initialProduct.createdAt || new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nome do Produto*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name || ''}
            onChange={handleChange}
            placeholder="Ex: Shape Santa Cruz 8.25"
            className={`mt-1 block w-full rounded-md border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
            value={product.category || 'Shapes'}
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

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Descrição Detalhada*
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={product.description || ''}
          onChange={handleChange}
          placeholder="Ex: Shape de maple canadense, medidas 8.25 x 31.8, concavidade média"
          className={`mt-1 block w-full rounded-md border ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Preço de Venda*
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">R$</span>
            </div>
            <input
              type="text"
              id="price"
              name="price"
              value={priceInput}
              onChange={(e) => handlePriceChange(e, 'price')}
              onFocus={() => handlePriceFocus('price')}
              onBlur={() => handlePriceBlur('price')}
              placeholder="0,00"
              className={`block w-full pl-7 rounded-md border ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              } p-2 focus:border-blue-500 focus:ring-blue-500`}
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="costPrice"
            className="block text-sm font-medium text-gray-700"
          >
            Preço de Custo*
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">R$</span>
            </div>
            <input
              type="text"
              id="costPrice"
              name="costPrice"
              value={costPriceInput}
              onChange={(e) => handlePriceChange(e, 'costPrice')}
              onFocus={() => handlePriceFocus('costPrice')}
              onBlur={() => handlePriceBlur('costPrice')}
              placeholder="0,00"
              className={`block w-full pl-7 rounded-md border ${
                errors.costPrice ? 'border-red-500' : 'border-gray-300'
              } p-2 focus:border-blue-500 focus:ring-blue-500`}
            />
          </div>
          {errors.costPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700"
          >
            Quantidade em Estoque*
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="0"
            value={product.quantity || ''}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="minStock"
            className="block text-sm font-medium text-gray-700"
          >
            Estoque Mínimo (Alerta)
          </label>
          <input
            type="number"
            id="minStock"
            name="minStock"
            min="0"
            value={product.minStock || 5}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-700"
          >
            URL da Imagem (Link)
          </label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={product.imageUrl || ''}
            onChange={handleChange}
            placeholder="Cole o link da imagem aqui"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {initialProduct.id ? 'Atualizar Produto' : 'Cadastrar Produto'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
