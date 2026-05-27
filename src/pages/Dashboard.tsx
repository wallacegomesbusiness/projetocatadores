import { useState, useEffect } from 'react';
import { Users, Truck, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../services/api';
import type { Coleta, Material } from '../data/coletas';
import type { Catador } from '../data/catadores';

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {trend && (
        <p className="text-sm text-primary-600 mt-2 flex items-center gap-1 font-medium">
          <TrendingUp size={16} />
          {trend}
        </p>
      )}
    </div>
    <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
      {icon}
    </div>
  </div>
);

export const Dashboard = () => {
  const [tipoFiltro, setTipoFiltro] = useState<'mes' | 'periodo'>('mes');
  const [dataFiltro, setDataFiltro] = useState('');
  const [dataFinalFiltro, setDataFinalFiltro] = useState('');
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [catadores, setCatadores] = useState<Catador[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resColetas, resMateriais, resCatadores] = await Promise.all([
          api.get('/coletas'),
          api.get('/materiais'),
          api.get('/catadores')
        ]);
        setColetas(resColetas.data);
        setMateriais(resMateriais.data);
        setCatadores(resCatadores.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Filtrar coletas pelo mês ou período selecionado
  const coletasFiltradas = coletas.filter(c => {
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

  // Calcular totais
  const totalCatadores = catadores.length;
  const catadoresAtivos = new Set(coletasFiltradas.map(c => c.catadorId)).size;
  const periodoTexto = tipoFiltro === 'mes' ? 'neste mês' : 'neste período';
  
  const totalColetado = coletasFiltradas.reduce((acc, coleta) => {
    return acc + coleta.itens.reduce((sum: number, item: Coleta['itens'][0]) => sum + item.peso, 0);
  }, 0);

  const valorTotalPago = coletasFiltradas.reduce((acc, coleta) => acc + coleta.valorTotal, 0);

  // Preparar dados para o gráfico
  const pesoPorMaterial = materiais.map(material => {
    const peso = coletasFiltradas.reduce((acc, coleta) => {
      const item = coleta.itens.find((i: Coleta['itens'][0]) => i.materialId === material.id);
      return acc + (item ? item.peso : 0);
    }, 0);
    
    return {
      nome: material.nome,
      peso: peso
    };
  }).filter(item => item.peso > 0).sort((a, b) => b.peso - a.peso);

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getCatadorName = (id: string) => {
    return catadores.find(c => c.id === id)?.nome || 'Desconhecido';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end w-full justify-end gap-3">
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
              {tipoFiltro === 'mes' ? 'Mês:' : 'Data Inicial:'}
            </label>
            <input 
              type={tipoFiltro === 'mes' ? 'month' : 'date'} 
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm block"
            />
            {tipoFiltro === 'periodo' && (
              <>
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap sm:ml-2">Até:</label>
                <input 
                  type="date"
                  value={dataFinalFiltro}
                  onChange={(e) => setDataFinalFiltro(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm block"
                />
              </>
            )}
          </div>
        </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Catadores" 
          value={totalCatadores.toString()} 
          icon={<Users size={24} />} 
          trend={`${catadoresAtivos} ativos ${periodoTexto}`}
        />
        <StatCard 
          title="Volume Coletado" 
          value={`${totalColetado.toFixed(1)} kg`} 
          icon={<Truck size={24} />} 
        />
        <StatCard 
          title="Total Estimado" 
          value={formatCurrency(valorTotalPago)} 
          icon={<DollarSign size={24} />} 
        />
        <StatCard 
          title="Materiais Ativos" 
          value={materiais.length.toString()} 
          icon={<TrendingUp size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Volume por Material (kg)</h2>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pesoPorMaterial} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="peso" radius={[4, 4, 0, 0]}>
                  {pesoPorMaterial.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Últimas Coletas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500 font-medium">
                  <th className="pb-3 px-2">Data</th>
                  <th className="pb-3 px-2">Catador</th>
                  <th className="pb-3 px-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coletasFiltradas.slice(0, 5).map((coleta) => (
                  <tr key={coleta.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {formatDate(coleta.dataColeta)}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-900">
                      {getCatadorName(coleta.catadorId)}
                    </td>
                    <td className="py-3 px-2 text-sm font-semibold text-primary-700 text-right">
                      {formatCurrency(coleta.valorTotal)}
                    </td>
                  </tr>
                ))}
                {coletasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-gray-500">
                      Nenhuma coleta registrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
