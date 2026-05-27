import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { CatadoresList } from '../components/CatadoresList';
import { CatadorForm } from '../components/CatadorForm';
import { ConfirmModal } from '../components/ConfirmModal';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import type { Catador } from '../data/catadores';

export const CatadoresPage = () => {
  const [catadores, setCatadores] = useState<Catador[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCatador, setEditingCatador] = useState<Catador | null>(null);
  const [deletingCatadorId, setDeletingCatadorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatadores = async () => {
      try {
        const response = await api.get('/catadores');
        setCatadores(response.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar catadores');
      }
    };
    fetchCatadores();
  }, []);

  const handleOpenNew = () => {
    setEditingCatador(null);
    setIsFormOpen(true);
  };

  const handleEdit = (catador: Catador) => {
    setEditingCatador(catador);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingCatadorId) {
      try {
        await api.delete(`/catadores/${deletingCatadorId}`);
        setCatadores(catadores.filter(c => c.id !== deletingCatadorId));
        toast.success('Catador excluído com sucesso');
      } catch {
        toast.error('Erro ao excluir catador');
      } finally {
        setDeletingCatadorId(null);
      }
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingCatadorId(id);
  };

  const handleSubmit = async (data: Partial<Catador>) => {
    try {
      if (editingCatador) {
        const response = await api.put(`/catadores/${editingCatador.id}`, data);
        setCatadores(catadores.map(c => 
          c.id === editingCatador.id ? response.data : c
        ));
      } else {
        const response = await api.post('/catadores', data);
        setCatadores([...catadores, response.data]);
      }
      setIsFormOpen(false);
      toast.success(editingCatador ? 'Catador atualizado' : 'Catador cadastrado com sucesso');
    } catch {
      toast.error('Erro ao salvar dados');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catadores</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie o cadastro de catadores da associação.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm transition cursor-pointer"
        >
          <Plus size={20} />
          <span>Novo Catador</span>
        </button>
      </div>

      <CatadoresList 
        catadores={catadores} 
        onEdit={handleEdit} 
        onDelete={handleDeleteRequest} 
      />

      {isFormOpen && (
        <CatadorForm 
          catador={editingCatador}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingCatadorId}
        title="Excluir Catador"
        message="Tem certeza que deseja excluir este catador permanentemente?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCatadorId(null)}
      />
    </div>
  );
};
