import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { uploadImageToDiscord, sendAuditLog } from '../services/discord';
import { generateAuditPDF } from '../services/pdf';
import { sendAuditEmail } from '../services/email';
import { compressImage } from '../services/utils';
import { CATEGORIES, AUDIT_TYPES } from '../constants';
import Accordion from '../components/Accordion';
import Modal from '../components/Modal';


interface AuditItemState {
    status: 'conforme' | 'nao_conforme' | 'pendente';
    obs: string;
    file?: File;
    fotoUrl?: string; // Used for UI preview if needed, or logical ref
}

const Audit: React.FC = () => {
    const { tipo } = useParams();
    const [searchParams] = useSearchParams();
    const lojaId = searchParams.get('loja');
    const navigate = useNavigate();

    const [items, setItems] = useState<Record<string, AuditItemState>>({});
    const [categoryFiles, setCategoryFiles] = useState<Record<string, File>>({});
    const [submitting, setSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const categories = useMemo(() => {
        return (CATEGORIES as any)[tipo || ''] || [];
    }, [tipo]);

    const typeLabel = AUDIT_TYPES.find(t => t.id === tipo)?.label || tipo;


    // Initialize state & restore draft
    useEffect(() => {
        if (!categories.length) return;

        const draftKey = `audit_draft_${tipo}_${lojaId}`;
        const savedDraft = localStorage.getItem(draftKey);

        if (savedDraft) {
            try {
                const { items: savedItems } = JSON.parse(savedDraft);
                setItems(savedItems);
                // Note: Files (Images) cannot be easily saved as JSON in localStorage.
                // We'll keep the text state and ask the user to re-attach photos if they reloaded,
                // or use IndexedDB later if needed. For now, we save status/obs.
            } catch (e) {
                console.error("Failed to restore draft", e);
            }
        } else {
            const initial: Record<string, AuditItemState> = {};
            categories.forEach((cat: any) => {
                cat.items.forEach((_: string, idx: number) => {
                    const key = `${cat.id}-${idx}`;
                    initial[key] = { status: 'pendente', obs: '' };
                });
            });
            setItems(initial);
        }
    }, [categories, tipo, lojaId]);

    // Auto-save draft
    useEffect(() => {
        if (Object.keys(items).length > 0) {
            const draftKey = `audit_draft_${tipo}_${lojaId}`;
            localStorage.setItem(draftKey, JSON.stringify({ items, categoryFiles: {} }));
        }
    }, [items, tipo, lojaId]);

    const clearDraft = () => {
        const draftKey = `audit_draft_${tipo}_${lojaId}`;
        localStorage.removeItem(draftKey);
    };

    const handleStatusChange = (key: string, status: 'conforme' | 'nao_conforme' | 'pendente') => {
        setItems(prev => ({ ...prev, [key]: { ...prev[key], status } }));
    };

    const handleObsChange = (key: string, obs: string) => {
        setItems(prev => ({ ...prev, [key]: { ...prev[key], obs } }));
    };

    const handleFileChange = async (key: string, file: File | null) => {
        if (!file) return;
        try {
            const compressed = await compressImage(file);
            const compressedFile = new File([compressed], file.name, { type: 'image/jpeg' });
            setItems(prev => ({ ...prev, [key]: { ...prev[key], file: compressedFile } }));
        } catch (e) {
            console.error('Compression failed', e);
            alert('Erro ao processar imagem');
        }
    };

    const handleCategoryFile = async (catId: string, file: File | null) => {
        if (!file) return;
        try {
            const compressed = await compressImage(file);
            const compressedFile = new File([compressed], file.name, { type: 'image/jpeg' });
            setCategoryFiles(prev => ({ ...prev, [catId]: compressedFile }));
        } catch (e) {
            console.error('Compression failed', e);
            alert('Erro ao processar imagem da categoria');
        }
    };

    const stats = useMemo(() => {
        const total = Object.keys(items).length;
        if (total === 0) return { score: 0, marked: 0, total: 0, progress: 0, conformes: 0, pendentes: 0, nao_conformes: 0 };

        let conformes = 0;
        let marked = 0;
        let nao_conformes = 0;
        Object.values(items).forEach(i => {
            if (i.status !== 'pendente') marked++;
            if (i.status === 'conforme') conformes++;
            if (i.status === 'nao_conforme') nao_conformes++;
        });

        const score = Math.round((conformes / total) * 100);
        const progress = Math.round((marked / total) * 100);
        const pendentes = total - marked;
        return { score, marked, total, progress, conformes, pendentes, nao_conformes };
    }, [items]);

    const handleSubmit = async () => {
        if (stats.progress < 80) {
            return alert('Preencha pelo menos 80% da auditoria para finalizar.');
        }

        setSubmitting(true);
        try {
            const auditId = `AUD-${Date.now()}`;
            const userEmail = localStorage.getItem('user_email');

            // 1. Create Audit
            const { error: auditError } = await supabase.from('auditorias').insert({
                id: auditId,
                tipo,
                loja_id: lojaId,
                usuario_email: userEmail,
                score: stats.score
            });

            if (auditError) throw auditError;

            // 2. Process Items
            const entries = Object.entries(items);
            const payloadWithNames = await Promise.all(entries.map(async ([key, val]) => {
                // Save ALL marked items, not just non-conform
                if (val.status === 'pendente') return null;

                const [catId, itemIdx] = key.split('-');
                const cat = categories.find((c: any) => c.id === catId);
                const itemName = cat?.items[parseInt(itemIdx)] || key;

                let foto_url = null;
                if (val.file) {
                    try {
                        foto_url = await uploadImageToDiscord(val.file, `${auditId}_${key}.jpg`);
                    } catch (e) {
                        console.error("Discord item upload failed", e);
                    }
                }

                return {
                    id: `${auditId}_${key}`,
                    auditoria_id: auditId,
                    item: itemName,
                    status: val.status,
                    observacao: val.obs,
                    foto_url: foto_url
                };
            }));

            const finalPayload = payloadWithNames.filter(i => i !== null);

            if (finalPayload.length > 0) {
                const { error: itemsError } = await supabase.from('itens_auditoria').insert(finalPayload);
                if (itemsError) throw itemsError;
            }

            // 3. Process Category Photos
            const catPhotosPayload = [];
            for (const [catId, file] of Object.entries(categoryFiles)) {
                let foto_url = null;
                try {
                    foto_url = await uploadImageToDiscord(file, `${auditId}_CAT_${catId}.jpg`);
                } catch (e) {
                    console.error("Discord cat upload failed", e);
                }

                const catName = categories.find((c: any) => c.id === catId)?.name || catId;

                catPhotosPayload.push({
                    id: `${auditId}_CAT_${catId}`,
                    auditoria_id: auditId,
                    item: `[FOTO GERAL] ${catName}`,
                    status: 'foto_categoria',
                    observacao: '',
                    foto_url: foto_url || ''
                });
            }

            if (catPhotosPayload.length > 0) {
                const { error: catError } = await supabase.from('itens_auditoria').insert(catPhotosPayload);
                if (catError) throw catError;
            }

            // 4. Send Summary to Discord
            try {
                await sendAuditLog({
                    score: stats.score,
                    loja: `Loja ${lojaId}`,
                    auditor: userEmail,
                    marked: stats.marked,
                    total: stats.total,
                    nao_conformes: stats.nao_conformes
                }, typeLabel || 'Auditoria');
            } catch (e) {
                console.error("Failed to send Discord Log", e);
            }

            // 5. Generate and Send PDF
            try {
                const doc = await generateAuditPDF(
                    { ...stats, tipo: typeLabel || '' },
                    items,
                    categories,
                    lojaId || 'Desconhecida',
                    userEmail || 'Desconhecido',
                    categoryFiles
                );

                const filename = `Auditoria_${lojaId}_${new Date().toISOString().split('T')[0]}.pdf`;

                // 5a. Download PDF
                doc.save(filename);

                // 5b. Send Email to Central Admin
                const centralEmail = 'luizobmendonca2026@gmail.com';
                const pdfBlob = doc.output('blob');
                try {
                    await sendAuditEmail(centralEmail, pdfBlob, filename, lojaId || 'Desconhecida');
                } catch (emailErr: any) {
                    console.error("Resend Error:", emailErr);
                }
            } catch (e) {
                console.error("Failed to process PDF/Email", e);
                alert("Erro ao processar PDF ou Email, mas a auditoria foi salva.");
            }

            alert('Auditoria finalizada com sucesso! Fotos enviadas, e-mail enviado e PDF baixado.');
            clearDraft();
            navigate('/');
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao salvar auditoria: ${error.message || JSON.stringify(error)}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (!tipo) return <div>Tipo inválido</div>;

    const scoreColor = stats.score >= 80 ? 'text-brand-blue' : stats.score >= 60 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="pb-32 bg-gray-50 min-h-screen">
            {/* 3. HEADER: Score maior e mais visível */}
            < div className="bg-white shadow-sm p-4 text-center border-b border-gray-100" >
                <h1 className="text-base font-semibold text-gray-800 uppercase tracking-wide mb-1">{typeLabel}</h1>
                <div className={`text-4xl font-bold ${scoreColor} mb-1`}>
                    {stats.score}%
                </div>
                <div className="text-xs text-gray-400 font-medium">
                    {stats.marked}/{stats.total} itens revisados
                </div>
            </div >

            <div className="p-4 space-y-3">
                {categories.map((cat: any) => (
                    <Accordion key={cat.id} title={cat.name} defaultOpen>
                        <div className="space-y-3 py-1">
                            {cat.items.map((item: string, idx: number) => {
                                const key = `${cat.id}-${idx}`;
                                const state = items[key] || { status: 'pendente' };
                                const isMarked = state.status !== 'pendente';

                                // 10. VALIDAÇÃO VISUAL
                                const borderClass = isMarked
                                    ? (state.status === 'conforme' ? 'border-green-400 bg-green-50/30' : 'border-red-400 bg-red-50/30')
                                    : 'border-gray-200 border-dashed';

                                return (
                                    <div key={key} className={`border rounded-lg p-3 transition-all duration-200 ${borderClass}`}>
                                        <p className="mb-3 font-medium text-gray-700 text-sm leading-tight">{item}</p>

                                        {/* 1. BOTÕES DE STATUS: Layout horizontal compacto */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusChange(key, 'conforme')}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg border transition-all active:scale-95 touch-manipulation ${state.status === 'conforme' ? 'bg-green-500 border-green-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                                            >
                                                <span className="text-lg">✅</span>
                                                <span className="text-sm font-semibold">OK</span>
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(key, 'nao_conforme')}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg border transition-all active:scale-95 touch-manipulation ${state.status === 'nao_conforme' ? 'bg-brand-red border-red-700 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                                            >
                                                <span className="text-lg">❌</span>
                                                <span className="text-sm font-semibold">Não</span>
                                            </button>
                                        </div>

                                        {/* 4. BOTÃO ANEXAR FOTO & OBSERVAÇÃO */}
                                        <div className="mt-3 flex flex-col gap-2">
                                            {state.status === 'nao_conforme' && (
                                                <textarea
                                                    placeholder="Descreva o problema..."
                                                    className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-200 outline-none transition-shadow"
                                                    rows={2}
                                                    value={state.obs}
                                                    onChange={(e) => handleObsChange(key, e.target.value)}
                                                />
                                            )}

                                            <label className={`flex items-center justify-center gap-2 cursor-pointer py-2 px-3 rounded-lg border transition-colors w-full ${state.file ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                                                <span className="text-base">📷</span>
                                                <span className="text-xs font-medium truncate max-w-[200px]">
                                                    {state.file ? state.file.name : 'Foto'}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                                                />
                                            </label>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* FOTO DA CATEGORIA */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-dashed transition-colors ${categoryFiles[cat.id] ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'}`}>
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <span className="text-xl">📸</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Foto Geral: {cat.name}</p>
                                    <p className="text-xs text-blue-500 truncate">
                                        {categoryFiles[cat.id] ? categoryFiles[cat.id].name : 'Toque para adicionar'}
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleCategoryFile(cat.id, e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                    </Accordion>
                ))}
            </div>

            {/* 5. FOOTER FIXO: Sticky bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30 p-4 pb-6 safely-bottom">
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex gap-3 text-sm font-medium text-gray-600">
                        <span className="flex items-center gap-1">✅ {stats.conformes}</span>
                        <span className="flex items-center gap-1">❌ {stats.nao_conformes}</span>
                        <span className="flex items-center gap-1 text-gray-400">⏳ {stats.pendentes}</span>
                    </div>
                </div>

                <button
                    className={`w-full py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] shadow-lg ${stats.progress >= 80 && !submitting
                        ? 'bg-brand-blue text-white shadow-blue-200 animate-pulse-slow'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    disabled={stats.progress < 80 || submitting}
                    onClick={() => setShowConfirm(true)}
                >
                    {submitting ? 'Enviando...' : `Finalizar Auditoria (${stats.score}%)`}
                    {stats.progress < 80 && <span className="block text-[10px] font-normal opacity-80 mt-0.5">Mínimo 80% preenchido</span>}
                </button>
            </div>

            <Modal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                title="Confirmar Envio"
                footer={
                    <div className="flex gap-3 w-full">
                        <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-600">Cancelar</button>
                        <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 bg-brand-blue text-white rounded-lg font-bold shadow-md">Confirmar</button>
                    </div>
                }
            >
                <div className="text-center py-4">
                    <div className="text-4xl mb-2">🚀</div>
                    <p className="text-gray-800 font-medium">Tem certeza que deseja finalizar?</p>
                    <p className="text-sm text-gray-500 mt-1">O score final será <span className={`font-bold ${scoreColor}`}>{stats.score}%</span></p>
                </div>
            </Modal>
        </div >
    );
};

export default Audit;
