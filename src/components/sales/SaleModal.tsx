import React from 'react';
import Modal from '../ui/Modal';
import SaleForm from './SaleForm';
import { Sale } from '../../types';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSale: Partial<Sale>;
  onSubmit: (sale: Omit<Sale, 'id'>) => void;
}

const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  initialSale,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSale.id ? 'Editar Venda' : 'Nova Venda'}
      size="lg"
    >
      <SaleForm
        initialSale={initialSale}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default SaleModal;
