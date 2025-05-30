import axios from 'axios'

export const registerUser = async (userData: {
  nome: string
  sobrenome: string
  email: string
  celular: string
  cep: string
  senha: string
}) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_URL_BACKEND}/user/register`, userData)
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Erro desconhecido ao cadastrar usuário.')
    } else {
      throw new Error('Erro desconhecido ao cadastrar usuário.')
    }
  }
}

export const updateUser = async (
  userId: number,
  userData?: {
    nome?: string;
    sobrenome?: string;
    celular?: string;
    cep?: string;
  },
  token?: string,
  foto?: File,
  oldFotoUrl?: string,
) => {
  try {
    if (userData){
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/user/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { userData: response.data };
    }

    if (foto) {
      const formData = new FormData();
      formData.append('foto', foto);
      formData.append('oldFotoUrl', oldFotoUrl ?? "")

      const uploadResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/user/${userId}/upload-foto`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { photoData: uploadResponse.data };
    }

  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Erro desconhecido ao atualizar o usuário.');
    } else {
      throw new Error('Erro desconhecido ao atualizar o usuário.');
    }
  }
};

export const getUserById = async (userId: string, token: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/user/${userId}`,
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
      throw new Error(error.response?.data?.message || 'Erro ao buscar usuário.')
    } else {
      throw new Error('Erro desconhecido ao buscar usuário.')
    }
  }
}