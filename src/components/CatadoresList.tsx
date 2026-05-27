import React from 'react';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { Catador } from '../data/catadores';

interface CatadoresListProps {
  catadores: Catador[];
  onEdit: (catador: Catador) => void;
  onDelete: (id: string) => void;
}

export const CatadoresList: React.FC<CatadoresListProps> = ({ catadores, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600 font-medium whitespace-nowrap">
              <th className="p-4">Nome</th>
              <th className="p-4">CPF</th>
              <th className="p-4">Telefone</th>
              <th className="p-4">Data Cadastro</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {catadores.map((catador) => (
              <tr key={catador.id} className="hover:bg-gray-50 transition-colors whitespace-nowrap">
                <td className="p-4 font-medium text-gray-900">{catador.nome}</td>
                <td className="p-4 text-gray-600">{catador.cpf}</td>
                <td className="p-4 text-gray-600">{catador.telefone}</td>
                <td className="p-4 text-gray-600">
                  {new Date(catador.dataCadastro).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${catador.status === 'ativo' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'}`}
                  >
                    {catador.status === 'ativo' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {catador.status.charAt(0).toUpperCase() + catador.status.slice(1)}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => onEdit(catador)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(catador.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
