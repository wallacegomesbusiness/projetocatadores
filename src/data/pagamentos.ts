export interface Pagamento {
  id: string;
  catadorId: string;
  dataPagamento: string;
  valor: number;
  referenciaMesAno: string;
  status: 'concluido' | 'pendente';
}

export const mockPagamentos: Pagamento[] = [
  {
    id: '1',
    catadorId: '1',
    dataPagamento: '2025-02-28',
    valor: 450.50,
    referenciaMesAno: '02/2025',
    status: 'pendente',
  },
  {
    id: '2',
    catadorId: '2',
    dataPagamento: '2025-01-31',
    valor: 820.00,
    referenciaMesAno: '01/2025',
    status: 'concluido',
  },
  {
    id: '3',
    catadorId: '1',
    dataPagamento: '2025-01-31',
    valor: 310.20,
    referenciaMesAno: '01/2025',
    status: 'concluido',
  }
];
