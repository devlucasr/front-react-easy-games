import { Anuncio, AnuncioCreate, responseAnuncioUpdate, responseCreteAnuncio } from '@/types/types';
import axios from 'axios';

export const fetchAnuncios = async (userId?: string, token?: string, excludeUser: boolean = false): Promise<Anuncio[]> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_URL_BACKEND}/anuncio`;

    if (excludeUser && userId) {
      url += `?excludeUserId=${userId}&excludeStatus=fechado`;
    } else if (userId) {
      url += `?userId=${userId}&excludeStatus=fechado`;
    } else {
      url += `?excludeStatus=fechado`;
    }

    const headers = token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : {};

    const response = await axios.get(url, { headers });
    return response.data?.anuncios?.anuncios || [];
  }catch (error: unknown) {
    if(axios.isAxiosError(error) && error.response?.data?.message === 'Anúncio não encontrado.'){
      return []
    }
    return []
  }
};

export const fetchAnunciosComFiltro = async (
  filters: {
    titulo?: string
    descricao?: string
    status?: string
    userId?: string
    consoleId?: number
    avaliacaoMinima?: number
    tipo?: 'venda' | 'troca' | 'ambos'
    valorMin?: number
    valorMax?: number
  },
  token?: string
): Promise<Anuncio[]> => {
  try {
    const params = new URLSearchParams()

    if (filters.titulo) params.append('titulo', filters.titulo)
    if (filters.descricao) params.append('descricao', filters.descricao)
    if (filters.status) params.append('status', filters.status)
    if (filters.userId) params.append('userId', filters.userId)
    if (filters.consoleId !== undefined) params.append('consoleId', String(filters.consoleId))
    if (filters.avaliacaoMinima !== undefined) params.append('avaliacaoMinima', String(filters.avaliacaoMinima))
    if (filters.tipo) params.append('tipo', filters.tipo)
    if (filters.valorMin !== undefined) params.append('valorMin', String(filters.valorMin))
    if (filters.valorMax !== undefined) params.append('valorMax', String(filters.valorMax))

    const url = `${process.env.NEXT_PUBLIC_URL_BACKEND}/anuncio?${params.toString()}`

    const headers = token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : {}

    const response = await axios.get(url, { headers })

    return response.data?.anuncios?.anuncios || []
  } catch (error: unknown) {
    if(axios.isAxiosError(error) && error.response?.data?.message === 'Anúncio não encontrado.'){
      return []
    }
    return []
  }
}

export const createAnuncio = async (
  anuncioData: AnuncioCreate,
  token: string
): Promise<responseCreteAnuncio> => {
  try {
    const formData = new FormData();

    formData.append('titulo', anuncioData.titulo);
    formData.append('descricao', anuncioData.descricao);
    formData.append('consoleId', anuncioData.consoleId.toString());
    formData.append('valor', anuncioData.valor.toString());
    formData.append('venda', anuncioData.venda.toString());
    formData.append('troca', anuncioData.troca.toString());

    if (anuncioData.foto) {
      formData.append('foto', anuncioData.foto);
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    };

    const response = await axios.post(`${process.env.NEXT_PUBLIC_URL_BACKEND}/anuncio`, formData, { headers });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Erro desconhecido ao cadastrar anúncio.')
    } else {
      throw new Error('Erro desconhecido ao cadastrar.')
    }
  }
};

export const updateAnuncio = async (
  id: number,
  anuncioData: Partial<{
    titulo: string;
    descricao: string;
    valor: number;
    consoleId: number;
    venda: boolean;
    troca: boolean;
    foto: File;
  }>,
  token: string
): Promise<responseAnuncioUpdate> => {
  try {
    const formData = new FormData();

    if (anuncioData.titulo) formData.append('titulo', anuncioData.titulo);
    if (anuncioData.descricao) formData.append('descricao', anuncioData.descricao);
    if (anuncioData.valor !== undefined) formData.append('valor', anuncioData.valor.toString());
    if (anuncioData.consoleId !== undefined) formData.append('consoleId', anuncioData.consoleId.toString());
    if (anuncioData.venda !== undefined) formData.append('venda', anuncioData.venda.toString());
    if (anuncioData.troca !== undefined) formData.append('troca', anuncioData.troca.toString());
    if (anuncioData.foto) formData.append('foto', anuncioData.foto);

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    };

    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/anuncio/${id}`,
      formData,
      { headers }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar o anúncio.');
    } else {
      throw new Error('Erro desconhecido ao atualizar o anúncio.');
    }
  }
};

export const deleteAnuncio = async (
  id: number,
  token: string
): Promise<responseAnuncioUpdate> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/anuncio/${id}`,
      { headers }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Erro desconhecido ao deletar anúncio.')
    } else {
      throw new Error('Erro desconhecido ao deletar o anúncio.')
    }
  }
};
