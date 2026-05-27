import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ColetasList } from '../components/ColetasList';
import { ColetaForm } from '../components/ColetaForm';
import { ColetaDetailsModal } from '../components/ColetaDetailsModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import type { Coleta, Material } from '../data/coletas';
import type { Catador } from '../data/catadores';

export const ColetasPage = () => {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [catadores, setCatadores] = useState<Catador[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingColeta, setViewingColeta] = useState<Coleta | null>(null);
  const [editingColeta, setEditingColeta] = useState<Coleta | null>(null);
  const [deletingColetaId, setDeletingColetaId] = useState<string | null>(null);
  const [dataFiltro, setDataFiltro] = useState('');
  const [dataFinalFiltro, setDataFinalFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'mes' | 'periodo'>('mes');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resColetas, resCatadores, resMateriais] = await Promise.all([
          api.get('/coletas'),
          api.get('/catadores'),
          api.get('/materiais')
        ]);
        setColetas(resColetas.data);
        setCatadores(resCatadores.data);
        setMateriais(resMateriais.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar dados');
      }
    };
    fetchData();
  }, []);

  const coletasExibidas = coletas.filter(c => {
    if (tipoFiltro === 'mes') {
      return dataFiltro ? c.dataColeta.startsWith(dataFiltro) : true;
    } else {
      if (!dataFiltro && !dataFinalFiltro) return true;
      const dataC = new Date(c.dataColeta).getTime();
      const inicio = dataFiltro ? new Date(`${dataFiltro}T00:00:00`).getTime() : 0;
      const fim = dataFinalFiltro ? new Date(`${dataFinalFiltro}T23:59:59`).getTime() : Infinity;
      return dataC >= inicio && dataC <= fim;
    }
  });

  const handleDeleteConfirm = async () => {
    if (deletingColetaId) {
      try {
        await api.delete(`/coletas/${deletingColetaId}`);
        setColetas(coletas.filter(c => c.id !== deletingColetaId));
        toast.success('Coleta excluída com sucesso');
      } catch {
        toast.error('Erro ao excluir coleta');
      } finally {
        setDeletingColetaId(null);
      }
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingColetaId(id);
  };

  const handleView = (id: string) => {
    const coleta = coletas.find(c => c.id === id);
    if (coleta) {
      setViewingColeta(coleta);
    }
  };

  const handleEditClick = () => {
    if (viewingColeta) {
      setEditingColeta(viewingColeta);
      setViewingColeta(null);
    }
  };

  const handleSubmit = async (data: Omit<Coleta, 'id'>, id?: string) => {
    try {
      if (id) {
        const response = await api.put(`/coletas/${id}`, data);
        setColetas(coletas.map(c => c.id === id ? response.data : c));
        setEditingColeta(null);
      } else {
        const response = await api.post('/coletas', data);
        setColetas([response.data, ...coletas]);
        setIsFormOpen(false);
      }
      toast.success(id ? 'Coleta atualizada' : 'Coleta registrada com sucesso');
    } catch {
      toast.error('Erro ao salvar coleta');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 justify-end w-full">
          <div className="flex flex-col items-start gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => {
                  setTipoFiltro('mes');
                  setDataFiltro('');
                  setDataFinalFiltro('');
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tipoFiltro === 'mes' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Por Mês
              </button>
              <button
                onClick={() => {
                  setTipoFiltro('periodo');
                  setDataFiltro('');
                  setDataFinalFiltro('');
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tipoFiltro === 'periodo' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Por Período
              </button>
            </div>
            
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4 sm:mb-0 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {tipoFiltro === 'mes' ? 'Mês:' : 'Data Inicial:'}
            </label>
            <input 
              type={tipoFiltro === 'mes' ? 'month' : 'date'} 
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm block"
            />
            {tipoFiltro === 'periodo' && (
              <>
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap sm:ml-2">Até:</label>
                <input 
                  type="date"
                  value={dataFinalFiltro}
                  onChange={(e) => setDataFinalFiltro(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm block"
                />
              </>
            )}
          </div>

        </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registro de Coletas</h1>
          <p className="text-sm text-gray-500 mt-1">Registre o peso e os materiais entregues pelos catadores.</p>
        </div>
        <div>
          <button 
              onClick={() => setIsFormOpen(true)}
              className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm transition cursor-pointer"
            >
              <Plus size={20} />
              <span>Nova Coleta</span>
            </button>
        </div>
      </div>

      <ColetasList 
        coletas={coletasExibidas} 
        catadores={catadores}
        onView={handleView} 
        onDelete={handleDeleteRequest} 
      />

      {(isFormOpen || editingColeta) && (
        <ColetaForm 
          key={editingColeta ? editingColeta.id : 'new'}
          initialData={editingColeta || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingColeta(null);
          }}
        />
      )}

      {viewingColeta && (
        <ColetaDetailsModal 
          coleta={viewingColeta}
          catadores={catadores}
          materiais={materiais}
          onClose={() => setViewingColeta(null)}
          onEdit={handleEditClick}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingColetaId}
        title="Excluir Coleta"
        message="Tem certeza que deseja excluir o registro desta coleta permanentemente?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingColetaId(null)}
      />
    </div>
  );
};
