import React from 'react';
import { X, Calendar, User, Package, DollarSign, Edit } from 'lucide-react';
import type { Coleta, Material } from '../data/coletas';
import type { Catador } from '../data/catadores';

interface ColetaDetailsModalProps {
  coleta: Coleta;
  catadores: Catador[];
  materiais: Material[];
  onClose: () => void;
  onEdit: () => void;
}

export const ColetaDetailsModal: React.FC<ColetaDetailsModalProps> = ({ coleta, catadores, materiais, onClose, onEdit }) => {
  const getCatadorName = (id: string) => {
    return catadores.find(c => c.id === id)?.nome || 'Catador Desconhecido';
  };

  const getMaterialName = (id: string) => {
    return materiais.find(m => m.id === id)?.nome || 'Material Desconhecido';
  };

  const getMaterialUnidade = (id: string) => {
    return materiais.find(m => m.id === id)?.unidade || 'kg';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const totalPeso = coleta.itens.reduce((acc, item) => acc + item.peso, 0);

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Detalhes da Coleta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg flex gap-3">
              <div className="text-primary-600 mt-0.5"><User size={20} /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Catador</p>
                <p className="font-semibold text-gray-900">{getCatadorName(coleta.catadorId)}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex gap-3">
              <div className="text-primary-600 mt-0.5"><Calendar size={20} /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Data / Hora</p>
                <p className="font-semibold text-gray-900">{formatDate(coleta.dataColeta)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg flex gap-3">
              <div className="text-primary-600 mt-0.5"><Package size={20} /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Peso Total</p>
                <p className="font-semibold text-gray-900">{totalPeso} kg</p>
              </div>
            </div>
            <div className="bg-primary-50 p-4 rounded-lg flex gap-3 border border-primary-100">
              <div className="text-primary-600 mt-0.5"><DollarSign size={20} /></div>
              <div>
                <p className="text-sm text-primary-600 font-medium">Valor Total</p>
                <p className="font-bold text-primary-800 text-lg">{formatCurrency(coleta.valorTotal)}</p>
              </div>
            </div>
          </div>

          {/* Lista de Itens */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">Itens Relacionados</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {coleta.itens.map((item, index) => (
                <div key={`${item.materialId}-${index}`} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{getMaterialName(item.materialId)}</p>
                    <p className="text-sm text-gray-500">{item.peso} {getMaterialUnidade(item.materialId)}</p>
                  </div>
                  <div className="font-semibold text-gray-700">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={onEdit}
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Edit size={16} />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};
