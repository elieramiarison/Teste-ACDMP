import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { isDateExpired } from '../utils/dateUtils';
import { extractTextFromPDF } from '../utils/pdfParser.util';
import { detectDocumentType, findExpirationDate } from '../utils/documentUtils.util';
import {
    DocumentConfig,
    DocumentType,
    AnalysisResult,
    DocumentInfo
} from '../types/documentTypes';

// Configuration des types de documents et expressions régulières associées
export const DOCUMENT_CONFIG: DocumentConfig = {
    KBIS: {
        patterns: [/kbis/i, /extrait k/i],
        datePatterns: [/(\d{2}\/\d{2}\/\d{4})/i],
    },
    DC1: {
        patterns: [/dc1/i, /déclaration de conformité/i],
        datePatterns: [/(\d{2}\/\d{2}\/\d{4})/i],
    },
    ATTESTATION_FISCALE: {
        patterns: [/attestation fiscale/i, /avis d['’]imposition/i, /imp[oô]ts/i],
        datePatterns: [/(\d{2}\/\d{2}\/\d{4})/i],
    },
    NOTE_INTERNE: {
        patterns: [/note interne/i, /note d'information/i, /communication interne/i, /document\s*interne/i],
        datePatterns: [/(\d{2}\/\d{2}\/\d{4})/i],
    }
};

// Attente que le fichier soit bien extrait avant lecture
function waitForFile(filePath: string, timeout = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
            if (fs.existsSync(filePath)) {
                clearInterval(interval);
                resolve();
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error(`Fichier pas prêt : ${filePath}`));
            }
        }, 50);
    });
}

export class DocumentAnalyzerService {
    public async analyze(zipFilePath: string): Promise<AnalysisResult> {
        const zip = new AdmZip(zipFilePath);
        const zipEntries = zip.getEntries();
        const tempDir = path.join(__dirname, '../../temp');

        fs.mkdirSync(tempDir, { recursive: true });

        const logs: string[] = [];
        const log = (msg: string) => {
            logs.push(msg);
        };

        const result: AnalysisResult = {
            documents: [],
            missing: Object.keys(DOCUMENT_CONFIG) as DocumentType[],
            expired: [],
            logs
        };

        for (const entry of zipEntries) {
            const normalizedName = entry.entryName.replace(/\\/g, '/');
            const filename = path.basename(normalizedName);
            // log(`Fichier trouvé : ${filename}`);

            if (entry.isDirectory || filename.startsWith('._')) {
                // log(`Fichier ignoré : ${normalizedName}`);
                continue;
            }

            if (!filename.toLowerCase().endsWith('.pdf')) {
                // log(`Fichier non PDF ignoré : ${filename}`);
                continue;
            }

            const fullPath = path.join(tempDir, filename);
            const dirPath = path.dirname(fullPath);

            try {
                fs.mkdirSync(dirPath, { recursive: true });
                zip.extractEntryTo(entry, tempDir, false, true);
                await waitForFile(fullPath);

                const text = await extractTextFromPDF(fullPath);

                if (!text?.trim()) {
                    // log(`Aucun texte extrait du fichier : ${filename}`);
                    continue;
                }

                const docType = detectDocumentType(filename, text, DOCUMENT_CONFIG);

                if (!docType) {
                    // log(`Type non reconnu pour : ${filename}`);
                    continue;
                }

                const expirationDate = findExpirationDate(text, DOCUMENT_CONFIG[docType].datePatterns);

                const docInfo: DocumentInfo = {
                    filename,
                    type: docType,
                    expirationDate,
                    isValid: expirationDate ? !isDateExpired(expirationDate) : false
                };

                result.documents.push(docInfo);
                result.missing = result.missing.filter(type => type !== docType);

                if (expirationDate && !docInfo.isValid) {
                    result.expired.push(docInfo);
                }
            } catch (err: any) {
                console.log(`Erreur avec ${filename} : ${err.message}`);
            } finally {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        }

        fs.rmSync(tempDir, { recursive: true, force: true });
        return result;
    }
}
