// import fs from 'fs/promises';
// import pdf from 'pdf-parse';

// export async function extractTextFromPDF(filePath: string): Promise<string> {
//     try {
//         const dataBuffer = await fs.readFile(filePath);
//         const data = await pdf(dataBuffer);
//         return data.text;
//     } catch (error) {
//         console.error('Error extracting text from PDF:', error);
//         return '';
//     }
// }

import fs from 'fs/promises'; // Import asynchrone
import pdf from 'pdf-parse';

export async function extractTextFromPDF(filePath: string): Promise<string> {
    try {
        // Version corrigée avec readFile (asynchrone)
        const dataBuffer = await fs.readFile(filePath); // Notez le 'await' ici
        const data = await pdf(dataBuffer);

        console.log("\n=== TEXTE EXTRAIT ===");
        console.log(data.text.substring(0, 500) + (data.text.length > 500 ? "..." : ""));
        console.log("=== FIN ===\n");

        return data.text;
    } catch (error) {
        console.error("Erreur d'extraction PDF:", error);
        return "";
    }
}