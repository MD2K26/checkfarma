import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Card from '../components/Card';
import logo from '../assets/logo.png';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', senha: '' });
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', credentials.email.trim())
                .eq('senha', credentials.senha.trim())
                .maybeSingle();

            if (data) {
                localStorage.setItem('user_email', data.email);
                localStorage.setItem('user_name', data.nome);
                localStorage.setItem('user_role', data.role);

                if (data.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                alert('E-mail ou senha inválidos.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao tentar fazer login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a192f] p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-[50%] h-[50%] bg-brand-blue rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] bg-brand-red rounded-full blur-[120px] opacity-10 animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-[400px] relative z-10">
                <Card className="text-center p-10 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl transition-all duration-500 hover:bg-white/15">
                    <div className="mb-8 flex justify-center scale-110">
                        <div className="relative inline-block">
                            <div className="absolute inset-[8%] bg-white rounded-[1rem] shadow-lg"></div>
                            <img
                                src={logo}
                                alt="Drugstore ABC Logo"
                                className="h-20 object-contain block relative z-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 mb-10">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Sistema de Auditoria</h2>
                        <p className="text-blue-100/60 text-sm font-medium">Drugstore ABC & CDA</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="E-mail Corporativo"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent transition-all"
                                    value={credentials.email}
                                    onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent transition-all"
                                    value={credentials.senha}
                                    onChange={e => setCredentials({ ...credentials, senha: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-wait"
                        >
                            {loading ? 'Acessando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-white/10 mt-8">
                        <div className="inline-block px-3 py-1 bg-brand-red/20 rounded-full mb-3">
                            <span className="text-[9px] text-brand-red font-black uppercase tracking-[0.2em]">Acesso Restrito</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                            Esta plataforma é de uso exclusivo para colaboradores autorizados.
                        </p>
                    </div>
                </Card>

                <p className="text-center mt-8 text-[10px] text-white/20 uppercase tracking-widest font-bold">
                    Desenvolvido por Drogaria ABC © 2024
                </p>
            </div>
        </div>
    );
};

export default Login;
