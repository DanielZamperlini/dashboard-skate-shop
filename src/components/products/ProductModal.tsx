import React from 'react';
import { Product } from '../../types';
import ProductForm from './ProductForm';
import Modal from '../ui/Modal';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Partial<Product>;
  onSubmit: (product: Omit<Product, 'id'>) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct?.id ? 'Editar Produto' : 'Novo Produto'}
      size="lg"
    >
      <ProductForm
        initialProduct={initialProduct}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default ProductModal;
