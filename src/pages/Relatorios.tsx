import { useState, useEffect, useMemo } from 'react';
import { Download, FileText, BarChart2, Calendar, FileSpreadsheet } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import type { Coleta, Material } from '../data/coletas';
import type { Catador } from '../data/catadores';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const RelatoriosPage = () => {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [catadores, setCatadores] = useState<Catador[]>([]);
  
  // Filtros Globais
  const [tipoFiltro, setTipoFiltro] = useState<'mes' | 'periodo'>('mes');
  const [dataFiltro, setDataFiltro] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dataFinalFiltro, setDataFinalFiltro] = useState('');
  const [catadorFiltro, setCatadorFiltro] = useState('todos');
  const [materialFiltro, setMaterialFiltro] = useState('todos');

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
        console.error('Erro ao carregar dados do relatório:', err);
      }
    };
    fetchData();
  }, []);

  // Lógica de Filtragem Centralizada
  const coletasFiltradas = useMemo(() => {
    const filtradas = coletas.filter(c => {
      // 1. Filtro por Catador
      if (catadorFiltro !== 'todos' && c.catadorId !== catadorFiltro) {
        return false;
      }
      
      // 2. Filtro por Data
      if (tipoFiltro === 'mes') {
        return dataFiltro ? c.dataColeta.startsWith(dataFiltro) : true;
      } else {
        if (!dataFiltro && !dataFinalFiltro) return true;
        
        // Corrige o timezone ignorando as horas para comparar corretamente as datas 
        const dataC = new Date(c.dataColeta.split('T')[0]).getTime();
        const inicio = dataFiltro ? new Date(dataFiltro).getTime() : 0;
        const fim = dataFinalFiltro ? new Date(dataFinalFiltro).getTime() : Infinity;
        
        return dataC >= inicio && dataC <= fim;
      }
    });

    if (materialFiltro === 'todos') {
      return filtradas;
    }

    // 3. Filtro por Material
    // Filtramos os itens por material e recalculamos o valorTotal para representar a busca
    return filtradas.map(c => {
      const itensFiltrados = c.itens.filter(i => i.materialId === materialFiltro);
      if (itensFiltrados.length === 0) return null;
      
      const novoValorTotal = itensFiltrados.reduce((sum, item) => sum + item.subtotal, 0);
      
      return {
        ...c,
        itens: itensFiltrados,
        valorTotal: novoValorTotal
      };
    }).filter(Boolean) as Coleta[];

  }, [coletas, tipoFiltro, dataFiltro, dataFinalFiltro, catadorFiltro, materialFiltro]);

  // Métricas Derivadas dos Filtros
  const totalArrecadado = coletasFiltradas.reduce((acc, coleta) => acc + coleta.valorTotal, 0);
  
  const totalPeso = coletasFiltradas.reduce((acc, coleta) => {
    return acc + coleta.itens.reduce((sum: number, item: Coleta['itens'][0]) => sum + item.peso, 0);
  }, 0);

  // Calcula top materiais baseado nas coletas filtradas
  const topMateriais = useMemo(() => {
    const ranking: Record<string, { nome: string, peso: number }> = {};
    
    coletasFiltradas.forEach(coleta => {
      coleta.itens.forEach(item => {
        const mat = materiais.find(m => m.id === item.materialId);
        if (mat) {
          if (!ranking[mat.id]) {
            ranking[mat.id] = { nome: mat.nome, peso: 0 };
          }
          ranking[mat.id].peso += item.peso;
        }
      });
    });

    // Converte em array, ordena por peso decrescente, e pega os 3 maiores
    return Object.values(ranking)
      .sort((a, b) => b.peso - a.peso)
      .slice(0, 3);
  }, [coletasFiltradas, materiais]);

  const maxMaterialPeso = topMateriais.length > 0 ? topMateriais[0].peso : 1;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getCatadorName = (id: string) => {
    return catadores.find(c => c.id === id)?.nome || 'Catador Desconhecido';
  };

  const formatPeriodoHeader = () => {
     if (tipoFiltro === 'mes' && dataFiltro) {
       const [ano, mes] = dataFiltro.split('-');
       const nomeMes = new Date(Number(ano), Number(mes) - 1).toLocaleString('pt-BR', { month: 'long' });
       return `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} de ${ano}`;
     }
     
     if (tipoFiltro === 'periodo') {
       const ini = dataFiltro ? new Date(dataFiltro).toLocaleDateString('pt-BR') : 'Início';
       const enc = dataFinalFiltro ? new Date(dataFinalFiltro).toLocaleDateString('pt-BR') : 'Hoje';
       return `${ini} até ${enc}`;
     }
     return 'Todo o Período Histórico';
  };

  const handleExportarExcel = () => {
    if(coletasFiltradas.length === 0) {
      toast.error('Nenhum dado encontrado para os filtros selecionados.');
      return;
    }

    const data = coletasFiltradas.map(coleta => ({
      Data: new Date(coleta.dataColeta).toLocaleDateString('pt-BR'),
      Catador: getCatadorName(coleta.catadorId),
      TotalKg: coleta.itens.reduce((sum, item) => sum + item.peso, 0).toFixed(2),
      ValorRepasse: formatCurrency(coleta.valorTotal)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
    XLSX.writeFile(wb, `Relatorio_Coletas_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    toast.success('Planilha gerada com sucesso!');
  };

  const handleExportarPDF = () => {
    if(coletasFiltradas.length === 0) {
      toast.error('Nenhum dado encontrado para os filtros selecionados.');
      return;
    }

    const doc = new jsPDF();
    const titulo = `Relatório de Coletas e Atividades`;
    const catadorText = catadorFiltro === 'todos' ? 'Todos os Catadores' : getCatadorName(catadorFiltro);
    const materialText = materialFiltro === 'todos' ? 'Todos os Materiais' : (materiais.find(m => m.id === materialFiltro)?.nome || 'Material Específico');
    const periodoText = formatPeriodoHeader();
    
    // Cabeçalho PDF
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74); // primary green
    doc.text('ReciclaOrg', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55); // max gray
    doc.text(titulo, 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // medium gray
    doc.text(`Período: ${periodoText}`, 14, 37);
    doc.text(`Filtro Catador: ${catadorText}`, 14, 43);
    doc.text(`Filtro Material: ${materialText}`, 14, 49);
    doc.text(`Data de Emissão: ${new Date().toLocaleString('pt-BR')}`, 14, 55);

    const tableData: (string | Record<string, unknown>)[][] = coletasFiltradas.map(coleta => [
       new Date(coleta.dataColeta).toLocaleDateString('pt-BR'),
       getCatadorName(coleta.catadorId),
       coleta.itens.reduce((sum, item) => sum + item.peso, 0).toFixed(2) + ' kg',
       formatCurrency(coleta.valorTotal)
    ]);

    // Resumo/Footer
    tableData.push([
      { content: 'TOTAL GERAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: totalPeso.toFixed(2) + ' kg', styles: { fontStyle: 'bold' } },
      { content: formatCurrency(totalArrecadado), styles: { fontStyle: 'bold' } }
    ]);

    autoTable(doc, {
      head: [['Data da Coleta', 'Nome do Catador', 'Peso Total Arrecadado', 'Valor de Repasse/Transação']],
      body: tableData,
      startY: 60,
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      theme: 'grid',
    });

    doc.save(`Relatorio_Coletas_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    toast.success('PDF gerado com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios e Exportação</h1>
          <p className="text-sm text-gray-500 mt-1">Gere análises consolidadas de suas métricas baseadas em filtros avançados.</p>
        </div>
      </div>

      {/* Seção Filtros Globais */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-end gap-6">
        <div className="flex flex-col gap-3 w-full md:w-auto flex-1">
          <label className="text-sm font-semibold text-gray-700">Período de Análise</label>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 w-full">
            <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-200 w-full lg:w-auto">
              <button
                onClick={() => {
                  setTipoFiltro('mes');
                  setDataFinalFiltro('');
                }}
                className={`flex-1 lg:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  tipoFiltro === 'mes' ? 'bg-primary-100 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-white'
                }`}
              >
                Por Mês
              </button>
              <button
                onClick={() => {
                  setTipoFiltro('periodo');
                  setDataFiltro('');
                }}
                className={`flex-1 lg:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  tipoFiltro === 'periodo' ? 'bg-primary-100 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-white'
                }`}
              >
                Por Data
              </button>
            </div>
            
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <input 
                type={tipoFiltro === 'mes' ? 'month' : 'date'} 
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="w-full lg:w-[160px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none text-sm transition"
              />
              {tipoFiltro === 'periodo' && (
                <>
                  <span className="text-gray-400 font-medium">a</span>
                  <input 
                    type="date"
                    value={dataFinalFiltro}
                    onChange={(e) => setDataFinalFiltro(e.target.value)}
                    className="w-full lg:w-[160px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none text-sm transition"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-6 w-full md:w-auto">
          <div className="flex flex-col gap-3 w-full md:w-[220px]">
            <label className="text-sm font-semibold text-gray-700">Filtrar por Catador</label>
            <select
              value={catadorFiltro}
              onChange={(e) => setCatadorFiltro(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none text-sm text-gray-700 transition"
            >
              <option value="todos">Todos os Catadores</option>
              {catadores.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-[220px]">
            <label className="text-sm font-semibold text-gray-700">Filtrar por Material</label>
            <select
              value={materialFiltro}
              onChange={(e) => setMaterialFiltro(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none text-sm text-gray-700 transition"
            >
              <option value="todos">Todos os Materiais</option>
              {materiais.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Métricas do Período */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
              <BarChart2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Métricas do Período</h2>
              <p className="text-sm text-gray-500">{formatPeriodoHeader()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 flex-1">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 text-sm font-medium">Total de Coletas</span>
                <span className="font-bold text-gray-900 text-lg bg-gray-100 px-3 py-1 rounded-md">{coletasFiltradas.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 text-sm font-medium">Volume Total Recebido</span>
                <span className="font-bold text-gray-900 text-lg">{totalPeso.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 text-sm font-medium">Valor Total em Repasse</span>
                <span className="font-bold text-emerald-600 text-lg">{formatCurrency(totalArrecadado)}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar size={14} /> Materiais Mais Recebidos
              </h4>
              <div className="space-y-4">
                {topMateriais.length === 0 ? (
                   <p className="text-sm text-gray-400 italic text-center py-4">Nenhum material no período</p>
                ) : (
                  topMateriais.map((m, index) => {
                    const widthPercent = (m.peso / maxMaterialPeso) * 100;
                    return (
                      <div key={index} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-sm">
                           <span className="font-medium text-gray-700">{m.nome}</span>
                           <span className="font-bold text-gray-900">{m.peso.toFixed(1)} kg</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-primary-500 h-full rounded-full" style={{ width: `${Math.max(widthPercent, 5)}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Módulo de Exportação */}
        <div className="bg-gray-900 rounded-xl shadow-md border border-gray-800 p-6 flex flex-col items-center justify-center text-center text-white h-full relative overflow-hidden">
          {/* Decoração background fundo escuro */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary-600/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm border border-white/10">
              <FileSpreadsheet size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Exportar Resultados</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-[250px]">
              Gere documentos profissionais espelhando os filtros de Data ({tipoFiltro === 'mes' ? 'Mês' : 'Período'}) e do Catador lado a lado.
            </p>
            
            <div className="space-y-3 w-full sm:w-11/12 mx-auto">
              <button 
                onClick={handleExportarPDF}
                className="flex items-center justify-between w-full px-5 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 transition shadow-lg shadow-primary-900/50 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                   <FileText size={20} className="opacity-80 group-hover:opacity-100" />
                   <span>Baixar PDF (Gráfico)</span>
                </div>
                <Download size={18} />
              </button>

              <button 
                onClick={handleExportarExcel}
                className="flex items-center justify-between w-full px-5 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition backdrop-blur-sm border border-white/10 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                   <FileSpreadsheet size={20} className="text-emerald-400 opacity-80 group-hover:opacity-100" />
                   <span>Planilha do Excel</span>
                </div>
                <Download size={18} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-6 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Pronto para geração imediata
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

