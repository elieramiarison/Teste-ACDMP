import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { isDateExpired } from '../utils/dateUtils';
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

// const DOCUMENT_CONFIG: DocumentConfig = {
//   KBIS: {
//     patterns: [/kbis/i, /extrait k/i, /registre du commerce/i],
//     datePatterns: [
//       /date d'émission:\s*(\d{2}\/\d{2}\/\d{4})/i,
//       /émis le\s*(\d{2}\/\d{2}\/\d{4})/i,
//       /valable jusqu[’']?au\s*(\d{2}\/\d{2}\/\d{4})/i
//     ]
//   },
//   DC1: {
//     patterns: [/dc1/i, /déclaration du candidat/i],
//     datePatterns: [
//       /date de validité:\s*(\d{2}\/\d{2}\/\d{4})/i,
//       /valable jusqu[’']?au\s*(\d{2}\/\d{2}\/\d{4})/i,
//       /signé le\s*(\d{2}\/\d{2}\/\d{4})/i
//     ]
//   },
//   DC2: {
//     patterns: [/dc2/i, /capacités du candidat/i],
//     datePatterns: [
//       /date de dépôt:\s*(\d{2}\/\d{2}\/\d{4})/i,
//       /valable jusqu[’']?au\s*(\d{2}\/\d{2}\/\d{4})/i
//     ]
//   },
//   ASSURANCE: {
//     patterns: [/assurance/i, /attestation d'assurance/i, /rc pro/i],
//     datePatterns: [
//       /expiration\s*:\s*(\d{2}\/\d{2}\/\d{4})/i,
//       /valable jusqu[’']?au\s*(\d{2}\/\d{2}\/\d{4})/i
//     ]
//   },
//   ATTESTATION_FISCALE: {
//     patterns: [/attestation fiscale/i, /obligations fiscales/i, /ursaff/i],
//     datePatterns: [
//       /émise le\s*(\d{2}\/\d{2}\/\d{4})/i,
//       /valable jusqu[’']?au\s*(\d{2}\/\d{2}\/\d{4})/i
//     ]
//   },
//   ATTESTATION_SOCIALE: {
//     patterns: [/attestation sociale/i, /cotisations sociales/i],
//     datePatterns: [
//       /émise le\s*(\d{2}\/\d{2}\/\d{4})/i,
//       /valable jusqu[’']?au\s*(\d{2}\/\d{2}\/\d{4})/i
//     ]
//   },
//   RIB: {
//     patterns: [/relevé d'identité bancaire/i, /\bRIB\b/i],
//     datePatterns: []
//   },
//   IDENTITE_DIRIGEANT: {
//     patterns: [/pièce d'identité/i, /carte nationale d'identité/i, /passeport/i],
//     datePatterns: [
//       /valable jusqu[’']?au\s*(\d{2}\/\d{2}\/\d{4})/i,
//       /expiration\s*:\s*(\d{2}\/\d{2}\/\d{4})/i
//     ]
//   }
// };


// export class DocumentAnalyzerService {
//     public async analyze(zipFilePath: string): Promise<AnalysisResult> {
//         const zip = new AdmZip(zipFilePath);
//         const zipEntries = zip.getEntries();
//         const tempDir = path.join(__dirname, '../../temp');

//         if (!fs.existsSync(tempDir)) {
//             fs.mkdirSync(tempDir);
//         }

//         const result: AnalysisResult = {
//             documents: [],
//             missing: Object.keys(DOCUMENT_CONFIG) as DocumentType[],
//             expired: []
//         };

//         for (const entry of zipEntries) {
//             if (entry.entryName.match(/\.pdf$/i)) {
//                 const filePath = path.join(tempDir, entry.entryName);
//                 zip.extractEntryTo(entry, tempDir, false, true);

//                 console.log(`\n=== Analyse du fichier ${entry.entryName} ===`);
//                 const text = await extractTextFromPDF(filePath);
//                 console.log("Contenu texte brut extrait :", text); // ← LOG CRUCIAL ICI
//                 console.log("=== Fin du contenu ===\n");

//                 try {
//                     const text = await extractTextFromPDF(filePath);
//                     const docType = detectDocumentType(entry.entryName, text, DOCUMENT_CONFIG);

//                     if (docType) {
//                         const expirationDate = findExpirationDate(text, DOCUMENT_CONFIG[docType].datePatterns);
//                         const isExpired = expirationDate && this.isDateExpired(expirationDate);

//                         const docInfo: DocumentInfo = {
//                             filename: entry.entryName,
//                             type: docType,
//                             expirationDate,
//                             isValid: !isExpired
//                         };

//                         result.documents.push(docInfo);
//                         result.missing = result.missing.filter(type => type !== docType);

//                         if (isExpired) {
//                             result.expired.push(docInfo);
//                         }
//                     }
//                 } finally {
//                     if (fs.existsSync(filePath)) {
//                         fs.unlinkSync(filePath);
//                     }
//                 }
//             }
//         }

//         if (fs.existsSync(tempDir)) {
//             fs.rmSync(tempDir, { recursive: true });
//         }

//         return result;
//     }

//     private isDateExpired(dateStr: string): boolean {
//         try {
//             const date = parse(dateStr, 'dd/MM/yyyy', new Date());
//             return date < new Date();
//         } catch {
//             return false;
//         }
//     }
// }


// Afa koa
// export class DocumentAnalyzerService {
//     public async analyze(zipFilePath: string): Promise<AnalysisResult> {
//         const zip = new AdmZip(zipFilePath);
//         const zipEntries = zip.getEntries();
//         const tempDir = path.join(__dirname, '../../temp');

//         if (!fs.existsSync(tempDir)) {
//             fs.mkdirSync(tempDir, { recursive: true }); // Ajout de recursive
//         }

//         const result: AnalysisResult = {
//             documents: [],
//             missing: Object.keys(DOCUMENT_CONFIG) as DocumentType[],
//             expired: []
//         };

//         for (const entry of zipEntries) {
//             if (entry.entryName.match(/\.pdf$/i)) {
//                 // Créer la structure de dossiers si nécessaire
//                 const fullPath = path.join(tempDir, entry.entryName);
//                 const dirPath = path.dirname(fullPath);

//                 if (!fs.existsSync(dirPath)) {
//                     fs.mkdirSync(dirPath, { recursive: true });
//                 }

//                 // Extraire le fichier
//                 zip.extractEntryTo(entry, tempDir, false, true);

//                 console.log(`\n=== Analyse du fichier ${entry.entryName} ===`);

//                 try {
//                     const text = await extractTextFromPDF(fullPath);
//                     console.log("Contenu texte brut extrait :", text);
//                     console.log("=== Fin du contenu ===\n");

//                     const docType = detectDocumentType(entry.entryName, text, DOCUMENT_CONFIG);

//                     console.log(`\n=== Fichier ${entry.entryName} ===`);
//                     console.log("Type détecté:", docType);
//                     console.log("Texte brut:", text.substring(0, 200) + "...");

//                     if (docType) {
//                         const expirationDate = findExpirationDate(text, DOCUMENT_CONFIG[docType].datePatterns);
//                         const isExpired = expirationDate && isDateExpired(expirationDate);

//                         const docInfo: DocumentInfo = {
//                             filename: entry.entryName,
//                             type: docType,
//                             expirationDate,
//                             isValid: !isExpired
//                         };

//                         result.documents.push(docInfo);
//                         result.missing = result.missing.filter(type => type !== docType);

//                         if (isExpired) {
//                             result.expired.push(docInfo);
//                         }
//                     }
//                 } catch (error) {
//                     console.error(`Erreur lors du traitement de ${entry.entryName}:`, error);
//                 } finally {
//                     if (fs.existsSync(fullPath)) {
//                         fs.unlinkSync(fullPath);
//                     }
//                 }
//             }
//         }

//         if (fs.existsSync(tempDir)) {
//             fs.rmSync(tempDir, { recursive: true });
//         }

//         return result;
//     }
//     // ... reste du code
// }

export class DocumentAnalyzerService {
    public async analyze(zipFilePath: string): Promise<AnalysisResult> {
        const zip = new AdmZip(zipFilePath);
        const zipEntries = zip.getEntries();
        const tempDir = path.join(__dirname, '../../temp');

        // Création récursive du dossier temporaire
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
            logs: []
        };

        for (const entry of zipEntries) {
            if (entry.entryName.match(/\.pdf$/i)) {
                const fullPath = path.join(tempDir, entry.entryName);
                const dirPath = path.dirname(fullPath);

                // Création explicite de l'arborescence
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }

                try {
                    // Extraction synchrone garantie avant lecture
                    zip.extractEntryTo(entry, tempDir, true, true); // <-- 3ème paramètre à true

                    console.log(`\n=== Analyse ${entry.entryName} ===`);

                    // Vérification que le fichier existe bien
                    if (!fs.existsSync(fullPath)) {
                        throw new Error(`Fichier non extrait: ${fullPath}`);
                    }

                    const text = await extractTextFromPDF(fullPath);
                    console.log("Contenu extraittttt:", text.substring(0, 200) + (text.length > 200 ? "..." : ""));

                    const docType = detectDocumentType(path.basename(entry.entryName), text, DOCUMENT_CONFIG);
                    console.log("Type détecté:", docType);

                    if (docType) {
                        const expirationDate = findExpirationDate(text, DOCUMENT_CONFIG[docType].datePatterns);
                        // const expirationDate = "31/12/2030"
                        console.log("Date trouvée:", expirationDate);

                        const docInfo: DocumentInfo = {
                            filename: path.basename(entry.entryName),
                            type: docType,
                            expirationDate,
                            isValid: expirationDate ? !isDateExpired(expirationDate) : false
                        };

                        result.documents.push(docInfo);
                        result.missing = result.missing.filter(type => type !== docType);

                        if (docInfo.expirationDate && !docInfo.isValid) {
                            result.expired.push(docInfo);
                        }
                    }
                } catch (error) {
                    console.error(`Erreur sur ${entry.entryName}:`, error instanceof Error ? error.message : error);
                } finally {
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            }
        }

        // Nettoyage
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }

        return result;
    }
}