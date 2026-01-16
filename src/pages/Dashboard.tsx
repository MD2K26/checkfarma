import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { AUDIT_TYPES } from '../constants';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [lojas, setLojas] = useState<any[]>([]);
    const [selectedLoja, setSelectedLoja] = useState('');
    const [recentAudits, setRecentAudits] = useState<any[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);
    const userEmail = localStorage.getItem('user_email');

    useEffect(() => {
        fetchLojas();
        fetchRecentAudits();
    }, []);

    const fetchLojas = async () => {
        if (!userEmail) return;
        setDbError(null);

        try {
            // 1. Check if Admin (from localStorage set during login)
            const role = localStorage.getItem('user_role');
            const isAdminUser = role === 'admin';
            setIsAdmin(isAdminUser);

            const cleanedEmail = userEmail.trim().toLowerCase();

            // 2. Fetch Allowed Stores
            if (isAdminUser) {
                // Admin sees all
                const { data, error: lojaErr } = await supabase.from('lojas').select('*').eq('ativa', true);
                if (data) setLojas(data);
                if (lojaErr) console.error("Lojas fetch error", lojaErr);
            } else {
                // Restricted user (case-insensitive)
                const { data: allowedStores, error: storeErr } = await supabase.from('user_stores').select('loja_id').ilike('email', cleanedEmail);

                if (storeErr && (storeErr.code === '42P01')) {
                    setDbError('DATABASE_NOT_SYNCED');
                    return;
                }

                if (allowedStores && allowedStores.length > 0) {
                    const ids = allowedStores.map(as => as.loja_id);
                    const { data } = await supabase.from('lojas').select('*').in('id', ids).eq('ativa', true);
                    if (data) setLojas(data);
                } else {
                    // No specific stores assigned
                    setLojas([]);
                }
            }
        } catch (e) {
            console.error("Unexpected error fetching lojas", e);
        }
    };

    const fetchRecentAudits = async () => {
        const { data } = await supabase.from('auditorias').select('*, lojas(nome)').order('created_at', { ascending: false }).limit(5);
        if (data) setRecentAudits(data);
    };

    const handleStartAudit = (typeId: string) => {
        if (!selectedLoja) return alert('Selecione uma loja');
        navigate(`/audit/${typeId}?loja=${selectedLoja}`);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Drogaria ABC</h1>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                        >
                            PAINEL ADMIN
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 truncate max-w-[100px]">{localStorage.getItem('user_name')}</span>
                    <button onClick={handleLogout} className="text-sm text-brand-red font-medium hover:opacity-80 underline">
                        Sair
                    </button>
                </div>
            </header>

            {dbError === 'DATABASE_NOT_SYNCED' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                    <p className="text-amber-800 text-sm font-bold flex items-center gap-2">
                        ⚠️ Configuração Pendente
                    </p>
                    <p className="text-amber-700 text-xs mt-1">
                        As novas tabelas de acesso ainda não foram criadas no seu Supabase.
                        O app não conseguirá carregar as lojas até que o SQL de permissões seja executado.
                    </p>
                </div>
            )}

            <section className="mb-8">
                {lojas.length === 0 && !dbError && (
                    <div className="bg-white p-6 rounded-2xl text-center shadow-sm border border-gray-100">
                        <p className="text-2xl mb-2">👋</p>
                        <p className="font-bold text-gray-800">Bem-vindo!</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Você ainda não tem lojas atribuídas ao seu e-mail.
                            Solicite acesso ao administrador.
                        </p>
                    </div>
                )}

                {lojas.length > 0 && (
                    <Card className="mb-6">
                        <Select
                            label="Selecione a Loja"
                            value={selectedLoja}
                            onChange={(e) => setSelectedLoja(e.target.value)}
                            options={lojas.map(l => ({ value: l.id, label: l.nome }))}
                        />
                    </Card>
                )}

                {selectedLoja && (
                    <>
                        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Nova Auditoria</h2>
                        <div className="grid gap-3">
                            {AUDIT_TYPES.map(type => (
                                <Button
                                    key={type.id}
                                    onClick={() => handleStartAudit(type.id)}
                                    className="w-full text-left flex justify-between items-center h-14"
                                    variant="primary"
                                >
                                    {type.label}
                                    <span>→</span>
                                </Button>
                            ))}
                        </div>
                    </>
                )}
            </section>

            <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Últimas Auditorias</h2>
                <div className="space-y-3">
                    {recentAudits.length === 0 && <p className="text-gray-400 text-center py-4">Nenhuma auditoria recente.</p>}
                    {recentAudits.map(audit => (
                        <Card key={audit.id} onClick={() => navigate(`/report/${audit.id}`)}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className={`font-bold ${audit.score >= 80 ? 'text-brand-blue' : 'text-brand-red'}`}>{audit.tipo}</p>
                                    <p className="text-xs text-gray-500">{audit.lojas?.nome} • {new Date(audit.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className={`text-lg font-bold ${audit.score >= 80 ? 'text-brand-blue' : 'text-brand-red'}`}>
                                    {audit.score}%
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
