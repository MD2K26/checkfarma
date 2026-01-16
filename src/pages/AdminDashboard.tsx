import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import EvolutionChart from '../components/EvolutionChart';
import UserManagement from '../components/UserManagement';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalAudits: 0, avgScore: 0, lowScores: 0 });
    const [lojas, setLojas] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'visão_geral' | 'usuarios'>('visão_geral');

    // Form state
    const [newEmail, setNewEmail] = useState('');
    const [selectedLoja, setSelectedLoja] = useState('');
    const [loading, setLoading] = useState(false);
    // const userEmail = localStorage.getItem('user_email'); // Removed unused var

    useEffect(() => {
        checkAdmin();
        fetchData();
    }, []);

    const checkAdmin = async () => {
        const role = localStorage.getItem('user_role');
        if (role !== 'admin') {
            navigate('/');
        }
    };

    const fetchData = async () => {
        // 1. Fetch Lojas
        const { data: lojasData } = await supabase.from('lojas').select('*');
        setLojas(lojasData || []);

        // 2. Fetch Assignments
        const { data: assignData } = await supabase.from('user_stores').select('*, lojas(nome)');
        setAssignments(assignData || []);

        // 3. Fetch Audit Stats & Chart
        const { data: auditData } = await supabase.from('auditorias').select('score, created_at').order('created_at', { ascending: true });
        if (auditData) {
            const total = auditData.length;
            const avg = total > 0 ? Math.round(auditData.reduce((acc, curr) => acc + curr.score, 0) / total) : 0;
            const low = auditData.filter(a => a.score < 70).length;
            setStats({ totalAudits: total, avgScore: avg, lowScores: low });

            // Process chart data (group by date)
            const grouped = auditData.reduce((acc: any, audit: any) => {
                const date = new Date(audit.created_at).toLocaleDateString('pt-BR');
                if (!acc[date]) acc[date] = { date, scores: [] };
                acc[date].scores.push(audit.score);
                return acc;
            }, {});

            const processedChart = Object.values(grouped).map((g: any) => ({
                date: g.date,
                score: Math.round(g.scores.reduce((a: number, b: number) => a + b, 0) / g.scores.length)
            }));
            setChartData(processedChart);
        }
    };

    const handleAssign = async () => {
        if (!newEmail || !selectedLoja) return alert('Preencha e-mail e loja');
        setLoading(true);
        try {
            const { error } = await supabase.from('user_stores').insert({
                email: newEmail.toLowerCase().trim(),
                loja_id: selectedLoja
            });
            if (error) throw error;
            setNewEmail('');
            fetchData();
        } catch (e: any) {
            alert('Erro ao atribuir: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: string) => {
        const { error } = await supabase.from('user_stores').delete().eq('id', id);
        if (!error) fetchData();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/')} className="p-2 bg-white rounded-lg shadow-sm">←</button>
                <h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1>
            </header>

            {/* TAB NAV */}
            <div className="flex gap-4 mb-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('visão_geral')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'visão_geral' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab('usuarios')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'usuarios' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Gerenciar Usuários
                </button>
            </div>

            {activeTab === 'usuarios' ? (
                <UserManagement />
            ) : (
                <>
                    {/* METRICS */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <Card className="p-4 bg-brand-blue text-white">
                            <p className="text-[10px] uppercase font-bold opacity-80">Total Auditorias</p>
                            <p className="text-2xl font-bold">{stats.totalAudits}</p>
                        </Card>
                        <Card className="p-4 bg-white">
                            <p className="text-[10px] uppercase font-bold text-gray-400">Score Médio</p>
                            <p className={`text-2xl font-bold ${stats.avgScore >= 80 ? 'text-brand-blue' : 'text-brand-red'}`}>
                                {stats.avgScore}%
                            </p>
                        </Card>
                        <Card className="p-4 bg-white col-span-2 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400">Notas Abaixo de 70%</p>
                                <p className="text-xl font-bold text-brand-red">{stats.lowScores} Lojas</p>
                            </div>
                            <span className="text-2xl">⚠️</span>
                        </Card>
                    </div>

                    {/* CHART */}
                    {chartData.length > 0 && <EvolutionChart data={chartData} />}

                    {/* ASSIGNMENTS */}
                    <section className="mb-8">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Gerenciar Acessos</h2>
                        <Card className="p-4 mb-4">
                            <div className="space-y-3">
                                <Input
                                    label="E-mail da Loja"
                                    placeholder="ex: loja01@drogariaabc.com.br"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                                <Select
                                    label="Loja Autorizada"
                                    value={selectedLoja}
                                    onChange={(e) => setSelectedLoja(e.target.value)}
                                    options={lojas.map(l => ({ value: l.id, label: l.nome }))}
                                />
                                <Button onClick={handleAssign} disabled={loading} className="w-full">
                                    Vincular Acesso
                                </Button>
                            </div>
                        </Card>

                        <div className="space-y-2">
                            {assignments.map(ass => (
                                <div key={ass.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{ass.email}</p>
                                        <p className="text-xs text-gray-500">Acesso: {ass.lojas?.nome}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(ass.id)}
                                        className="text-brand-red p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
