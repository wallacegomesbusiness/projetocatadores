import { useState, useEffect } from 'react';
import { DollarSign, Search, CheckCircle, Clock, Edit2, Trash2, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { ConfirmModal } from '../components/ConfirmModal';
import { ReceiptModal } from '../components/ReceiptModal';
import type { Catador } from '../data/catadores';

type Pagamento = {
  id: string;
  catadorId: string;
  valor: number;
  referenciaMesAno: string;
  status: 'pendente' | 'concluido';
  dataPagamento: string;
};

export const PagamentosPage = () => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [catadores, setCatadores] = useState<Catador[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dataFiltro, setDataFiltro] = useState('');
  const [dataFinalFiltro, setDataFinalFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'mes' | 'periodo'>('mes');
  const [novoPagamento, setNovoPagamento] = useState({
    catadorId: '',
    valor: '',
    referenciaMesAno: '',
    dataPagamento: new Date().toISOString().split('T')[0]
  });
  const [editingPagamento, setEditingPagamento] = useState<Pagamento | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [confirmPaymentId, setConfirmPaymentId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Pagamento | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPagamentos, resCatadores] = await Promise.all([
          api.get('/pagamentos'),
          api.get('/catadores')
        ]);
        setPagamentos(resPagamentos.data);
        setCatadores(resCatadores.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar dados');
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getCatadorName = (id: string) => {
    return catadores.find(c => c.id === id)?.nome || 'Catador Desconhecido';
  };

  const filteredPagamentos = pagamentos.filter(p => {
    const matchSearch = getCatadorName(p.catadorId).toLowerCase().includes(searchTerm.toLowerCase()) || p.referenciaMesAno.includes(searchTerm);
    let matchData = true;

    if (tipoFiltro === 'mes') {
      matchData = dataFiltro ? p.dataPagamento.startsWith(dataFiltro) : true;
    } else {
      if (dataFiltro || dataFinalFiltro) {
        const dataP = new Date(p.dataPagamento).getTime();
        const inicio = dataFiltro ? new Date(`${dataFiltro}T00:00:00`).getTime() : 0;
        const fim = dataFinalFiltro ? new Date(`${dataFinalFiltro}T23:59:59`).getTime() : Infinity;
        matchData = dataP >= inicio && dataP <= fim;
      }
    }
    
    return matchSearch && matchData;
  });

  const handleDeleteConfirm = async () => {
    if (!deletePaymentId) return;
    try {
      await api.delete(`/pagamentos/${deletePaymentId}`);
      setPagamentos(pagamentos.filter(p => p.id !== deletePaymentId));
      toast.success('Pagamento excluído com sucesso!');
    } catch {
      toast.error('Erro ao excluir pagamento');
    } finally {
      setDeletePaymentId(null);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmPaymentId) return;
    try {
      const response = await api.put(`/pagamentos/${confirmPaymentId}/status`, { status: 'concluido' });
      setPagamentos(pagamentos.map(p => 
        p.id === confirmPaymentId ? response.data : p
      ));
      toast.success('Pagamento confirmado com sucesso!');
    } catch {
      toast.error('Erro ao confirmar pagamento');
    } finally {
      setConfirmPaymentId(null);
    }
  };

  const openEditModal = (pagamento: Pagamento) => {
    setEditingPagamento(pagamento);
    setNovoPagamento({
      catadorId: pagamento.catadorId,
      valor: pagamento.valor.toString(),
      referenciaMesAno: pagamento.referenciaMesAno,
      dataPagamento: pagamento.dataPagamento.split('T')[0]
    });
    setIsFormOpen(true);
  };

  const handleSalvarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPagamento.catadorId || !novoPagamento.valor || !novoPagamento.referenciaMesAno || !novoPagamento.dataPagamento) return;

    try {
      const isoDate = new Date(`${novoPagamento.dataPagamento}T12:00:00Z`).toISOString();
      const payload = {
        catadorId: novoPagamento.catadorId,
        valor: parseFloat(novoPagamento.valor as string),
        referenciaMesAno: novoPagamento.referenciaMesAno,
        dataPagamento: isoDate
      };

      if (editingPagamento) {
        const response = await api.put(`/pagamentos/${editingPagamento.id}`, payload);
        setPagamentos(pagamentos.map(p => p.id === editingPagamento.id ? response.data : p));
        toast.success('Pagamento atualizado com sucesso.');
      } else {
        const response = await api.post('/pagamentos', payload);
        setPagamentos([response.data, ...pagamentos]);
        toast.success('Novo pagamento registrado.');
      }

      setIsFormOpen(false);
      setEditingPagamento(null);
      setNovoPagamento({ catadorId: '', valor: '', referenciaMesAno: '', dataPagamento: new Date().toISOString().split('T')[0] });
    } catch {
      toast.error('Erro ao salvar pagamento');
    }
  };

  const totalPrevisto = filteredPagamentos.reduce((acc, p) => acc + p.valor, 0);
  const totalPago = filteredPagamentos.filter(p => p.status === 'concluido').reduce((acc, p) => acc + p.valor, 0);
  const saldoPendente = filteredPagamentos.filter(p => p.status === 'pendente').reduce((acc, p) => acc + p.valor, 0);

  return (
    <>
    <div className="space-y-6 print:hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 justify-end w-full">
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {tipoFiltro === 'mes' ? 'Filtrar Mês Pev/Pagamento:' : 'Data Inicial Pev/Pagamento:'}
            </label>
            <input 
              type={tipoFiltro === 'mes' ? 'month' : 'date'} 
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm block"
            />
            {tipoFiltro === 'periodo' && (
              <>
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap ml-2">Até:</label>
                <input 
                  type="date"
                  value={dataFinalFiltro}
                  onChange={(e) => setDataFinalFiltro(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm block"
                />
              </>
            )}
          </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Pagamentos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os repasses financeiros aos catadores assiciados.</p>
        </div>
        <div>
          <button 
            onClick={() => {
              setEditingPagamento(null);
              setNovoPagamento({ catadorId: '', valor: '', referenciaMesAno: '', dataPagamento: new Date().toISOString().split('T')[0] });
              setIsFormOpen(true);
            }}
            className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm transition cursor-pointer"
          >
            <DollarSign size={20} />
            <span>Registrar Pagamento</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <DollarSign size={20} />
            <h3 className="font-medium">Total Previsto</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPrevisto)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 text-green-600 mb-2">
            <CheckCircle size={20} />
            <h3 className="font-medium">Total Pago</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPago)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 text-yellow-600 mb-2">
            <Clock size={20} />
            <h3 className="font-medium">Restante a Pagar</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{formatCurrency(saldoPendente)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome do catador ou mês/ano (ex: 02/2025)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100 text-sm text-gray-600 font-medium whitespace-nowrap">
                <th className="p-4">Favorecido (Catador)</th>
                <th className="p-4">Ref. (Mês/Ano)</th>
                <th className="p-4">Data Prev./Pagamento</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Status</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPagamentos.map(pagamento => (
                <tr key={pagamento.id} className="hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <td className="p-4 font-medium text-gray-900">{getCatadorName(pagamento.catadorId)}</td>
                  <td className="p-4 text-gray-600">{pagamento.referenciaMesAno}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(pagamento.dataPagamento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 font-semibold text-gray-900">
                    {formatCurrency(pagamento.valor)}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${pagamento.status === 'concluido' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {pagamento.status === 'concluido' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {pagamento.status === 'concluido' ? 'Concluído' : 'Pendente'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {pagamento.status === 'pendente' && (
                        <button 
                          onClick={() => setConfirmPaymentId(pagamento.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition cursor-pointer"
                          title="Confirmar Pagamento"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {pagamento.status === 'concluido' && (
                        <button 
                          onClick={() => setViewingReceipt(pagamento)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                          title="Ver Recibo"
                        >
                          <FileText size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => openEditModal(pagamento)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setDeletePaymentId(pagamento.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPagamentos.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhum registro de pagamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro de Pagamento */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPagamento ? 'Editar Pagamento' : 'Registrar Pagamento'}
              </h2>
            </div>
            
            <form onSubmit={handleSalvarPagamento} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catador</label>
                <select
                  value={novoPagamento.catadorId}
                  onChange={(e) => setNovoPagamento({...novoPagamento, catadorId: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="">Selecione um catador...</option>
                  {catadores.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referência (Mês/Ano)</label>
                <input
                  type="text"
                  placeholder="Ex: 03/2025"
                  value={novoPagamento.referenciaMesAno}
                  onChange={(e) => setNovoPagamento({...novoPagamento, referenciaMesAno: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Repasse (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoPagamento.valor}
                  onChange={(e) => setNovoPagamento({...novoPagamento, valor: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista/Pagamento</label>
                <input
                  type="date"
                  value={novoPagamento.dataPagamento}
                  onChange={(e) => setNovoPagamento({...novoPagamento, dataPagamento: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingPagamento(null);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition cursor-pointer"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmPaymentId}
        title="Confirmar Pagamento"
        message="Tem certeza que deseja marcar este pagamento como concluído? Essa ação não poderá ser desfeita automaticamente."
        confirmText="Confirmar Pagamento"
        type="success"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmPaymentId(null)}
      />

      <ConfirmModal
        isOpen={!!deletePaymentId}
        title="Excluir Pagamento"
        message="Tem certeza que deseja excluir este registro de pagamento permanentemente?"
        confirmText="Excluir Pagamento"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletePaymentId(null)}
      />
    </div>

    <ReceiptModal
      isOpen={!!viewingReceipt}
      onClose={() => setViewingReceipt(null)}
      pagamento={viewingReceipt}
      catador={viewingReceipt ? catadores.find(c => c.id === viewingReceipt.catadorId) || null : null}
    />
    </>
  );
};
