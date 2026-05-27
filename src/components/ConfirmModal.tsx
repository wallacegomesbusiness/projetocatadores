import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, onConfirm, onCancel, 
  confirmText = "Confirmar", cancelText = "Cancelar", type = "danger" 
}) => {
  if (!isOpen) return null;

  const getStyles = () => {
    switch (type) {
      case 'info': return { icon: <AlertTriangle size={20} />, color: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 text-white' };
      case 'success': return { icon: <AlertTriangle size={20} />, color: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700 text-white' };
      case 'danger': default: return { icon: <AlertTriangle size={20} />, color: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700 text-white' };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className={`flex items-center gap-2 ${styles.color}`}>
            {styles.icon}
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 text-sm">{message}</p>
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition cursor-pointer ${styles.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
