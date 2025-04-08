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
    const response = await axios.post('http://192.168.1.19:8080/user/register', userData)
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
  userData: {
    nome?: string;
    sobrenome?: string;
    celular?: string;
    cep?: string;
  },
  token: string,
  foto?: File,
  oldFotoUrl?: string,
) => {
  try {
    const response = await axios.patch(
      `http://192.168.1.19:8080/user/${userId}`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (foto) {
      const formData = new FormData();
      formData.append('foto', foto);
      formData.append('oldFotoUrl', oldFotoUrl ?? "")

      const uploadResponse = await axios.post(
        `http://192.168.1.19:8080/user/${userId}/upload-foto`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { userData: response.data, photoData: uploadResponse.data };
    }

    return { userData: response.data };

  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Erro desconhecido ao atualizar o usuário.');
    } else {
      throw new Error('Erro desconhecido ao atualizar o usuário.');
    }
  }
};