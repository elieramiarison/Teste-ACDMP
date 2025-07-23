import fs from 'fs/promises';
import pdf from 'pdf-parse';

export async function extractTextFromPDF(filePath: string): Promise<string> {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return '';
    }
}