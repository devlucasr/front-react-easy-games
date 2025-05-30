import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { toast, ToastContainer, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Image from 'next/image'
import { MdAutorenew, MdCheckCircle, MdCancel, MdLocationPin, MdKeyboardArrowDown, MdAttachMoney, MdEdit, MdDelete, MdStar  } from "react-icons/md"
import { FaWhatsapp } from 'react-icons/fa';
import { Anuncio, StatusAnuncio, User, responseProposta } from '../types/types'
import HeaderHome from '../components/HeaderHome'
import { deleteAnuncio, fetchAnuncios, updateAnuncio } from '../services/anuncioService'
import { getUserById, updateUser } from '../services/userService'
import { getPropostasByUser, getPropostasByAnuncio, acceptedProposta, refuseProposta, finishProposta } from '../services/propostaService'
import { createAvaliacao } from '@/services/avaliacaoService'


const DashboardUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoadingCheck, setButtonLoadingCheck] = useState<boolean>(false);
  const [buttonLoadingCancel, setButtonLoadingCancel] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('anuncios');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [propostas, setPropostas] = useState<responseProposta[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'recebida' | 'enviada'>('todas');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'negociando' | 'fechada' |'recusada'>('todos');
  const [filtroStatusAnuncio, setFiltroStatusAnuncio] = useState<StatusAnuncio>("todos");
  const [idPropostaQuery, setidPropostaQuery] = useState<string | null>(null);
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(0);
  const [mensagemAvaliacao, setMensagemAvaliacao] = useState('');
  const [isModalAvaliacaoOpen, setIsModalAvaliacaoOpen] = useState(false);
  const [propostaParaAvaliar, setPropostaParaAvaliar] = useState<number | null>(null);
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
      const response = await getUserById(userId, token)

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
      handleSignOut();
      console.error(error);
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
        setAnuncios([])
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

  const handleDeleteAnuncio = useCallback(async (anuncioId: number) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) return;
    setButtonLoadingCancel(true);
    try {
      if (token) {
        const response = await deleteAnuncio(anuncioId, token);
  
        if (response.message === "Token inválido") {
          handleSignOut();
          return;
        }
  
        toast.success('Anúncio excluído com sucesso!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnFocusLoss: false,
          pauseOnHover: true,
          icon: <MdCheckCircle />
        });
  
        setButtonLoadingCancel(false);
        handleCloseModal();

        const parsedUser = JSON.parse(storedUser);
        await loadPropostas(token);
        await loadAnuncios(parsedUser.id, token);
        return;
      }
  
      handleSignOut();
      router.replace('/login');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Falha ao excluir anúncio. Tente novamente.';
      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        className: 'toast-error',
        progressClassName: 'toast-progress-bar',
        icon: <MdCancel />,
        transition: Bounce
      });
      setButtonLoadingCancel(false);
    }
  }, [router, handleSignOut, handleCloseModal]);
  
  const loadPropostas = useCallback(async (token: string) => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        getPropostasByUser(token),
        getPropostasByAnuncio(token)
      ]);
  
      if (!sentResponse || !receivedResponse) {
        console.error('Error loading propostas');
        setError('Error loading propostas');
        toast.error('Error loading propostas', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnFocusLoss: false,
          pauseOnHover: true,
          theme: 'colored'
        });
        return;
      }

      const allPropostas = [
        ...(sentResponse.propostas || []).map((p: responseProposta) => ({ ...p, type: 'sent' })),
        ...(receivedResponse.proposta || []).map((p: responseProposta) => ({ ...p, type: 'sent' }))
      ];
  
      setPropostas(allPropostas);
    } catch (error) {
      setPropostas([])
      console.error('Error loading propostas:', error);
    }
  }, [setError]);

  const handleAceitarProposta = async (propostaId: number) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) return;
    setButtonLoadingCheck(true)
    try {
      await acceptedProposta(propostaId, token);
      toast.success('Proposta aceita com sucesso!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        icon: <MdCheckCircle/>
    });
      setButtonLoadingCheck(false)
      const parsedUser = JSON.parse(storedUser);
      await loadPropostas(token);
      await loadAnuncios(parsedUser.id, token);
    } catch (error) {
      setButtonLoadingCheck(false)
      toast.error('Erro ao aceitar proposta.');
      console.error(error);
    }
  };

  const handleFinalizarProposta = async (propostaId: number) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) return;
    setButtonLoadingCheck(true)
    try {
      await finishProposta(propostaId, token);
      toast.success('Proposta finalizada com sucesso!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        icon: <MdCheckCircle/>
      });
      const parsedUser = JSON.parse(storedUser);
      await loadPropostas(token);
      await loadAnuncios(parsedUser.id, token);
      setButtonLoadingCheck(false)
    } catch (error) {
      toast.error('Erro ao finalizar proposta.');
      console.error(error);
      setButtonLoadingCheck(false)
    }
  };
  
  const handleRecusarProposta = async (propostaId: number) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) return;
    setButtonLoadingCancel(true)
    try {
      await refuseProposta(propostaId, token);
      toast.success('Prosposta recusada com sucesso!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        icon: <MdCheckCircle/>
    });
      const parsedUser = JSON.parse(storedUser);
      await loadPropostas(token);
      await loadAnuncios(parsedUser.id, token);
      setButtonLoadingCancel(false)
    } catch (error) {
      toast.error('Erro ao recusar proposta.');
      console.error(error);
      setButtonLoadingCancel(false)
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    if (router.query.tab) {
      setActiveTab(router.query.tab as string);
    }

    if (router.query.id) {
      setidPropostaQuery(router.query.id as string);
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      fetchUserData(parsedUser.id, token);
      loadAnuncios(parsedUser.id, token);
      loadPropostas(token);
    } catch (error) {
      console.error('Erro ao parsear usuário:', error);
      localStorage.removeItem('user');
      router.replace('/login');
    }
  }, [router, fetchUserData, loadAnuncios, loadPropostas]);

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
    
    const hasChangesDados = Object.keys(updatedData).length > 0
    const hasChangesFoto = newPhoto !== null;
  
    if (!hasChangesDados && !hasChangesFoto) {
      toast.info('Nenhuma alteração detectada', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        theme: 'colored'
      })
      return
    }

    try {

      let userData
      let photoData
      
      if (hasChangesDados) {
        const result = await updateUser(user.id, updatedData, token, undefined, undefined)
        userData = result?.userData
      }
      
      if (hasChangesFoto) {
        const result = await updateUser(user.id, undefined, token, newPhoto, oldPhoto)
        photoData = result?.photoData
      }

      const messages = [
        userData?.message,
        photoData?.message
      ].filter(Boolean).join(' | ')
      
      toast.success(messages, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        theme: 'colored'
      })
  
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

  const handleSaveAnuncioChanges = async () => {
    setButtonLoadingCheck(true);
    if (!selectedAnuncio || !selectedAnuncio.id) return;
  
    try {
      const token = localStorage.getItem("token");
      if (!token) return
  
      const updatedData = {
        titulo: selectedAnuncio.titulo,
        descricao: selectedAnuncio.descricao,
        valor: selectedAnuncio.valor,
        consoleId: selectedAnuncio.consoleId,
        foto: selectedAnuncio.foto 
      };
  
      await updateAnuncio(selectedAnuncio.id, updatedData, token);
      toast.success("Anúncio atualizado com sucesso!");
      setIsModalOpen(false);
      fetchAnuncios();
      setButtonLoadingCheck(false);
    } catch (error: unknown) {
      setButtonLoadingCheck(false);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro desconhecido.");
      }
    }
    
  };

  const handleCreateAvaliacao = async ({ propostaId, nota, comentario }: { propostaId: number | null, nota: number, comentario: string }) => {
    if (!propostaId || nota === 0) return;

    const token = localStorage.getItem('token');
  
    try {
      if (!token) return
      const proposta = propostas.find(p => p.id === propostaId);

      if (proposta) {
        await createAvaliacao(
          {
            anuncioId: proposta.anuncioId,
            propostaId: propostaId,
            estrelas: nota,
            comentario,
          },
          token
        );

        toast.success('Avaliação enviada com sucesso!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnFocusLoss: false,
          pauseOnHover: true,
          icon: <MdCheckCircle />
        });
      }

      await loadPropostas(token)
  
    } catch (error) {
      console.error('Erro ao enviar avaliação', error);
    }
  };

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
          avatarUser: photoUrl || '',
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
                {['anuncios', 'meus dados', 'propostas'].map(tab => (
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
            <div className="flex flex-col gap-6 p-4 md:p-6">
              {/* Filtro de Status */}
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-sm text-white mb-2">Status</label>
                  <div className="relative">
                    <select
                      className="bg-cardBackground text-white px-4 py-2 pr-10 rounded-lg text-sm w-full appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                      value={filtroStatusAnuncio}
                      onChange={(e) => setFiltroStatusAnuncio(e.target.value as StatusAnuncio)}
                    >
                      <option value="todos">Todos</option>
                      <option value="aberto">Aberto</option>
                      <option value="negociando">Negociando</option>
                      <option value="fechado">Fechado</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <MdKeyboardArrowDown className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Anúncios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {anuncios
                  .filter(anuncio => filtroStatusAnuncio === 'todos' || anuncio.status === filtroStatusAnuncio)
                  .map((anuncio) => (
                    <div
                      key={anuncio.id}
                      className="bg-cardBackground rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl relative"
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
                        <h4 className="text-xl text-white font-semibold break-words">{anuncio.titulo}</h4>

                        <div className="flex justify-between items-center">
                          <p className="text-lg text-white font-bold">R${anuncio.valor}</p>
                          <span className={`text-xs py-1 px-3 rounded-full font-medium ${
                            anuncio.status === 'aberto' ? 'bg-green-500 text-white' :
                            anuncio.status === 'fechado' ? 'bg-gray-400 text-gray-200' :
                            'bg-yellow-500 text-black'
                          }`}>
                            {anuncio.status.charAt(0).toUpperCase() + anuncio.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>Anunciado em {new Date(anuncio.createdAt).toLocaleDateString()} às {new Date(anuncio.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {anuncio.status === 'aberto' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAnuncio(anuncio);
                          }}
                          className="absolute top-2 right-2 bg-[#333333] border border-[#555555] hover:bg-[#012AE1] text-white p-2 rounded-full shadow-md transition-colors"
                          title="Editar Anúncio"
                        >
                          <MdEdit className="text-base" />
                        </button>
                      )}
                    </div>
                  ))}

                {anuncios.filter(anuncio => filtroStatusAnuncio === 'todos' || anuncio.status === filtroStatusAnuncio).length === 0 && (
                  <div className="col-span-full text-center text-lg text-white p-6">
                    Nenhum anúncio encontrado.
                  </div>
                )}
              </div>
            </div>
          )}
          {isModalOpen && selectedAnuncio && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50">
              <div className="bg-cardBackground p-6 rounded-lg w-3/4 md:w-1/2 lg:w-1/3 relative">
                <h2 className="text-2xl font-semibold text-[#FFFFFF] mb-4">Editar Anúncio</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="titulo">Título</label>
                  <input
                    type="text"
                    id="titulo"
                    value={selectedAnuncio.titulo}
                    onChange={(e) =>
                      setSelectedAnuncio({ ...selectedAnuncio, titulo: e.target.value })
                    }
                    className="mt-1 p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    value={selectedAnuncio.descricao}
                    onChange={(e) =>
                      setSelectedAnuncio({ ...selectedAnuncio, descricao: e.target.value })
                    }
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
                    onChange={(e) =>
                      setSelectedAnuncio({
                        ...selectedAnuncio,
                        valor: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="consoleId">Console</label>
                  <select
                    id="consoleId"
                    value={selectedAnuncio.consoleId}
                    onChange={(e) =>
                      setSelectedAnuncio({
                        ...selectedAnuncio,
                        consoleId: parseInt(e.target.value),
                      })
                    }
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

                <div className="mb-4">
                  <label className="block text-sm font-medium text-white" htmlFor="foto">Foto</label>
                  <input
                    type="file"
                    id="foto"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedAnuncio((prev) => prev ? { ...prev, foto: file } : prev);
                      }
                    }}
                    className="mt-1 p-2 bg-[#333333] border border-[#555555] rounded-lg text-white w-full"
                  />
                </div>

                {/* Verifique se o status é "aberto" */}
                {selectedAnuncio.status === "aberto" && (
                  <button
                    onClick={() => handleDeleteAnuncio(selectedAnuncio.id)}
                    className="absolute top-2 right-2 flex items-center gap-1 text-red-600 hover:text-red-800 px-2 py-1 border border-red-600 rounded-full text-xs"
                  >
                    <MdDelete size={18} />
                    <span className="hidden sm:inline">Excluir</span>
                  </button>
                )}

                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={async () => {
                      await handleSaveAnuncioChanges();
                      setButtonLoadingCheck(false);
                    }}
                    disabled={buttonLoadingCheck}
                    className="flex items-center gap-1 px-4 py-2 bg-[#012AE1] hover:bg-[#00C898] text-white rounded-lg text-sm font-medium shadow-md transition"
                  >
                    {buttonLoadingCheck ? (
                      <MdAutorenew className="text-lg animate-spin"/>
                    ) : (
                      <>Salvar</>
                    )}
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
                  <div
                    className="relative w-20 h-20 cursor-pointer group"
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <Image
                      src={photoUrl || ''}
                      alt=""
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                    />

                    {/* Exibe o texto apenas se não houver foto */}
                    {!photoUrl && (
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-[10px] text-white text-center px-2">
                        Foto perfil
                      </div>
                    )}
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
            <div className="flex flex-col gap-6 p-4 md:p-6">
              {/* Filtros */}
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-sm text-white mb-2">Tipo</label>
                  <div className="relative">
                    <select
                      className="bg-cardBackground text-white px-4 py-2 pr-10 rounded-lg text-sm w-full appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value as 'todas' | 'recebida' | 'enviada')}
                    >
                      <option value="todas">Todas</option>
                      <option value="recebida">Recebidas</option>
                      <option value="enviada">Enviadas</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <MdKeyboardArrowDown className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-sm text-white mb-2">Status</label>
                  <div className="relative">
                    <select
                      className="bg-cardBackground text-white px-4 py-2 pr-10 rounded-lg text-sm w-full appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value as 'todos' | 'pendente' | 'negociando' | 'fechada' | 'recusada')}
                    >
                      <option value="todos">Todos</option>
                      <option value="pendente">Pendente</option>
                      <option value="negociando">Negociando</option>
                      <option value="fechada">Fechada</option>
                      <option value="recusada">Recusada</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <MdKeyboardArrowDown className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {propostas
                  .filter((proposta) => {
                    const tipoOk = filtroTipo === 'todas' || proposta.tipo === filtroTipo;
                    const statusOk = filtroStatus === 'todos' || proposta.status === filtroStatus;
                    const idOk = idPropostaQuery ? proposta.id.toString() === idPropostaQuery : true;
                    return tipoOk && statusOk && idOk;
                  })
                  .map((proposta) => {
                    const statusColors = {
                      pendente: 'bg-yellow-500 text-black',
                      negociando: 'bg-blue-500 text-white',
                      aceita: 'bg-green-500 text-white',
                      recusada: 'bg-red-500 text-white',
                      fechada: 'bg-gray-500 text-white',
                    };

                    const statusStyle = statusColors[proposta.status] || 'bg-gray-400 text-white';

                    const typeLabel = proposta.tipo === 'recebida' ? 'Recebida' : 'Enviada';
                    const typeStyle =
                      proposta.tipo === 'recebida'
                        ? 'bg-[#00C898] text-white'
                        : 'bg-[#012AE1] text-white';

                    const celular = proposta.tipo === 'recebida'
                      ? proposta.user.celular
                      : proposta.anuncio.user.celular;

                    const celularLimpo = celular.replace(/\D/g, '');
                    const linkWhatsApp = `https://wa.me/55${celularLimpo}`;

                    

                    return (
                      <div
                        key={proposta.id}
                        className="bg-cardBackground rounded-2xl shadow-lg p-4 flex flex-col gap-4"
                      >
                        {/* Header com status e tipo */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-1 break-words leading-snug">
                              {proposta.anuncio.titulo}
                            </h4>

                            {proposta.tipo === 'recebida' && (
                              <p className="text-sm text-gray-300">{proposta.user.nome}</p>
                            )}

                            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                              <MdLocationPin className="text-base text-white" />
                              {proposta.tipo === 'recebida'
                                ? proposta.anuncio.user.endereco?.cidade
                                : proposta.user.endereco?.cidade}
                            </p>

                            <div className="flex gap-2 mt-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeStyle}`}>
                                {typeLabel}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
                                {proposta.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Valor */}
                        {proposta.anuncio.venda && proposta.valor !== undefined && (
                          <div className="flex items-center text-white text-base font-semibold gap-1">
                            <MdAttachMoney className="text-green-400 text-xl" />
                            {proposta.valor.toFixed(2)}
                          </div>
                        )}

                        {/* Contato - WhatsApp */}
                        {(proposta.tipo === 'recebida' || (proposta.tipo === 'enviada' && proposta.status === 'negociando')) && (
                          <div className="text-sm text-gray-300 flex items-center gap-2">
                            <FaWhatsapp className="text-green-500 text-lg" />
                            <a
                              href={linkWhatsApp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline text-white"
                              style={{ textDecoration: 'none' }}
                            >
                              {celular}
                            </a>
                          </div>
                        )}

                        {/* Mensagem */}
                        <div className="text-sm text-white mt-2">
                          <span className="font-semibold">Mensagem:</span>{' '}
                          <span className="font-normal">{proposta.mensagem}</span>
                        </div>

                        {/* Ações para propostas recebidas em pendente */}
                        {proposta.tipo === 'recebida' && proposta.status === 'pendente' && (
                          <div className="mt-3 border-t border-gray-700 pt-3">
                            <div className="flex gap-3 justify-center">
                              <button
                                disabled={buttonLoadingCheck}
                                onClick={() => handleAceitarProposta(proposta.id)}
                                className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium shadow-md"
                              >
                                {buttonLoadingCheck ? (
                                  <MdAutorenew className="text-lg animate-spin" />
                                ) : (
                                  <MdCheckCircle className="text-lg" />
                                )}
                                Negociar
                              </button>
                              <button
                                disabled={buttonLoadingCancel}
                                onClick={() => handleRecusarProposta(proposta.id)}
                                className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium shadow-md"
                              >
                                {buttonLoadingCancel ? (
                                  <MdAutorenew className="text-lg animate-spin" />
                                ) : (
                                  <MdCancel className="text-lg" />
                                )}
                                Recusar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Ações para propostas recebidas em negociando */}
                        {proposta.tipo === 'recebida' && proposta.status === 'negociando' && (
                          <div className="mt-3 border-t border-gray-700 pt-3">
                            <div className="flex gap-3 justify-center">
                              <button
                                disabled={buttonLoadingCheck}
                                onClick={() => handleFinalizarProposta(proposta.id)}
                                className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium shadow-md"
                              >
                                {buttonLoadingCheck ? (
                                  <MdAutorenew className="text-lg animate-spin" />
                                ) : (
                                  <MdCheckCircle className="text-lg" />
                                )}
                                Finalizar
                              </button>
                              <button
                                disabled={buttonLoadingCancel}
                                onClick={() => handleRecusarProposta(proposta.id)}
                                className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium shadow-md"
                              >
                                {buttonLoadingCancel ? (
                                  <MdAutorenew className="text-lg animate-spin" />
                                ) : (
                                  <MdCancel className="text-lg" />
                                )}
                                Recusar
                              </button>
                            </div>
                          </div>
                        )}
                        {proposta.tipo === 'enviada' && proposta.status === 'fechada' && (
                          <div className="flex gap-1 mt-2 items-center">
                            {proposta.avaliacao? (
                              // Exibe as estrelas da avaliação existente
                              [...Array(5)].map((_, index) => (
                                <MdStar
                                  key={index}
                                  className={`text-2xl ${
                                    index < proposta.avaliacao.estrelas ? 'text-yellow-400' : 'text-gray-500'
                                  }`}
                                />
                              ))
                            ) : (
                              // Exibe as estrelas clicáveis se ainda não foi avaliado
                              [...Array(5)].map((_, index) => {
                                const star = index + 1;
                                return (
                                  <button
                                    key={star}
                                    onClick={() => {
                                      setAvaliacaoSelecionada(star);
                                      setPropostaParaAvaliar(proposta.id);
                                      setIsModalAvaliacaoOpen(true);
                                    }}
                                  >
                                    <MdStar
                                      className={`text-2xl ${
                                        star <= avaliacaoSelecionada ? 'text-yellow-400' : 'text-gray-500'
                                      }`}
                                    />
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}

                {propostas.filter((proposta) => {
                  const tipoOk = filtroTipo === 'todas' || proposta.tipo === filtroTipo;
                  const statusOk = filtroStatus === 'todos' || proposta.status === filtroStatus;
                  const idOk = idPropostaQuery ? proposta.id.toString() === idPropostaQuery : true;
                  return tipoOk && statusOk && idOk;
                }).length === 0 && (
                  <div className="col-span-3 text-center text-lg text-white p-6">
                    Nenhuma proposta encontrada.
                  </div>
                )}
                {isModalAvaliacaoOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50 p-4">
                    <div className="bg-cardBackground p-4 rounded-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                      <h2 className="text-xl text-white font-semibold mb-4">Deixe sua avaliação</h2>

                      {/* Estrelas no modal */}
                      <div className="flex gap-1 mb-4 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <MdStar
                            key={star}
                            className={`text-3xl cursor-pointer ${
                              star <= avaliacaoSelecionada ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                            onClick={() => setAvaliacaoSelecionada(star)}
                          />
                        ))}
                      </div>

                      {/* Comentário */}
                      <textarea
                        placeholder="Escreva um comentário..."
                        value={mensagemAvaliacao}
                        onChange={(e) => setMensagemAvaliacao(e.target.value)}
                        className="w-full p-3 bg-[#333333] border border-[#555555] text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        rows={4}
                      />

                      {/* Botões */}
                      <div className="flex justify-between">
                        <button
                          onClick={() => setIsModalAvaliacaoOpen(false)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                        >
                          Cancelar
                        </button>
                        
                        <button
                          onClick={async () => {
                            setButtonLoadingCheck(true);
                            await handleCreateAvaliacao({
                              propostaId: propostaParaAvaliar,
                              nota: avaliacaoSelecionada,
                              comentario: mensagemAvaliacao,
                            });
                            setButtonLoadingCheck(false);
                            setIsModalAvaliacaoOpen(false);
                            setMensagemAvaliacao('');
                            setAvaliacaoSelecionada(0);
                          }}
                          disabled={buttonLoadingCheck}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow-md transition"
                        >
                          {buttonLoadingCheck ? (
                            <MdAutorenew className="text-xl animate-spin" />
                          ) : (
                            "Enviar Avaliação"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        theme="colored"
      />
    </div>
  )
}

export default DashboardUser
