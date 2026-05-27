import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { MaterialForm } from '../components/MaterialForm';
import { ConfirmModal } from '../components/ConfirmModal';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import type { Material } from '../data/coletas';

export const MateriaisPage = () => {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMateriais = async () => {
      try {
        const response = await api.get('/materiais');
        setMateriais(response.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar materiais');
      }
    };
    fetchMateriais();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleOpenNew = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingMaterialId) {
      try {
        await api.delete(`/materiais/${deletingMaterialId}`);
        setMateriais(materiais.filter(m => m.id !== deletingMaterialId));
        toast.success('Material excluído com sucesso');
      } catch {
        toast.error('Erro ao excluir material');
      } finally {
        setDeletingMaterialId(null);
      }
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingMaterialId(id);
  };

  const handleSubmit = async (data: Partial<Material>) => {
    try {
      if (editingMaterial) {
        const response = await api.put(`/materiais/${editingMaterial.id}`, data);
        setMateriais(materiais.map(m => 
          m.id === editingMaterial.id ? response.data : m
        ));
      } else {
        const response = await api.post('/materiais', data);
        setMateriais([...materiais, response.data]);
      }
      setIsFormOpen(false);
      toast.success(editingMaterial ? 'Material atualizado' : 'Material cadastrado');
    } catch {
      toast.error('Erro ao salvar material');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais Recicláveis</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os tipos de materiais e seus valores de compra.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm transition cursor-pointer"
        >
          <Plus size={20} />
          <span>Novo Material</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
          {materiais.map((material) => (
            <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition bg-gray-50 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{material.nome}</h3>
                <p className="text-2xl font-bold text-primary-600 mt-2">
                  {formatCurrency(material.precoPorKg)}
                  <span className="text-sm font-normal text-gray-500 ml-1">/ {material.unidade}</span>
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => handleEdit(material)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteRequest(material.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isFormOpen && (
        <MaterialForm 
          material={editingMaterial}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingMaterialId}
        title="Excluir Material"
        message="Atenção: Excluir um material pode afetar o histórico de coletas relacionadas a ele. Deseja realmente continuar?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingMaterialId(null)}
      />
    </div>
  );
};
