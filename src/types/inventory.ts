export type Nivel = 'Não Tem' | 'Nivel 1' | 'Nivel 2' | 'Nivel 3';

export type Tipo = 'Arganel' | 'Certificado' | 'Distintivo' | 'Distintivo de Progressão' | 'Distintivo Especialidade';

export type Ramo = 'Lobinho' | 'Escoteiro' | 'Sênior' | 'Pioneiro' | 'Jovens' | 'Escotista' | 'Todos';

export interface InventoryItem {
  id: string;
  nivel: Nivel;
  tipo: Tipo;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  ramo: Ramo;
}

export const NIVEIS: Nivel[] = ['Não Tem', 'Nivel 1', 'Nivel 2', 'Nivel 3'];

export const TIPOS: Tipo[] = [
  'Arganel',
  'Certificado', 
  'Distintivo',
  'Distintivo de Progressão',
  'Distintivo Especialidade'
];

export const RAMOS: Ramo[] = [
  'Lobinho',
  'Escoteiro',
  'Sênior', 
  'Pioneiro',
  'Jovens',
  'Escotista',
  'Todos'
];