import React, { useState, useEffect } from 'react';
import type { Material } from '../data/coletas';
import { X } from 'lucide-react';

interface MaterialFormProps {
  material?: Material | null;
  onSubmit: (data: Partial<Material>) => void;
  onCancel: () => void;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({ material, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Material>>(
    material || { nome: '', precoPorKg: 0, unidade: 'kg' }
  );

  useEffect(() => {
    if (material) {
      setFormData(material);
    } else {
      setFormData({ nome: '', precoPorKg: 0, unidade: 'kg' });
    }
  }, [material]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'precoPorKg' ? Number(value) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {material ? 'Editar Material' : 'Novo Material'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Material</label>
            <input
              type="text"
              name="nome"
              value={formData.nome || ''}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              placeholder="Ex: Papelão"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço por Kg (R$)</label>
              <input
                type="number"
                name="precoPorKg"
                min="0.01"
                step="0.01"
                value={formData.precoPorKg || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                name="unidade"
                value={formData.unidade || 'kg'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
              >
                <option value="kg">kg</option>
                <option value="un">un (unidade)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition cursor-pointer"
            >
              {material ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
