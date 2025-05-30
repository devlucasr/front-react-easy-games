import axios from 'axios'

interface NewProposta {
  anuncioId: number
  valor?: number
  mensagem: string
}

export const createProposta = async (prosposta: NewProposta, token: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/proposta`,
      prosposta
      ,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response?.data?.message || 'Erro desconhecido ao criar proposta.');
      } else {
        throw new Error('Erro desconhecido ao criar proposta.');
      }
    }
}

export const getPropostasByUser = async (token: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/proposta/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return []
    } 
    return []
  }
}

export const getPropostasByAnuncio = async (token: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/proposta/anuncio`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return []
    } 
    return []
  }
}

export const acceptedProposta = async (propostaId: number, token: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/proposta/${propostaId}/aceitar/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return []
    } else {
      throw new Error('Erro desconhecido ao aceitar proposta.');
    }
  }
};

export const finishProposta = async (propostaId: number, token: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/proposta/${propostaId}/finalizar/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return []
    } else {
      throw new Error('Erro desconhecido ao aceitar proposta.');
    }
  }
};

export const refuseProposta = async (propostaId: number, token: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/proposta/${propostaId}/recusar/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Erro ao recusar proposta.');
    } else {
      throw new Error('Erro desconhecido ao recusar proposta.');
    }
  }
};


