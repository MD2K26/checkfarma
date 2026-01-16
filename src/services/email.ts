const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

export const sendAuditEmail = async (toEmail: string, pdfBlob: Blob, filename: string, storeName: string) => {
    if (!RESEND_API_KEY) {
        console.error("Resend API Key not configured");
        return;
    }

    try {
        // Convert Blob to Base64 for Resend attachment
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(pdfBlob);
        });

        const base64Content = await base64Promise;

        const response = await fetch('/api-resend/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev', // Resend default test domain
                to: [toEmail],
                subject: `Relatório de Auditoria - ${storeName}`,
                html: `
                    <div style="font-family: sans-serif; color: #333;">
                        <h2 style="color: #1a468e;">Relatório de Auditoria Finalizado</h2>
                        <p>Olá,</p>
                        <p>A auditoria da loja <strong>${storeName}</strong> foi concluída com sucesso.</p>
                        <p>O relatório detalhado em PDF segue em anexo.</p>
                        <br/>
                        <hr/>
                        <p style="font-size: 12px; color: #888;">Sistema de Auditoria Interna - Drogaria ABC</p>
                    </div>
                `,
                attachments: [
                    {
                        filename: filename,
                        content: base64Content,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send email');
        }

        console.log("Email sent successfully to:", toEmail);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
