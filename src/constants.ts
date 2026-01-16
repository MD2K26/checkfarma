export const CATEGORIES = {
    abertura: [
        { id: 'fachada', name: 'Fachada', items: ['Letreiro iluminado', 'Porta limpa', 'Tapete limpo', 'Jardim limpo', 'Lixeiras vazias'] },
        { id: 'luz', name: 'Iluminação', items: ['Lâmpadas ok', 'Gôndolas ok', 'Letreiros ok', 'Caixa ok'] },
        { id: 'gond', name: 'Gôndolas', items: ['Pontas ok', 'Preços ok', 'Abastecido 80%', 'Cestos ok', 'Displays ok', 'Cross ok'] },
        { id: 'limp', name: 'Limpeza', items: ['Piso limpo', 'Sem poeira', 'Banheiros ok', 'Caixa ok', 'Lixeiras vazias'] },
        { id: 'equip', name: 'Equipamentos', items: ['PDVs ok', 'Ar ok', 'Geladeiras ok', 'Balança ok'] }
    ],
    fechamento: [
        { id: 'caixa', name: 'Caixa', items: ['Sangria realizada', 'Fundo de troco conferido', 'Cupom fiscal emitido'] },
        { id: 'seg', name: 'Segurança', items: ['Alarmes ativados', 'Portas trancadas', 'Câmeras funcionando'] },
        { id: 'estoque', name: 'Estoque', items: ['Entregas guardadas', 'Produtos vencidos retirados'] },
        { id: 'limp', name: 'Limpeza', items: ['Lixo retirado', 'Chão varrido'] }
    ],
    jbp: [
        { id: 'vis', name: 'Visibilidade', items: ['Materiais de merchandising aplicados', 'Planograma seguido'] },
        { id: 'exec', name: 'Execução', items: ['Preço correto', 'Sem ruptura', 'FIFO respeitado'] }
    ]
};

export const AUDIT_TYPES = [
    { id: 'abertura', label: 'Abertura de Loja' },
    { id: 'fechamento', label: 'Fechamento de Loja' },
    { id: 'jbp', label: 'Auditoria JBP' },
];
