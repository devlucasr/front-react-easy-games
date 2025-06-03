import { useState } from 'react'
import { useRouter } from 'next/router'
import { toast, ToastContainer, Bounce } from 'react-toastify'
import Link from 'next/link'
import Image from 'next/image'
import { BiShowAlt, BiHide, BiUser } from 'react-icons/bi'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import 'react-toastify/dist/ReactToastify.css'
import { AxiosError } from 'axios'

const Login = () => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const { signIn } = useAuth()

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !senha) {
      toast.error('Preencha email e senha', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        className: 'toast-error',
        progressClassName: 'toast-progress-bar',
        icon: <FaTimesCircle />,
        transition: Bounce
      })
      return
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(senha)) {
      toast.error(
        'A senha deve conter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial.',
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          className: 'toast-error',
          progressClassName: 'toast-progress-bar',
          icon: <FaTimesCircle />,
          transition: Bounce
        }
      )
      return
    }

    try {
      const data = await signIn({ email, senha })
      if (data.token) {
        toast.success('Login realizado com sucesso!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          className: 'toast-success',
          progressClassName: 'toast-progress-bar',
          icon: <FaCheckCircle />,
          transition: Bounce
        })
        router.push('/home')
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(`${error.response?.data?.message}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          className: 'toast-error',
          progressClassName: 'toast-progress-bar',
          icon: <FaTimesCircle />,
          transition: Bounce
        })
      } else {
        toast.error('Erro desconhecido.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          className: 'toast-error',
          progressClassName: 'toast-progress-bar',
          icon: <FaTimesCircle />,
          transition: Bounce
        })
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full px-4 md:px-8">
        <div className="flex justify-center lg:justify-center lg:items-center mb-6 lg:mb-0">
          <Image
            src="/images/logotipo.png"
            alt="Logo"
            width={350}
            height={150}
            className="transition-all duration-500 ease-in-out lg:max-w-full max-w-[250px]"
          />
        </div>

        <div className="bg-cardBackground p-8 rounded-lg shadow-lg w-full max-w-md mx-auto lg:ml-12">
          <h2 className="text-text text-2xl font-bold text-center mb-6">Login</h2>
          <form onSubmit={handleSignIn}>
            <div className="mb-4 relative">
              <input
                type="email"
                className="w-full p-3 rounded bg-background text-text focus:outline-none"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <BiUser className="absolute right-3 top-3 text-text" size={20} />
            </div>

            <div className="mb-4 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full p-3 rounded bg-background text-text focus:outline-none"
                placeholder="Senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
              />
              {showPassword ? (
                <BiHide
                  className="absolute right-3 top-3 text-text cursor-pointer"
                  size={20}
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <BiShowAlt
                  className="absolute right-3 top-3 text-text cursor-pointer"
                  size={20}
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-buttonBuy p-3 rounded text-white font-bold hover:bg-green-600"
            >
              Entrar
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-text">Não possui conta?</span>
            <Link href="/register" className="text-buttonTrade font-bold ml-2">
              Criar conta
            </Link>
          </div>
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

export default Login
