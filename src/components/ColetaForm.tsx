import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import type { Coleta, ItemColeta, Material } from '../data/coletas';
import type { Catador } from '../data/catadores';

interface ColetaFormProps {
  initialData?: Coleta;
  onSubmit: (data: Omit<Coleta, 'id'>, id?: string) => void;
  onCancel: () => void;
}

export const ColetaForm: React.FC<ColetaFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [catadorId, setCatadorId] = useState(initialData?.catadorId || '');
  const [dataColeta, setDataColeta] = useState(initialData?.dataColeta?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [itens, setItens] = useState<ItemColeta[]>(
    initialData?.itens || [{ materialId: '', peso: 0, subtotal: 0 }]
  );

  const [materiais, setMateriais] = useState<Material[]>([]);
  const [catadores, setCatadores] = useState<Catador[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMateriais, resCatadores] = await Promise.all([
          api.get('/materiais'),
          api.get('/catadores')
        ]);
        setMateriais(resMateriais.data);
        setCatadores(resCatadores.data);
      } catch (err) {
        console.error('Erro ao carregar dados do formulário:', err);
        toast.error('Erro ao carregar as opções de materiais e catadores.');
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItens([...itens, { materialId: '', peso: 0, subtotal: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof ItemColeta, value: string | number) => {
    const newItens = [...itens];
    const item = { ...newItens[index], [field]: value };
    
    // Auto-calculate subtotal when material or weight changes
    if (field === 'materialId' || field === 'peso') {
      const material = materiais.find(m => m.id === (field === 'materialId' ? value : item.materialId));
      const pesoFormatado = Number(field === 'peso' ? value : item.peso) || 0;
      item.subtotal = material ? material.precoPorKg * pesoFormatado : 0;
    }
    
    newItens[index] = item;
    setItens(newItens as ItemColeta[]);
  };

  const valorTotal = useMemo(() => itens.reduce((acc, item) => acc + item.subtotal, 0), [itens]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catadorId || !dataColeta || itens.some(i => !i.materialId || i.peso <= 0)) {
      toast.error("Preencha todos os campos corretamente.");
      return;
    }

    // Convert local date to ISOString if needed by appending realistic time/timezone or keep it if API accepts YYYY-MM-DD
    const isoDate = new Date(`${dataColeta}T12:00:00Z`).toISOString();

    onSubmit({
      catadorId,
      dataColeta: isoDate,
      itens: itens.map(i => ({ ...i, peso: Number(i.peso) })),
      valorTotal
    }, initialData?.id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Editar Coleta' : 'Registrar Nova Coleta'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Catador</label>
              <select
                value={catadorId}
                onChange={(e) => setCatadorId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              >
                <option value="">Selecione um catador...</option>
                {catadores.filter(c => c.status === 'ativo').map(catador => (
                  <option key={catador.id} value={catador.id}>
                    {catador.nome} ({catador.cpf})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Coleta</label>
              <input
                type="date"
                value={dataColeta}
                onChange={(e) => setDataColeta(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Materiais Pesados</label>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={16} /> Adicionar Item
              </button>
            </div>
            
            <div className="space-y-3">
              {itens.map((item, index) => (
                <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Tipo de Material</label>
                    <select
                      value={item.materialId}
                      onChange={(e) => handleItemChange(index, 'materialId', e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary-500 bg-white"
                    >
                      <option value="">Selecione...</option>
                      {materiais.map(m => (
                        <option key={m.id} value={m.id}>{m.nome} ({formatCurrency(m.precoPorKg)}/kg)</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-gray-500 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={item.peso || ''}
                      onChange={(e) => handleItemChange(index, 'peso', e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary-500"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs text-gray-500 mb-1">Subtotal</label>
                    <div className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md border border-gray-200 h-[38px] flex items-center">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                  {itens.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md mb-0.5"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valor Total Estimado</p>
              <p className="text-2xl font-bold text-primary-700">{formatCurrency(valorTotal)}</p>
            </div>
            <div className="flex gap-3">
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
                {initialData ? 'Salvar Alterações' : 'Registrar Coleta'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
