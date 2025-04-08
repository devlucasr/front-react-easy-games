import { Anuncio, AnuncioCreate, responseCreteAnuncio } from '@/types/types';
import axios from 'axios';

export const fetchAnuncios = async (userId?: string, token?: string, excludeUser: boolean = false): Promise<Anuncio[]> => {
  try {
    let url = 'http://192.168.1.19:8080/anuncio';

    if (excludeUser && userId) {
      url += `?excludeUserId=${userId}`;
    } else if (userId) {
      url += `?userId=${userId}`;
    }

    const headers = token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : {};

    const response = await axios.get(url, { headers });
    return response.data?.anuncios?.anuncios || [];
  } catch (error) {
    console.error('Erro ao carregar os anúncios:', error);
    throw error;
  }
};

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

    const response = await axios.post('http://192.168.1.19:8080/anuncio', formData, { headers });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Erro desconhecido ao cadastrar anúncio.')
    } else {
      throw new Error('Erro desconhecido ao cadastrar.')
    }
  }
};
