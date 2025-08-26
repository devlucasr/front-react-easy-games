import { useState, useEffect, useCallback } from 'react';
import Slider from '@mui/material/Slider'
import { useRouter } from 'next/router';
import Image from 'next/image';
import { MdAutorenew, MdAdd, MdCheckCircle, MdCancel } from "react-icons/md";
import { fetchAnuncios, createAnuncio, fetchAnunciosComFiltro } from '../services/anuncioService';
import HeaderHome from "../components/HeaderHome";
import { toast, ToastContainer, Bounce } from 'react-toastify'
import { AnuncioCreate, PropostaCreate, Anuncio } from '../types/types';
import { createProposta } from '@/services/propostaService';

const consoleImages: Record<number, string> = {
    1: '/images/ps1.png',
    2: '/images/ps2.png',
    3: '/images/ps3.png',
    4: '/images/ps4.png',
    5: '/images/xbox.png',
    6: '/images/xbox.png',
    7: '/images/xbox.png',
    8: '/images/xbox.png',
};

const consoleButtonStyles: Record<number, string> = {
    1: 'bg-black',
    2: 'bg-black',
    3: 'bg-black',
    4: 'bg-black',
    5: 'bg-green-500',
    6: 'bg-green-500',
    7: 'bg-green-500',
    8: 'bg-green-500',
};

const HomePage = () => {
    const router = useRouter();
    const [user, setUser] = useState<boolean>(false);
    const [newProposta, setNewProposta] = useState<PropostaCreate>({
        anuncioId: 0,
        valor: 0,
        mensagem: ''
    })
    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
    const [filteredAnuncios, setFilteredAnuncios] = useState<Anuncio[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false)
    const [selectedConsole, setSelectedConsole] = useState<number | ''>('')
    const [selectedRating, setSelectedRating] = useState<number>(0)
    const [selectedTipo, setSelectedTipo] = useState<string>('')
    const [minValue, setMinValue] = useState<number>(10)
    const [maxValue, setMaxValue] = useState<number>(2000)    
    const [isModalCreateAnuncioOpen, setIsModalCreateAnuncioOpen] = useState(false);
    const [isModalCreateProspostaOpen, setIsModalCreateProspostaOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [newAnuncio, setNewAnuncio] = useState<AnuncioCreate>({
        titulo: '',
        descricao: '',
        valor: 0,
        consoleId: 0,
        venda: false,
        troca: false,
        foto: null,
    });

    useEffect(() => {
        setFilteredAnuncios(
            anuncios.filter(anuncio => 
                anuncio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                anuncio.descricao.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, anuncios]);

    const handleSignOut = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.warning('Token expirado, faça login novamente!', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnFocusLoss: false,
            pauseOnHover: true,
            theme: 'colored',
        });
        router.push('/home');
    }, [router]);

    const loadAnuncios = useCallback (async (userId?: string, token?: string, excludeUser: boolean = false) => {
        setLoading(true);
        try {
            const data = await fetchAnuncios(userId, token, excludeUser);
            setAnuncios(data);
        } catch (error) {
            setAnuncios([])
            setError(`Falha ao carregar anúncios: ${error}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAplicaFiltros = useCallback(async () => {
        const token = localStorage.getItem('token')
        const userString = localStorage.getItem('user')
        const loggedId: number | undefined = userString ? JSON.parse(userString).id : undefined
    
        const compact = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
          Object.fromEntries(
            Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
          ) as Partial<T>
    
        const isTipoValido = ['venda', 'troca', 'ambos'].includes(selectedTipo)
        const tipo = isTipoValido ? (selectedTipo as 'venda' | 'troca' | 'ambos') : undefined
    
        const filtros = compact({
            titulo: searchTerm || undefined,
            descricao: searchTerm || undefined,
            excludeUserId: loggedId ? String(loggedId) : undefined,
            consoleId: selectedConsole || undefined,
            avaliacaoMin: selectedRating > 0 ? selectedRating : undefined,
            tipo,
            // se for troca, não envia faixa de valor
            valorMin: tipo === 'troca' ? undefined : minValue,
            valorMax: tipo === 'troca' ? undefined : maxValue
        })
    
        try {
            const anunciosFiltrados = await fetchAnunciosComFiltro(filtros, token || undefined)
            setAnuncios(anunciosFiltrados)
            setFilteredAnuncios(anunciosFiltrados)
            setShowFilters(false)
        } catch (err) {
            console.error('Erro ao aplicar filtros:', err)
            toast.error('Erro ao aplicar filtros. Tente novamente.', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: true,
            theme: 'colored'
            })
        }
    }, [searchTerm, selectedConsole, selectedRating, selectedTipo, minValue, maxValue])

    const fetchUserData = useCallback (async (userId: string, token: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_BACKEND}/user/${userId}`, {
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
            setPhotoUrl(data?.user?.fotoUrl)
        } catch (error) {
            setPhotoUrl(null)
            setError('Erro ao carregar dados' + error);
        }
    }, [handleSignOut]);

    const handleCreateAnuncio = useCallback (async (newAnuncio: AnuncioCreate) => {
        const token = localStorage.getItem('token');
        setButtonLoading(true);
        try {
            if(token){
                const response = await createAnuncio(newAnuncio, token)

                if (response.message === "Token inválido") {
                    handleSignOut();
                    return;
                }

                if (response.cadastrado === true){
                    toast.success('Anúncio cadastrado com sucesso!', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnFocusLoss: false,
                        pauseOnHover: true,
                        icon: <MdCheckCircle/>
                    });
                    setButtonLoading(false);
                    closeModalCreateAnuncio()
                    return;
                }
            }
            handleSignOut();
            router.replace('/login');
            return;
            
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message || 'Falha ao realizar o cadastro. Tente novamente.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    className: 'toast-error',
                    progressClassName: 'toast-progress-bar',
                    icon: <MdCancel/>,
                    transition: Bounce
                })
                setButtonLoading(false);
            }else{
                toast.error('Falha ao realizar o cadastro. Tente novamente.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    className: 'toast-error',
                    progressClassName: 'toast-progress-bar',
                    icon: <MdCancel/>,
                    transition: Bounce
                })
                setButtonLoading(false);
            }
        }
    }, [router, handleSignOut]);

    const handleCreateProposta = useCallback (async (newProposta: PropostaCreate) => {
        const token = localStorage.getItem('token');
        setButtonLoading(true);
        try {
            if(token){
                const response = await createProposta(newProposta, token)

                if (response.message === "Token inválido") {
                    handleSignOut();
                    return;
                }

                if (response.cadastrada === true){
                    toast.success('Proposta criada com sucesso!', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnFocusLoss: false,
                        pauseOnHover: true,
                        icon: <MdCheckCircle/>
                    });
                    setButtonLoading(false);
                    closeModalProposta()
                    return;
                }

                if (response.status === 'pendente'){
                    toast.success(response.message, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                        className: 'toast-error',
                        progressClassName: 'toast-progress-bar',
                        icon: <MdCancel/>,
                        transition: Bounce
                    });
                    setButtonLoading(false);
                    return;
                }
            }
            handleSignOut();
            router.replace('/login');
            return;
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message || 'Falha ao realizar o proposta. Tente novamente.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    className: 'toast-error',
                    progressClassName: 'toast-progress-bar',
                    icon: <MdCancel/>,
                    transition: Bounce
                })
                setButtonLoading(false);
            }else{
                toast.error('Falha ao realizar o proposta. Tente novamente.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    className: 'toast-error',
                    progressClassName: 'toast-progress-bar',
                    icon: <MdCancel/>,
                    transition: Bounce
                })
                setButtonLoading(false);
            }
        }
    }, [router, handleSignOut])

    const openModalProposta = (type: string, anuncioId: number) => {
        if (!user){
            router.replace('/login');
        }
        setModalType(type)
        setNewProposta({ anuncioId: anuncioId, valor: 0, mensagem: ''});
        setIsModalCreateProspostaOpen(true);
    }

    const closeModalProposta = () => {
        setIsModalCreateProspostaOpen(false);
    };
    
    const openModalCreateAnuncio = () => {
        if (!user){
            router.replace('/login');
        }
        setNewAnuncio({ titulo: '', descricao: '', valor: 0, consoleId: 1, venda: false, troca: false, foto: null });
        setIsModalCreateAnuncioOpen(true);
    };

    const closeModalCreateAnuncio = () => {
        setIsModalCreateAnuncioOpen(false);
    };


    useEffect(() => {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
    
        if (token) {
            try {
                const userId = userString ? JSON.parse(userString).id : undefined;
                fetchUserData(userId, token)
                loadAnuncios(userId, token ?? undefined, true);
                setUser(true)
                return;
            } catch (error) {
                console.error('Erro ao parsear usuário:', error);
                localStorage.removeItem('user');
                router.replace('/login');
                return;
            }
            
        }
            loadAnuncios(undefined, token ?? undefined, false);
            setPhotoUrl(null)
    }, [router, loadAnuncios, fetchUserData]);

    if (loading) {
        return (
            <div className="flex justify-center items-center space-x-2">
                <MdAutorenew className="animate-spin text-black text-3xl" />
                <span className="text-black">Carregando...</span>
            </div>
        );
    }

    if (error) return <p className="text-center text-white">{error}</p>;

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 bg-black">
                <HeaderHome         
                    user={{
                        logo: '/images/logotipo.png',
                        avatarUser: photoUrl || '',
                        onHomeClick: () => router.push("/"),
                        onMenuClick: () => {},
                    }}
                />
            </div>

            <div className="pt-22 bg-background min-h-screen p-6">
                <div className="fixed top-20 left-0 right-0 z-40 bg-background px-4 sm:px-6 pt-4">
                    {/* Container principal filtros */}
                    <div className="max-w-5xl mx-auto mb-6">
                        {/* Barra de busca e botão de filtros */}
                        <div className="flex flex-wrap sm:flex-nowrap justify-center gap-3">
                            {/* Botão de Filtros */}
                            <button
                            onClick={() => setShowFilters(true)}
                            className="w-full sm:w-auto sm:order-1 order-0 bg-[#012AE1] hover:bg-[#00C898] transition text-white px-6 py-2 rounded-lg"
                            >
                            Filtros
                            </button>

                            {/* Input de busca */}
                            <div className="relative w-full sm:w-[50%] order-1">
                                <input
                                    type="text"
                                    placeholder="Digite a descrição ou título ..."
                                    className="w-full p-3 rounded-lg bg-cardBackground text-white pl-4 pr-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Modal lateral de filtros */}
                        {showFilters && (
                            <div
                            className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex justify-end pt-[80px]"
                            onClick={() => setShowFilters(false)}
                            >
                            <div
                                className="bg-cardBackground w-full sm:w-[400px] h-full p-6 overflow-y-auto shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Cabeçalho */}
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-white text-lg font-semibold">Filtrar Anúncios</h2>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="text-white text-xl hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* Filtro por Console */}
                                <label className="block text-white text-sm mb-1">Console</label>
                                <select
                                value={selectedConsole}
                                onChange={(e) => setSelectedConsole(Number(e.target.value))}
                                className="w-full p-3 rounded-lg bg-[#1A1B2D] text-white mb-4"
                                >
                                    <option value="">Todos Consoles</option>
                                    <option value={1}>PS1</option>
                                    <option value={2}>PS2</option>
                                    <option value={3}>PS3</option>
                                    <option value={4}>PS4</option>
                                    <option value={5}>XBOX 360</option>
                                    <option value={6}>XBOX ONE</option>
                                    <option value={7}>XBOX SERIES</option>
                                </select>

                                {/* Avaliação */}
                                <label className="block text-white text-sm mb-1">Avaliação</label>
                                <select
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(Number(e.target.value))}
                                className="w-full p-3 rounded-lg bg-[#1A1B2D] text-white mb-4"
                                >
                                    <option value={0}>Todas avaliações</option>
                                    <option value={5}>⭐ 5 estrelas</option>
                                    <option value={4}>⭐ 4+ estrelas</option>
                                    <option value={3}>⭐ 3+ estrelas</option>
                                </select>

                                {/* Tipo */}
                                <label className="block text-white text-sm mb-1">Tipo</label>
                                <select
                                value={selectedTipo}
                                onChange={(e) => setSelectedTipo(e.target.value)}
                                className="w-full p-3 rounded-lg bg-[#1A1B2D] text-white mb-4"
                                >
                                    <option value="">Todos tipos</option>
                                    <option value="ambos">Venda e troca</option>
                                    <option value="venda">Venda</option>
                                    <option value="troca">Troca</option>
                                </select>

                                <div className="mb-10">
                                    <label className="block text-white text-sm mb-2">Faixa de Valor</label>
                                    <Slider
                                        value={[minValue, maxValue]}
                                        onChange={(_, newValue) => {
                                            const [min, max] = newValue as number[]
                                            setMinValue(min)
                                            setMaxValue(max)
                                        }}
                                        min={10}
                                        max={2000}
                                        valueLabelDisplay="off"
                                    />
                                    <div className="flex justify-between text-sm text-gray-300 mt-2">
                                        <span>R${minValue}</span>
                                        <span>R${maxValue}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 justify-between">
                                    {/* Botão de aplicar */}
                                    <button
                                        onClick={loadAplicaFiltros}
                                        className="flex-1 min-w-[48%] bg-[#012AE1] hover:bg-[#00C898] transition text-white px-6 py-3 rounded-lg"
                                    >
                                        Aplicar Filtros
                                    </button>

                                    {/* Botão de limpar */}
                                    <button
                                        onClick={() => {
                                        setSelectedConsole('');
                                        setSelectedRating(0);
                                        setSelectedTipo('ambos');
                                        setMinValue(10);
                                        setMaxValue(2000);
                                        setShowFilters(false);
                                        loadAnuncios();
                                        }}
                                        className="flex-1 min-w-[48%] bg-gray-600 hover:bg-gray-500 transition text-white px-6 py-3 rounded-lg"
                                    >
                                        Limpar Filtros
                                    </button>
                                </div>
                            </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={openModalCreateAnuncio}
                        className="bg-[#012AE1] text-white px-6 py-3 rounded-lg hover:bg-[#00C898] transition block mx-auto mb-6 sm:mb-4 sm:w-auto w-full flex justify-center items-center"
                    >
                        <MdAdd size={24} className="mr-2" />
                        Criar Anúncio
                    </button>
                </div>

                <div className="pt-[208px] sm:pt-[144px]">
                    {/* Lista de anúncios */}
                    {filteredAnuncios.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAnuncios.map(anuncio => (
                        <div
                            key={anuncio.id}
                            className="bg-cardBackground rounded-xl shadow-card overflow-hidden relative flex flex-col"
                        >
                            <div className="relative w-full h-56 overflow-hidden">
                            <Image
                                src={anuncio.fotoUrl || '/images/default-image.png'}
                                alt={`Imagem do anúncio ${anuncio.id}`}
                                width={500}
                                height={300}
                                className="w-full h-full object-cover"
                            />
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl text-white font-semibold">{anuncio.titulo}</h2>
                                <button
                                className={`flex items-center py-2 px-4 rounded-xl ${consoleButtonStyles[anuncio.consoleId]}`}
                                >
                                <Image
                                    src={consoleImages[anuncio.consoleId] || '/images/default-console.png'}
                                    alt={`Console ${anuncio.consoleId}`}
                                    width={50}
                                    height={50}
                                    className="mr-2"
                                />
                                </button>
                            </div>

                            <p className="text-white mt-2">{anuncio.descricao}</p>

                            {anuncio.venda && (
                                <div className="flex justify-between items-center mt-6">
                                <p className="text-2xl text-white font-bold">R${anuncio.valor}</p>
                                </div>
                            )}

                            {/* Seção dos botões */}
                            <div className="mt-6 flex gap-4 justify-center mt-auto">
                                {anuncio.venda && !anuncio.troca && (
                                <button
                                    className="bg-buttonBuy text-white px-6 py-3 rounded-full w-auto"
                                    onClick={() => openModalProposta('Comprar', anuncio.id)}
                                >
                                    Comprar
                                </button>
                                )}
                                {anuncio.troca && !anuncio.venda && (
                                <button
                                    className="bg-buttonTrade text-white px-6 py-3 rounded-full w-auto"
                                    onClick={() => openModalProposta('Trocar', anuncio.id)}
                                >
                                    Trocar
                                </button>
                                )}
                                {anuncio.venda && anuncio.troca && (
                                <>
                                    <button
                                    className="bg-buttonBuy text-white px-6 py-3 rounded-full w-auto"
                                    onClick={() => openModalProposta('Comprar', anuncio.id)}
                                    >
                                    Comprar
                                    </button>
                                    <button
                                    className="bg-buttonTrade text-white px-6 py-3 rounded-full w-auto"
                                    onClick={() => openModalProposta('Trocar', anuncio.id)}
                                    >
                                    Trocar
                                    </button>
                                </>
                                )}
                            </div>
                            </div>
                        </div>
                        ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center min-h-[200px]">
                            <p className="text-center text-white text-lg">Sem anúncios disponíveis.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalCreateAnuncioOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50 p-4">
                <div className="bg-cardBackground p-4 rounded-lg w-11/12 sm:w-4/5 md:w-2/3 lg:w-1/3 mt-8 mb-8">
                    {/* O conteúdo do modal continua aqui */}
                    <h2 className="text-2xl font-semibold text-[#FFFFFF] mb-4">Dados do anúncio</h2>

                    {/* Título */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="titulo">* Título</label>
                        <input
                        type="text"
                        id="titulo"
                        value={newAnuncio.titulo}
                        onChange={(e) => setNewAnuncio({...newAnuncio, titulo: e.target.value})}
                        className="mt-1 p-3 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                        />
                    </div>

                    {/* Descrição */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="descricao">* Descrição</label>
                        <textarea
                        id="descricao"
                        value={newAnuncio.descricao}
                        onChange={(e) => setNewAnuncio({...newAnuncio, descricao: e.target.value})}
                        className="mt-1 p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                        rows={3}
                        />
                    </div>

                    {/* Flags de Venda e Troca */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#FFFFFF]">* Tipos de Anúncios</label>
                        <div className="flex items-center space-x-4">
                        <div>
                            <input
                            type="checkbox"
                            id="venda"
                            checked={newAnuncio.venda}
                            onChange={() => setNewAnuncio({...newAnuncio, venda: !newAnuncio.venda})}
                            className="mr-2"
                            />
                            <label htmlFor="venda" className="text-[#FFFFFF]">Venda</label>
                        </div>
                        <div>
                            <input
                            type="checkbox"
                            id="troca"
                            checked={newAnuncio.troca}
                            onChange={() => setNewAnuncio({...newAnuncio, troca: !newAnuncio.troca})}
                            className="mr-2"
                            />
                            <label htmlFor="troca" className="text-[#FFFFFF]">Troca</label>
                        </div>
                        </div>
                    </div>

                    {/* Preço (apenas se for Venda) */}
                    {newAnuncio.venda && (
                        <div className="mb-4">
                        <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="valor">* Preço</label>
                        <input
                            type="number"
                            id="valor"
                            value={newAnuncio.valor}
                            onChange={(e) => setNewAnuncio({...newAnuncio, valor: parseFloat(e.target.value)})}
                            className="mt-1 p-2 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                        />
                        </div>
                    )}

                    {/* Console */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="consoleId">* Console</label>
                        <select
                        id="consoleId"
                        value={newAnuncio.consoleId}
                        onChange={(e) => setNewAnuncio({...newAnuncio, consoleId: parseFloat(e.target.value)})}
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

                    {/* Foto */}
                    <div className="mb-4">
                            <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="foto">* Foto</label>
                            <input
                                type="file"
                                id="foto"
                                onChange={(e) => {
                                    const file = e.target.files ? e.target.files[0] : null;
                                    if (file) {
                                    setNewAnuncio({
                                        ...newAnuncio,
                                        foto: file,
                                    });
                                    setFileName(file.name);
                                    }
                                }}
                                className="mt-1 p-4 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full hidden"
                            />
                            <label
                                htmlFor="foto"
                                className="mt-2 text-center block bg-[#444444] text-[#FFFFFF] p-3 rounded-lg cursor-pointer hover:bg-[#555555] transition"
                                >
                                Escolher Arquivo
                            </label>

                            {fileName && (
                            <p className="text-xs text-[#A0A0A0] mt-2">Arquivo selecionado: {fileName}</p>
                            )}
                    </div>

                        {/* Botões */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setIsModalCreateAnuncioOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                            >
                                Cancelar
                            </button>

                            <button
                                disabled={buttonLoading}
                                onClick={() => handleCreateAnuncio(newAnuncio)}
                                className="bg-[#012AE1] text-white px-4 py-2 rounded-lg hover:bg-[#00C898] transition flex justify-center items-center"
                            >
                                {buttonLoading ? (
                                    <MdAutorenew className="animate-spin text-white text-2xl" />
                                ) : (
                                    <>
                                        Criar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalCreateProspostaOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50 p-4">
                    <div className="bg-cardBackground p-4 rounded-lg w-11/12 sm:w-4/5 md:w-2/3 lg:w-1/3 mt-8 mb-8">
                        <h2 className="text-2xl font-semibold text-[#FFFFFF] mb-4">Dados da proposta</h2>

                        {modalType === "Comprar" && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="valor">* Valor</label>
                                <input
                                    type="number"
                                    id="valor"
                                    value={newProposta.valor}
                                    onChange={(e) => setNewProposta({ ...newProposta, valor: parseFloat(e.target.value) })}
                                    className="mt-1 p-3 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#FFFFFF]" htmlFor="mensagem">* Mensagem</label>
                            <textarea
                                id="mensagem"
                                value={newProposta.mensagem}
                                onChange={(e) => setNewProposta({ ...newProposta, mensagem: e.target.value })}
                                className="mt-1 p-3 bg-[#333333] border border-[#555555] rounded-lg text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] w-full"
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setIsModalCreateProspostaOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={buttonLoading}
                                onClick={() => handleCreateProposta(newProposta)}
                                className="bg-[#012AE1] text-white px-4 py-2 rounded-lg hover:bg-[#00C898] transition flex justify-center items-center"
                            >
                                {buttonLoading ? (
                                    <MdAutorenew className="animate-spin text-white text-2xl" />
                                ) : (
                                    <>
                                        Criar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
        </>
    );
};

export default HomePage;
