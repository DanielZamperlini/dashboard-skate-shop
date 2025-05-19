import React from 'react';
import { Expense } from '../../types';
import ExpenseForm from './ExpenseForm';
import Modal from '../ui/Modal';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExpense?: Partial<Expense>;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  initialExpense,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialExpense?.id ? 'Editar Despesa' : 'Nova Despesa'}
      size="lg"
    >
      <ExpenseForm
        initialExpense={initialExpense}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default ExpenseModal;
