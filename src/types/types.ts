export interface User {
  id: number
  nome: string
  sobrenome: string
  email: string
  celular: string
  roleAdmin: boolean
  fotoUrl: string
  createdAt: string
  updatedAt: string
  enderecoId: number
  cep?: string
  endereco: {
    id: number
    cep: string
    rua: string
    bairro: string
    cidade: string
    uf: string
  }
}

export interface AnuncioCreate {
  id?: number;
  titulo: string;
  descricao: string;
  valor: number;
  venda: boolean;
  troca: boolean;
  status?: 'aberto' | 'negociando' | 'fechado';
  foto: File | null; 
  fotoUrl?: string;
  consoleId: number;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface PropostaCreate{
    anuncioId: number,
    valor?: number,
    mensagem: string
}

export interface responseCreteAnuncio {
  message: string
  cadastrado: boolean
  anuncio: {
    id: number;
    titulo: string;
    descricao: string;
    valor: number;
    venda: boolean;
    troca: boolean;
    status: 'aberto' | 'negociando' | 'fechado';
    fotoUrl?: string;
    userId: number;
    consoleId: number;
    createdAt: string;
    updatedAt: string;
  }
}

export interface responseAnuncioUpdate {
  message: string
  deletado: boolean
}

export interface Anuncio {
  id: number;
  titulo: string;
  descricao: string;
  valor: number;
  venda: boolean;
  troca: boolean;
  status: 'aberto' | 'negociando' | 'fechado';
  fotoUrl?: string;
  foto?: File;
  userId: number;
  user: User
  consoleId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Avaliacao {
  id: number
  estrelas: number
  comentario: string
  createdAt: Date
  updatedAt: Date
  avaliadorId: number
  avaliadoId: number
  anuncioId: number
  propostaId: number
}

export interface responseProposta {
  id: number
  valor: number
  mensagem: string
  status: StatusProposta
  userId: number
  anuncioId: number
  createdAt: string
  updatedAt: string
  tipo: string,
  anuncio: Anuncio
  user: User
  avaliacao: Avaliacao
}

export enum StatusProposta{
  Pendente = 'pendente',
  Negociando = 'negociando',
  Fechada = 'fechada',
  Recusada = 'recusada',
}

export type StatusAnuncio = "todos" | "aberto" | "negociando" | "fechado"


export enum ConsoleEnum {
  PS1 = 1,
  PS2 = 2,
  PS3 = 3,
  PS4 = 4,
  PS5 = 5,
  XBOX_360 = 6,
  XBOX_ONE = 7,
  XBOX_SERIES = 8,
}
