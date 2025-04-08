import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Image from 'next/image'
import { MdAutorenew } from "react-icons/md"
import { Anuncio, User } from '../types/types'
import HeaderHome from '../components/HeaderHome'
import { fetchAnuncios } from '../services/anuncioService'
import { updateUser } from '../services/userService'


const DashboardUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('anuncios');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [celular, setCelular] = useState('');
  const [cep, setCep] = useState('');

  const router = useRouter();

  const handleEditAnuncio = (anuncio: Anuncio) => {
    setSelectedAnuncio(anuncio)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAnuncio(null)
  }


  const handleSignOut = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Desconectado com sucesso!', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnFocusLoss: false,
      pauseOnHover: true,
      theme: 'colored',
    });
    router.push('/login');
  }, [router]);

  const fetchUserData = useCallback(async (userId: string, token: string) => {
    try {
      const response = await fetch(`http://192.168.1.19:8080/user/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        handleSignOut();
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do usuário');
      }

      const data = await response.json();
      setUser(data?.user)
      setNome(data?.user?.nome)
      setSobrenome(data?.user?.sobrenome)
      setCelular(data?.user?.celular)
      setCep(data?.user?.endereco?.cep)
      setPhotoUrl(data?.user?.fotoUrl)
    } catch (error) {
      console.error(error);
      setError('Erro ao carregar dados');
      toast.error('Erro ao carregar dados', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  }, [handleSignOut]);

  const loadAnuncios = useCallback(async (userId: string, token: string) => {
    try {
        const response = await fetchAnuncios(userId, token);

        if (!response) {
            console.error('Erro ao carregar os anúncios');
            setError('Erro ao carregar anúncios');
            toast.error('Erro ao carregar anúncios', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnFocusLoss: false,
                pauseOnHover: true,
                theme: 'colored',
            });
        }
        setAnuncios(response);
    } catch (error) {
        console.error('Erro ao carregar os anúncios:', error);
        setError('Erro ao carregar anúncios');
        toast.error('Erro ao carregar anúncios', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnFocusLoss: false,
            pauseOnHover: true,
            theme: 'colored',
        });
    }
}, [setError]); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      fetchUserData(parsedUser.id, token);
      loadAnuncios(parsedUser.id, token);
    } catch (error) {
      console.error('Erro ao parsear usuário:', error);
      localStorage.removeItem('user');
      router.replace('/login');
    }
  }, [router, fetchUserData, loadAnuncios]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUserChanges = async () => {
    if (!user) return;
  
    const token = localStorage.getItem('token');
    const oldPhoto = user.fotoUrl

    if (!token) return;
  
    const updatedData: Partial<User> = {};

    if (nome !== user.nome) {
      updatedData.nome = nome;
    }
    if (sobrenome !== user.sobrenome) {
      updatedData.sobrenome = sobrenome;
    }
    if (celular !== user.celular) {
      updatedData.celular = celular;
    }
    if (cep !== user.endereco.cep) {
      updatedData.cep = cep;
    }
    
    const hasChanges = Object.keys(updatedData).length > 0 || newPhoto !== null;
  
    if (!hasChanges) {
      toast.info('Nenhuma alteração detectada!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        theme: 'colored',
      });
      return;
    }
  
    try {

      const { userData, photoData } = await updateUser(user.id, updatedData, token, newPhoto ?? undefined, oldPhoto ?? undefined);
  
      toast.success(`${userData.message}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        theme: 'colored',
      });
  
      fetchUserData(user.id.toString(), token)
      setPhotoUrl(photoData?.fotoUrl || photoUrl);
    } catch (error: unknown) {
      if (typeof error === 'string') {
        toast.error(`${error}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnFocusLoss: false,
          pauseOnHover: true,
          theme: 'colored',
        });
      } else if (error instanceof Error) {
        toast.error(`${error.message}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnFocusLoss: false,
          pauseOnHover: true,
          theme: 'colored',
        });
      }
    }
  };

  const handleSaveAnuncioChanges = async () => {}

  if (loading) {
    return (
      <div className="flex justify-center items-center space-x-2">
        <MdAutorenew className="animate-spin text-black text-3xl" />
        <span className="text-black">Carregando...</span>
      </div>
    );
  }      

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cardBackground">
        <div>{error}</div>
      </div>
    );
  }


  return (
    <div>
      <HeaderHome
        user={{
          logo: '/images/logotipo.png',
          avatarUser: photoUrl || '/images/default-avatar.png',
          onHomeClick: handleSignOut,
          onMenuClick: () => setIsMenuOpen(!isMenuOpen),
        }}
      />
      <div className="flex flex-col lg:flex-row min-h-screen bg-cardBackground pt-20">
        {/* Div da esquerda (menu lateral) */}
        {router.pathname === '/dashboardUser' && (
          <div
            className={`w-full lg:w-1/5 bg-cardBackground p-6 lg:p-8 rounded-lg mb-6 lg:mb-0 transition-transform transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative inset-0 lg:top-0 top-0 z-50`}
            style={{ transition: 'transform 0.3s ease' }}
          >
            <div className="flex-1 bg-cardBackground p-3 rounded-lg overflow-y-auto">
              <ul className="flex flex-col space-y-4">
                {['anuncios', 'meus dados', 'propostas', 'historico'].map(tab => (
                  <li
                    key={tab}
                    className={`cursor-pointer text-lg font-medium py-2 px-4 rounded-lg 
                      ${activeTab === tab ? 'bg-white text-[#0E0F1A] font-bold' : 'bg-transparent text-white'}`}
                    onClick={() => {
                      setActiveTab(tab)
                      setIsMenuOpen(false)
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Div da direita (conteúdo) */}
        <div className="flex-1 bg-cardBackground p-6 lg:p-33 rounded-lg w-full lg:ml-1/6">
          {activeTab === 'anuncios' && (
            <>
              {anuncios.filter(anuncio => anuncio.status !== 'fechado').length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {anuncios.filter(anuncio => anuncio.status !== 'fechado').map((anuncio) => (
                    <div
                      key={anuncio.id}
                      className="bg-cardBackground rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl relative"
                      onClick={() => handleEditAnuncio(anuncio)}
                    >
                      <div className="relative w-full h-56 overflow-hidden rounded-t-2xl">
                        <Image
                          src={anuncio.fotoUrl || '/images/default-image.png'}
                          alt={`Imagem do anúncio ${anuncio.titulo}`}
                          width={500}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-6 space-y-4">
                        <h4 className="text-xl text-white font-semibold truncate">{anuncio.titulo}</h4>

                        <div className="flex justify-between items-center">
                          <p className="text-lg text-white font-bold">R${anuncio.valor}</p>
                          <span className={`text-xs py-1 px-3 rounded-full font-medium ${
                            anuncio.status === 'aberto' ? 'bg-green-500 text-white' :
                            anuncio.status === 'fechado' ? 'bg-gray-400 text-gray-200' :
                            'bg-yellow-500 text-black'
                          }`}>
                            {anuncio.status === 'aberto' ? 'Aberto' : anuncio.status === 'fechado' ? 'Fechado' : 'Negociando'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>Anunciado em {new Date(anuncio.createdAt).toLocaleDateString()} às {new Date(anuncio.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-300">Você não tem anúncios disponíveis no momento.</p>
              )}
            </>
          )}
          {isModalOpen && selectedAnuncio && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50">
              <div className="bg-cardBackground p-6 rounded-lg w-3/4 md:w-1/2 lg:w-1/3">
                <h2 className="text-2xl font-semibold text-[#FFFFFF] mb-4">Editar Anúncio</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="titulo">Título</label>
                  <input
                    type="text"
                    id="titulo"
                    value={selectedAnuncio.titulo}
                    onChange={(e) => setSelectedAnuncio({...selectedAnuncio, titulo: e.target.value})}
                    className="mt-1 p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    value={selectedAnuncio.descricao}
                    onChange={(e) => setSelectedAnuncio({...selectedAnuncio, descricao: e.target.value})}
                    className="mt-1 p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                    rows={4}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="valor">Preço</label>
                  <input
                    type="number"
                    id="valor"
                    value={selectedAnuncio.valor}
                    onChange={(e) => setSelectedAnuncio({...selectedAnuncio, valor: parseFloat(e.target.value)})}
                    className="mt-1 p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="consoleId">Console</label>
                  <select
                    id="consoleId"
                    value={selectedAnuncio.consoleId}
                    onChange={(e) => setSelectedAnuncio({...selectedAnuncio, consoleId: parseInt(e.target.value)})}
                    className="mt-1 p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                  >
                    <option value="1">PS1</option>
                    <option value="2">PS2</option>
                    <option value="3">PS3</option>
                    <option value="4">PS4</option>
                    <option value="5">PS5</option>
                    <option value="6">XBOX 360</option>
                    <option value="7">XBOX ONE</option>
                    <option value="8">XBOX SERIES</option>
                  </select>
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={() => handleSaveAnuncioChanges(selectedAnuncio)}
                    className="bg-[#012AE1] text-white px-4 py-2 rounded-lg hover:bg-[#00C898] transition"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'meus dados' && (
            <>
              <form className="space-y-6 bg-cardBackground p-6 rounded-lg w-full">
                {/* Foto de Perfil */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    <Image
                      src={photoUrl || '/images/default-avatar.png'}
                      alt="Foto do usuário"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full cursor-pointer"
                      onClick={() => document.getElementById('fileInput')?.click()}
                    />
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Dados do Usuário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="flex flex-col w-full">
                    <label className="text-[#FFFFFF] text-sm font-medium mb-2">Nome</label>
                    <input
                      type="text"
                      className="p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>

                  {/* Sobrenome */}
                  <div className="flex flex-col w-full">
                    <label className="text-[#FFFFFF] text-sm font-medium mb-2">Sobrenome</label>
                    <input
                      type="text"
                      className="p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                      value={sobrenome}
                      onChange={(e) => setSobrenome(e.target.value)}
                    />
                  </div>

                  {/* Email (não editável) */}
                  <div className="flex flex-col w-full">
                    <label className="text-[#FFFFFF] text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="p-4 bg-[#444444] border border-[#555555] rounded-lg text-[#B0B0B0] cursor-not-allowed w-full"
                      value={user?.email || ''}
                      readOnly
                    />
                  </div>

                  {/* Celular */}
                  <div className="flex flex-col w-full">
                    <label className="text-[#FFFFFF] text-sm font-medium mb-2">Celular</label>
                    <input
                      type="text"
                      className="p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                    />
                  </div>
                </div>

                {/* Separador de Endereço */}
                <div className="border-b border-[#555555] pb-2">
                  <h2 className="text-[#FFFFFF] text-lg font-semibold">Endereço:</h2>
                </div>

                {/* Campos de Endereço */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* CEP */}
                  <div className="flex flex-col w-full">
                    <label className="text-[#FFFFFF] text-sm font-medium mb-2">CEP</label>
                    <input
                      type="text"
                      className="p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                    />
                  </div>

                  {/* Rua, Bairro, Cidade e Estado - Campos apenas leitura */}
                  <div className="flex flex-col w-full">
                    <label className="text-[#FFFFFF] text-sm font-medium mb-2">Rua</label>
                    <input
                      type="text"
                      className="p-4 bg-[#444444] border border-[#555555] rounded-lg text-[#B0B0B0] cursor-not-allowed w-full"
                      value={user?.endereco.rua || ''}
                      readOnly
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="text-[#FFFFFF] text-sm font-medium mb-2">Bairro</label>
                    <input
                      type="text"
                      className="p-4 bg-[#444444] border border-[#555555] rounded-lg text-[#B0B0B0] cursor-not-allowed w-full"
                      value={user?.endereco.bairro || ''}
                      readOnly
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="text-[#FFFFFF] text-sm font-medium mb-2">Cidade</label>
                    <input
                      type="text"
                      className="p-4 bg-[#444444] border border-[#555555] rounded-lg text-[#B0B0B0] cursor-not-allowed w-full"
                      value={user?.endereco.cidade || ''}
                      readOnly
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="text-[#FFFFFF] text-sm font-medium mb-2">Estado</label>
                    <input
                      type="text"
                      className="p-4 bg-[#444444] border border-[#555555] rounded-lg text-[#B0B0B0] cursor-not-allowed w-full"
                      value={user?.endereco.uf || ''}
                      readOnly
                    />
                  </div>
                </div>

                {/* Botão de salvar */}
                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    className="bg-[#012AE1] text-white py-3 px-8 rounded-lg hover:bg-[#00C898] transition"
                    onClick={handleSaveUserChanges}
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </>
          )}
          {activeTab === 'propostas' && (
            <h3 className="text-text text-xl font-bold">Propostas</h3>
          )}
          {activeTab === 'historico' && (
            <h3 className="text-text text-xl font-bold">Histórico</h3>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default DashboardUser
