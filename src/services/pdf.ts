import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAuditPDF = async (
    auditData: any,
    items: any,
    categories: any[],
    lojaId: string,
    userEmail: string,
    categoryFiles?: Record<string, File>
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFillColor(26, 70, 142); // brand-blue #1a468e
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Auditoria', 14, 25);

    doc.setFontSize(10);
    doc.text('Drogaria ABC', 14, 32);

    doc.setFontSize(16);
    doc.text(`${auditData.score}% APROVAÇÃO`, pageWidth - 14, 25, { align: 'right' });
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - 14, 32, { align: 'right' });

    yPos = 50;

    // Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Loja: ${lojaId}`, 14, yPos);
    doc.text(`Auditor: ${userEmail}`, 14, yPos + 6);
    doc.text(`Tipo: ${auditData.tipo || 'Geral'}`, 14, yPos + 12);

    yPos += 25;

    // 1. Process Photos (General/Categories and Non-conformities)
    const photosToRender = [];

    // Add category photos
    if (categoryFiles) {
        for (const [catId, file] of Object.entries(categoryFiles)) {
            const catName = categories.find((c: any) => c.id === catId)?.name || catId;
            photosToRender.push({ title: `[FOTO GERAL] ${catName}`, file });
        }
    }

    // Add non-conformities or items with photos
    for (const [key, val] of Object.entries(items) as any) {
        if (val.file) {
            const [catId, itemIdx] = key.split('-');
            const cat = categories.find((c: any) => c.id === catId);
            const itemName = cat?.items[parseInt(itemIdx)] || key;
            photosToRender.push({
                title: itemName,
                file: val.file,
                obs: val.obs,
                status: val.status === 'nao_conforme' ? 'NÃO CONFORME' : 'CONFORME'
            });
        }
    }

    if (photosToRender.length > 0) {
        doc.setFillColor(100, 100, 100);
        doc.rect(14, yPos, pageWidth - 28, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`EVIDÊNCIAS FOTOGRÁFICAS (${photosToRender.length})`, 16, yPos + 6);
        yPos += 15;
        doc.setTextColor(0);

        for (const photo of photosToRender) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(`• ${photo.title}`, 14, yPos);
            if (photo.status) {
                const statusColor = photo.status === 'NÃO CONFORME' ? [211, 19, 32] : [34, 197, 94];
                doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
                doc.text(` [${photo.status}]`, pageWidth - 14, yPos, { align: 'right' });
                doc.setTextColor(0);
            }
            yPos += 6;

            if (photo.obs) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(80);
                const splitObs = doc.splitTextToSize(`Obs: ${photo.obs}`, pageWidth - 30);
                doc.text(splitObs, 18, yPos);
                yPos += (splitObs.length * 5) + 4;
            }

            try {
                const base64 = await fileToBase64(photo.file);
                const imgProps = doc.getImageProperties(base64);
                const pdfWidth = 100;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                if (yPos + pdfHeight > 280) { doc.addPage(); yPos = 20; }
                doc.addImage(base64, 'JPEG', 18, yPos, pdfWidth, pdfHeight);
                yPos += pdfHeight + 12;
            } catch (e) {
                console.error("Image processing failed for PDF", e);
            }
            yPos += 2;
        }
    }

    // Performance Summary Table
    autoTable(doc, {
        startY: Math.max(yPos + 10, 200),
        head: [['Métrica', 'Valor']],
        body: [
            ['Score Final', `${auditData.score}%`],
            ['Itens Verificados', `${auditData.marked}/${auditData.total}`],
            ['Conformidades', `${auditData.conformes}`],
            ['Não Conformidades', `${auditData.nao_conformes}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [26, 70, 142] }
    });

    return doc;
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};
