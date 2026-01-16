
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Service Role Key is best, currently using Anon
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_API_KEY) {
    console.error('Missing Environment Variables: SUPABASE_URL, SUPABASE_KEY, or RESEND_API_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log(`[${new Date().toISOString()}] Starting Daily Audit Check...`);

    // 1. Get all Active Stores
    const { data: stores, error: storeError } = await supabase
        .from('lojas')
        .select('id, nome');

    if (storeError) throw storeError;
    console.log(`Found ${stores.length} stores.`);

    // 2. Get today's audits (Start of day in Brazil Time roughly or UTC?)
    // Using UTC start of day for simplicity, or local time if critical.
    // For simplicity, we check audits created after 00:00:00 UTC today.
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: audits, error: auditError } = await supabase
        .from('auditorias')
        .select('loja_id')
        .gte('created_at', `${todayStr}T00:00:00.000Z`);

    if (auditError) throw auditError;

    const auditedStoreIds = new Set(audits.map(a => a.loja_id));

    // 3. Find Missing Stores
    const missingStores = stores.filter(s => !auditedStoreIds.has(s.id));
    console.log(`Missing Audits: ${missingStores.length} stores.`);

    if (missingStores.length === 0) {
        console.log("All stores have audited today. Job done.");
        return;
    }

    // 4. Get Emails for Missing Stores
    // We fetch user_stores to find who is responsible for these stores
    const { data: assignments, error: assignError } = await supabase
        .from('user_stores')
        .select('email, loja_id')
        .in('loja_id', missingStores.map(s => s.id));

    if (assignError) throw assignError;

    // Map store_id -> email(s)
    const storeEmails = {};
    assignments.forEach(a => {
        storeEmails[a.loja_id] = a.email;
    });

    // 5. Send Reminders
    for (const store of missingStores) {
        const email = storeEmails[store.id];

        if (!email) {
            console.warn(`No email assigned for store ${store.nome} (ID: ${store.id}). Skipping.`);
            continue;
        }

        console.log(`Sending reminder to ${email} for store ${store.nome}...`);

        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'compliance@resend.dev', // Can change to custom domain if verified
                    to: [email],
                    subject: `⚠️ Pendência: Auditoria Diária - ${store.nome}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <h2 style="color: #d31320;">Ameça de Pendência Detectada</h2>
                            <p>Olá,</p>
                            <p>Identificamos que a auditoria da loja <strong>${store.nome}</strong> ainda não foi enviada hoje (${new Date().toLocaleDateString('pt-BR')}).</p>
                            <p>Por favor, realize o envio o mais breve possivel para manter a conformidade.</p>
                            <br/>
                            <a href="https://checkfarma.vercel.app/" style="background: #1a468e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                                Acessar Sistema
                            </a>
                            <hr/>
                            <p style="font-size: 12px; color: #888;">Sistema Automático - Drogaria ABC</p>
                        </div>
                    `
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error(`Failed to email ${email}:`, errData);
            } else {
                console.log(`Email sent to ${email}`);
            }

        } catch (e) {
            console.error(`Error sending to ${email}`, e);
        }
    }

    console.log("Daily Check Completed.");
}

main().catch(e => {
    console.error("Fatal Error:", e);
    process.exit(1);
});
