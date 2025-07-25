import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { isDateExpired } from '../utils/dateUtils';
import { extractTextFromPDF } from '../utils/pdfParser.util';
import { detectDocumentType, findExpirationDate } from '../utils/documentUtils.util';
import { DocumentConfig, DocumentType, AnalysisResult, DocumentInfo } from '../types/documentTypes';

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

function waitForFile(filePath: string, timeout = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
            if (fs.existsSync(filePath)) {
                clearInterval(interval);
                resolve();
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error("Fichier pas prêt: " + filePath));
            }
        }, 50);
    });
}

export class DocumentAnalyzerService {
    public async analyze(zipFilePath: string): Promise<AnalysisResult> {
        const zip = new AdmZip(zipFilePath);
        const zipEntries = zip.getEntries();
        const tempDir = path.join(__dirname, '../../temp');

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const logs: string[] = [];
        const log = (message: string) => {
            console.log(message);
            logs.push(message);
        };

        const result: AnalysisResult = {
            documents: [],
            missing: Object.keys(DOCUMENT_CONFIG) as DocumentType[],
            expired: [],
        };

        for (const entry of zipEntries) {
            const normalizedEntryName = entry.entryName.replace(/\\/g, '/');
            const filename = path.basename(normalizedEntryName);
            log(`🗂️  Fichier trouvé : ${filename}`);

            if (normalizedEntryName.startsWith('._') || entry.isDirectory) {
                log(`⏩ Fichier ignoré (macOS ou répertoire): ${normalizedEntryName}`);
                continue;
            }

            if (!filename.toLowerCase().endsWith('.pdf')) {
                log(`⏭️  Fichier non-PDF ignoré: ${filename}`);
                continue;
            }

            const fullPath = path.join(tempDir, filename);
            const dirPath = path.dirname(fullPath);

            try {
                fs.mkdirSync(dirPath, { recursive: true });
                zip.extractEntryTo(entry, tempDir, false, true);
                await waitForFile(fullPath);

                const text = await extractTextFromPDF(fullPath);
                if (!text || text.trim().length === 0) {
                    log(`⚠️  Aucun texte extrait du fichier: ${filename}`);
                    continue;
                }

                const docType = detectDocumentType(filename, text, DOCUMENT_CONFIG);
                if (!docType) {
                    log(`❌ Type non reconnu pour: ${filename}`);
                    continue;
                }

                const expirationDate = findExpirationDate(text, DOCUMENT_CONFIG[docType].datePatterns);
                if (!expirationDate) {
                    log(`📄 Type détecté: ${docType} - Pas de date trouvée`);
                } else {
                    log(`📄 Type détecté: ${docType} - Date: ${expirationDate}`);
                }

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

            } catch (error: any) {
                log(`❗ Erreur avec ${filename}: ${error.message}`);
            } finally {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    log(`🧹 Fichier supprimé: ${filename}`);
                }
            }
        }

        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }

        return result;
    }
}