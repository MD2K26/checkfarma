import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Card from '../components/Card';
import Button from '../components/Button';

const Report: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [audit, setAudit] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        if (id) fetchReport();
    }, [id]);

    const fetchReport = async () => {
        const { data: auditData, error: auditError } = await supabase
            .from('auditorias')
            .select('*, lojas(nome)')
            .eq('id', id)
            .single();

        if (auditError) return alert('Auditoria não encontrada');
        setAudit(auditData);

        const { data: itemsData } = await supabase
            .from('itens_auditoria')
            .select('*')
            .eq('auditoria_id', id);

        if (itemsData) setItems(itemsData);
    };

    if (!audit) return <div className="p-4">Carregando...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20">
            <header className="mb-6">
                <Button variant="secondary" onClick={() => navigate('/')} className="mb-4">
                    ← Voltar
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">Relatório de Auditoria</h1>
                <p className="text-gray-500">{audit.tipo} - {audit.lojas?.nome}</p>
                <p className="text-xs text-gray-400">{new Date(audit.created_at).toLocaleString()}</p>
            </header>

            <Card className="mb-6 text-center py-8">
                <div className="text-4xl font-bold mb-2" style={{ color: audit.score >= 80 ? '#22c55e' : '#ef4444' }}>
                    {audit.score}%
                </div>
                <p className="text-gray-500 uppercase tracking-widest text-sm">Score Final</p>
            </Card>

            <h2 className="font-bold text-gray-800 mb-4">Itens Não Conformes</h2>
            {items.length === 0 ? (
                <Card className="p-8 text-center text-green-600 bg-green-50 border-green-200">
                    <p>Nenhuma não conformidade registrada! 🎉</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {items.map(item => (
                        <Card key={item.id} className="border-l-4 border-l-red-500">
                            <h3 className="font-bold text-gray-800">{item.item}</h3>
                            <p className="text-sm text-gray-600 mb-2">{item.observacao}</p>
                            {item.foto_url && (
                                <div className="mt-2">
                                    <a href={item.foto_url} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={item.foto_url}
                                            alt="Evidência"
                                            className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                                        />
                                    </a>
                                    <p className="text-xs text-blue-500 mt-1">Ver original no Drive ↗</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Report;
