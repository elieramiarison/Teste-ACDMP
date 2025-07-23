import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { parse } from 'date-fns';
// import { extractTextFromPDF } from '../utils/pdfParser.util';
// import { detectDocumentType, findExpirationDate } from '../utils/documentUtils.util';
import { extractTextFromPDF } from '../utils/pdfParser.util';
import { detectDocumentType, findExpirationDate } from '../utils/documentUtils.util';
import { DocumentConfig, DocumentType, AnalysisResult, DocumentInfo } from '../types/documentTypes';

const DOCUMENT_CONFIG: DocumentConfig = {
    KBIS: {
        patterns: [/kbis/i, /extrait k/i, /registre du commerce/i],
        datePatterns: [
            /date d'émission:\s*(\d{2}\/\d{2}\/\d{4})/i,
            /émis le\s*(\d{2}\/\d{2}\/\d{4})/i
        ]
    },
    DC1: {
        patterns: [/dc1/i, /déclaration de conformité/i],
        datePatterns: [
            /date de validité:\s*(\d{2}\/\d{2}\/\d{4})/i,
            /valable jusqu'au\s*(\d{2}\/\d{2}\/\d{4})/i
        ]
    },
    ASSURANCE: {
        patterns: [/assurance/i, /attestation d'assurance/i],
        datePatterns: [
            /date d'expiration:\s*(\d{2}\/\d{2}\/\d{4})/i,
            /valable jusqu'au\s*(\d{2}\/\d{2}\/\d{4})/i
        ]
    }
};

export class DocumentAnalyzerService {
    public async analyze(zipFilePath: string): Promise<AnalysisResult> {
        const zip = new AdmZip(zipFilePath);
        const zipEntries = zip.getEntries();
        const tempDir = path.join(__dirname, '../../temp');

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const result: AnalysisResult = {
            documents: [],
            missing: Object.keys(DOCUMENT_CONFIG) as DocumentType[],
            expired: []
        };

        for (const entry of zipEntries) {
            if (entry.entryName.match(/\.pdf$/i)) {
                const filePath = path.join(tempDir, entry.entryName);
                zip.extractEntryTo(entry, tempDir, false, true);

                try {
                    const text = await extractTextFromPDF(filePath);
                    const docType = detectDocumentType(entry.entryName, text, DOCUMENT_CONFIG);

                    if (docType) {
                        const expirationDate = findExpirationDate(text, DOCUMENT_CONFIG[docType].datePatterns);
                        const isExpired = expirationDate && this.isDateExpired(expirationDate);

                        const docInfo: DocumentInfo = {
                            filename: entry.entryName,
                            type: docType,
                            expirationDate,
                            isValid: !isExpired
                        };

                        result.documents.push(docInfo);
                        result.missing = result.missing.filter(type => type !== docType);

                        if (isExpired) {
                            result.expired.push(docInfo);
                        }
                    }
                } finally {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            }
        }

        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true });
        }

        return result;
    }

    private isDateExpired(dateStr: string): boolean {
        try {
            const date = parse(dateStr, 'dd/MM/yyyy', new Date());
            return date < new Date();
        } catch {
            return false;
        }
    }
}