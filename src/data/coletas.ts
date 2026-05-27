export interface Material {
  id: string;
  nome: string;
  precoPorKg: number;
  unidade: string;
}

export const mockMateriais: Material[] = [
  { id: '1', nome: 'Papelão', precoPorKg: 0.50, unidade: 'kg' },
  { id: '2', nome: 'Plástico PET', precoPorKg: 1.20, unidade: 'kg' },
  { id: '3', nome: 'Lata de Alumínio', precoPorKg: 4.50, unidade: 'kg' },
  { id: '4', nome: 'Vidro', precoPorKg: 0.10, unidade: 'kg' },
  { id: '5', nome: 'Sucata de Ferro', precoPorKg: 0.80, unidade: 'kg' },
];

export interface ItemColeta {
  materialId: string;
  peso: number;
  subtotal: number;
}

export interface Coleta {
  id: string;
  catadorId: string;
  dataColeta: string;
  itens: ItemColeta[];
  valorTotal: number;
}

export const mockColetas: Coleta[] = [
  {
    id: '1',
    catadorId: '1', // João da Silva
    dataColeta: '2025-02-25T14:30:00Z',
    valorTotal: 65.00,
    itens: [
      { materialId: '1', peso: 50, subtotal: 25.00 }, // 50kg Papelão
      { materialId: '2', peso: 20, subtotal: 24.00 }, // 20kg PET
      { materialId: '5', peso: 20, subtotal: 16.00 }, // 20kg Ferro
    ]
  },
  {
    id: '2',
    catadorId: '2', // Maria Fernandes
    dataColeta: '2025-02-26T09:15:00Z',
    valorTotal: 96.00,
    itens: [
      { materialId: '3', peso: 20, subtotal: 90.00 }, // 20kg Alumínio
      { materialId: '4', peso: 60, subtotal: 6.00 },  // 60kg Vidro
    ]
  }
];
