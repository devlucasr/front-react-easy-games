import { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { useRouter } from 'next/router'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { registerUser } from '../services/userService'
import 'react-toastify/dist/ReactToastify.css'

const Register = () => {
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [celular, setCelular] = useState('')
  const [cep, setCep] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !sobrenome || !email || !senha || !confirmarSenha || !celular || !cep) {
      toast.error('Preencha todos os campos', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        icon: <FaTimesCircle />
      })
      return
    }

    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        icon: <FaTimesCircle />
      })
      return
    }

    try {
      const data = await registerUser({
        nome,
        sobrenome,
        email,
        celular,
        cep,
        senha,
      })
      if (data) {
        toast.success('Cadastro realizado com sucesso!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          icon: <FaCheckCircle />
        })
        router.push('/login')
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Falha ao realizar o cadastro. Tente novamente.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          icon: <FaTimesCircle />
        })
      } else {
        toast.error('Falha ao realizar o cadastro. Tente novamente.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          icon: <FaTimesCircle />
        })
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full px-4 md:px-8">
        <div className="bg-cardBackground p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
          <h2 className="text-text text-2xl font-bold text-center mb-6">Cadastro</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <input
                type="text"
                className="w-full p-3 rounded bg-background text-text"
                placeholder="Nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <input
                type="text"
                className="w-full p-3 rounded bg-background text-text"
                placeholder="Sobrenome"
                value={sobrenome}
                onChange={e => setSobrenome(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <input
                type="email"
                className="w-full p-3 rounded bg-background text-text"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <input
                type="tel"
                className="w-full p-3 rounded bg-background text-text"
                placeholder="Celular"
                value={celular}
                onChange={e => setCelular(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <input
                type="text"
                className="w-full p-3 rounded bg-background text-text"
                placeholder="CEP"
                value={cep}
                onChange={e => setCep(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                className="w-full p-3 rounded bg-background text-text"
                placeholder="Senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                className="w-full p-3 rounded bg-background text-text"
                placeholder="Confirmar Senha"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-buttonBuy p-3 rounded text-white font-bold hover:bg-green-600"
            >
              Cadastrar
            </button>
          </form>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        theme="colored"
      />
    </div>
  )
}

export default Register
