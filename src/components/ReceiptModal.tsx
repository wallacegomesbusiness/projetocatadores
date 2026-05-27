import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import type { Catador } from '../data/catadores';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  pagamento: {
    id: string;
    catadorId: string;
    valor: number;
    referenciaMesAno: string;
    dataPagamento: string;
  } | null;
  catador: Catador | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, pagamento, catador }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !pagamento || !catador) return null;

  const handlePrint = () => {
    // Basic way to print a specific component by hiding everything else
    // But a simple window.print() combined with a print CSS class is the easiest here.
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:inset-auto print:block">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:w-full print:rounded-none print:block">
        
        {/* Header (Not printed) */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0 print:hidden">
          <h2 className="text-xl font-bold text-gray-900">
            Recibo de Pagamento
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition cursor-pointer bg-primary-50 px-3 py-1.5 rounded-lg">
              <Printer size={18} />
              Imprimir / PDF
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
              <X size={24} />
            </button>
          </div>
        </div>
        
        {/* Receipt Content (Printed) */}
        <div 
          ref={printRef}
          id="printable-receipt"
          className="p-8 overflow-y-auto flex-1 font-sans text-gray-800 print:overflow-visible print:h-auto print:p-0 print:block"
        >
          <div className="border-2 border-gray-200 p-8 rounded-lg print:border-none print:p-0">
            <div className="text-center mb-8 border-b-2 border-gray-100 pb-6">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Recibo</h1>
              <p className="text-gray-500 mt-2 font-medium">Associação de Catadores de Recicláveis</p>
            </div>

            <div className="flex justify-between items-start mb-8 text-lg">
              <div>
                <span className="font-semibold text-gray-500">Nº do Recibo:</span>
                <p className="font-mono text-gray-900">{pagamento.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-500">Valor:</span>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(pagamento.valor)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-lg leading-relaxed text-gray-700">
              <p>
                Recebi(emos) de <span className="font-bold text-gray-900">Associação de Catadores de Recicláveis</span> a importância supra de <span className="font-bold text-gray-900">{formatCurrency(pagamento.valor)}</span> referente ao repasse de materiais recicláveis entregues durante o período de <span className="font-bold text-gray-900">{pagamento.referenciaMesAno}</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 border border-gray-200 rounded-lg p-6 bg-white shrink-0">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Dados do Favorecido (Catador)</p>
                <p className="font-bold text-gray-900 text-lg">{catador.nome}</p>
                <p className="text-gray-600 mt-1">CPF: {catador.cpf}</p>
                <p className="text-gray-600">Telefone: {catador.telefone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 mb-1">Data do Pagamento</p>
                <p className="font-bold text-gray-900 text-lg">{formatDate(pagamento.dataPagamento)}</p>
              </div>
            </div>

            <div className="mt-16 pt-8 text-center flex flex-col items-center">
              <div className="w-80 border-b-2 border-gray-400 mb-4"></div>
              <p className="font-bold text-gray-900 text-lg">{catador.nome}</p>
              <p className="text-gray-500">Assinatura do Recebedor</p>
              <p className="text-gray-400 text-sm mt-8">Local e Data: ____________________________, ____ de ________________ de ______</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
