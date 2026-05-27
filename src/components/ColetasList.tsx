import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import type { Coleta } from '../data/coletas';
import type { Catador } from '../data/catadores';

interface ColetasListProps {
  coletas: Coleta[];
  catadores: Catador[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ColetasList: React.FC<ColetasListProps> = ({ coletas, catadores, onView, onDelete }) => {
  const getCatadorName = (id: string) => {
    return catadores.find(c => c.id === id)?.nome || 'Catador Desconhecido';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600 font-medium whitespace-nowrap">
              <th className="p-4">Data/Hora</th>
              <th className="p-4">Catador</th>
              <th className="p-4 text-center">Qtd. Itens</th>
              <th className="p-4 text-right">Valor Total Estimado</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coletas.map((coleta) => {
              const totalPeso = coleta.itens.reduce((acc, item) => acc + item.peso, 0);

              return (
                <tr key={coleta.id} className="hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <td className="p-4 text-gray-900">{formatDate(coleta.dataColeta)}</td>
                  <td className="p-4 font-medium text-gray-900">{getCatadorName(coleta.catadorId)}</td>
                  <td className="p-4 text-center text-gray-600">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-md text-sm font-medium">
                      {totalPeso} kg
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold text-primary-700">
                    {formatCurrency(coleta.valorTotal)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onView(coleta.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(coleta.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                        title="Excluir Registro"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {coletas.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Nenhuma coleta registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
