import fs from 'fs/promises';
import pdf from 'pdf-parse';

import path from 'path';
import { convertPdfToImage } from './pdfToImage.util';
import { extractTextWithOCR } from './ocr.util';

export async function extractTextFromPDF(filePath: string): Promise<string> {

    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);

        if (data.text.trim().length > 0) {
            return data.text;
        } else {
            throw new Error('PDF vide — OCR requis');
        }
    } catch (error: any) {
        console.warn(`PDF-parse échoué ou vide. OCR en cours sur: ${filePath} - ${error.message}`);
        try {
            const imagePath = await convertPdfToImage(filePath, path.join(__dirname, '../../temp/img'));
            const ocrText = await extractTextWithOCR(imagePath);
            return ocrText;
        } catch (ocrError: any) {
            console.error("Échec OCR également:", ocrError.message);
            return "";
        }
    }
}