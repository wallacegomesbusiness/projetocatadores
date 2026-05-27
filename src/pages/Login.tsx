import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Recycle, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const isFormValid = isRegistering 
    ? nome.trim() !== '' && email.trim() !== '' && senha.trim() !== ''
    : email.trim() !== '' && senha.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        if (!nome || !email || !senha) {
          toast.error('Preencha todos os campos obrigatórios');
          return;
        }
        const response = await api.post('/auth/register', { nome, email, senha });
        toast.success('Conta criada com sucesso! Redirecionando...');
        localStorage.setItem('@ReciclaOrg:user', JSON.stringify(response.data.user));
        localStorage.setItem('@ReciclaOrg:token', response.data.token);
        setTimeout(() => navigate('/'), 1500);
      } else {
        if (!email || !senha) {
          toast.error('Preencha os campos obrigatórios');
          return;
        }
        const response = await api.post('/auth/login', { email, senha });
        toast.success('Acesso confirmado! Redirecionando...');
        localStorage.setItem('@ReciclaOrg:user', JSON.stringify(response.data.user));
        localStorage.setItem('@ReciclaOrg:token', response.data.token);
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || 'Erro na autenticação. Verifique seus dados.');
      } else {
        toast.error('Erro na autenticação. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary-600 rounded-b-[100px] shadow-lg -translate-y-20 z-0"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-white">
          <Recycle size={48} />
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
          ReciclaOrg
        </h2>
        <p className="mt-2 text-center text-sm text-primary-100">
          Sistema de Gestão de Catadores e Recicláveis
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {isRegistering ? 'Crie sua conta' : 'Acesse o sistema'}
          </h3>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="usuario@reciclaorg.com.br"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors cursor-pointer
                ${isFormValid 
                  ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500' 
                  : 'bg-gray-400 cursor-not-allowed'}
              `}
            >
              {isRegistering ? 'Cadastrar' : 'Entrar'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              {isRegistering 
                ? 'Já tem uma conta? Faça login' 
                : 'Não tem uma conta? Cadastre-se'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
