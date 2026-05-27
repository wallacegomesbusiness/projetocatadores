export interface Catador {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  dataCadastro: string;
  status: 'ativo' | 'inativo';
}

export const mockCatadores: Catador[] = [
  {
    id: '1',
    nome: 'João da Silva',
    cpf: '111.222.333-44',
    telefone: '(11) 98765-4321',
    dataCadastro: '2025-01-15',
    status: 'ativo',
  },
  {
    id: '2',
    nome: 'Maria Fernandes',
    cpf: '222.333.444-55',
    telefone: '(11) 97654-3210',
    dataCadastro: '2025-02-10',
    status: 'ativo',
  },
  {
    id: '3',
    nome: 'Carlos Souza',
    cpf: '333.444.555-66',
    telefone: '(11) 96543-2109',
    dataCadastro: '2024-11-20',
    status: 'inativo',
  }
];
