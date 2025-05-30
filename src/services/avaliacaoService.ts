import axios from 'axios';

interface CreateAvaliacaoPayload {
  anuncioId: number;
  propostaId: number,
  estrelas: number;
  comentario: string;
}

export const createAvaliacao = async (
  payload: CreateAvaliacaoPayload,
  token: string
): Promise<void> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    await axios.post(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/avaliacao`,
      payload,
      { headers }
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || 'Erro ao criar avaliação.');
    } else {
      throw new Error('Erro desconhecido ao criar avaliação.');
    }
  }
};
