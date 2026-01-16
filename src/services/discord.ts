const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

export const uploadImageToDiscord = async (file: File, filename: string): Promise<string> => {
    if (!WEBHOOK_URL) throw new Error("Discord Webhook URL not configured");

    const formData = new FormData();
    const renamedFile = new File([file], filename, { type: file.type });
    formData.append('file', renamedFile);

    // Discord Webhook accepts `content` too if we want a message with it,
    // but here we just want the file URL.
    // We send payload_json to suppress the default notification if possible, 
    // or just send the file.

    // Note: Discord Webhooks return the message object if ?wait=true
    const response = await fetch(`${WEBHOOK_URL}?wait=true`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Discord Upload Failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.attachments && data.attachments.length > 0) {
        return data.attachments[0].url;
    }

    throw new Error("No attachment URL returned from Discord");
};

export const sendAuditLog = async (auditData: any, auditType: string) => {
    if (!WEBHOOK_URL) return;

    const embed = {
        title: `✅ Auditoria Finalizada: ${auditType}`,
        color: auditData.score >= 80 ? 5763719 : (auditData.score >= 60 ? 16776960 : 15548997), // Green, Yellow, Red
        fields: [
            { name: "Loja", value: auditData.loja || "N/A", inline: true },
            { name: "Score", value: `${auditData.score}%`, inline: true },
            { name: "Auditor", value: auditData.auditor || "Desconhecido", inline: true },
            { name: "Itens Verificados", value: `${auditData.marked}/${auditData.total}`, inline: true },
            { name: "Não Conformidades", value: `${auditData.nao_conformes}`, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: "Drogaria ABC"
        }
    };

    await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: "Audit Bot",
            embeds: [embed]
        })
    });
};
