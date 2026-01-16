import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Card from './Card';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newUser, setNewUser] = useState({ nome: '', email: '', senha: '', role: 'auditor' });

    const fetchUsers = async () => {
        const { data } = await supabase.from('usuarios').select('*').order('nome');
        if (data) setUsers(data);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('usuarios').insert([newUser]);
            if (error) throw error;
            alert('Usuário criado com sucesso!');
            setNewUser({ nome: '', email: '', senha: '', role: 'auditor' });
            fetchUsers();
        } catch (error: any) {
            alert('Erro ao criar usuário: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        try {
            const { error } = await supabase.from('usuarios').delete().eq('id', id);
            if (error) throw error;
            fetchUsers();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Cadastrar Novo Usuário</h3>
                <form onSubmit={handleCreateUser} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded"
                            value={newUser.nome}
                            onChange={e => setNewUser({ ...newUser, nome: e.target.value })}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                        <input
                            type="email"
                            required
                            className="w-full p-2 border rounded"
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Senha</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded"
                            value={newUser.senha}
                            onChange={e => setNewUser({ ...newUser, senha: e.target.value })}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Função</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={newUser.role}
                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="auditor">Auditor</option>
                            <option value="admin">Gestor (Admin)</option>
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-brand-blue text-white rounded hover:bg-blue-800 font-bold"
                        >
                            {loading ? 'Salving...' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {users.map(u => (
                    <Card key={u.id} className="p-4 bg-white flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-800">{u.nome}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                {u.role === 'admin' ? 'Gestor' : 'Auditor'}
                            </span>
                        </div>
                        <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Excluir"
                        >
                            🗑️
                        </button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default UserManagement;
