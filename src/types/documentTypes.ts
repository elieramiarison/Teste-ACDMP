// export type DocumentType = 'KBIS' | 'DC1' | 'ASSURANCE';

// export interface DocumentPatterns {
//     patterns: RegExp[];
//     datePatterns: RegExp[];
// }

// export type DocumentConfig = Record<DocumentType, DocumentPatterns>;

// export interface DocumentInfo {
//     filename: string;
//     type: DocumentType;
//     expirationDate: string | null;
//     isValid: boolean;
// }

// export interface AnalysisResult {
//     documents: DocumentInfo[];
//     missing: DocumentType[];
//     expired: DocumentInfo[];
// }

export type DocumentType = 'KBIS' | 'DC1' | 'ASSURANCE';

export interface DocumentPatterns {
    patterns: RegExp[];
    datePatterns: RegExp[];
}

export type DocumentConfig = Record<DocumentType, DocumentPatterns>;

export interface DocumentInfo {
    filename: string;
    type: DocumentType;
    expirationDate: string | null;
    isValid: boolean;
}

export interface AnalysisResult {
    documents: DocumentInfo[];
    missing: DocumentType[];
    expired: DocumentInfo[];
    logs?: string[];
}

export const DOCUMENT_CONFIG: DocumentConfig = {
    KBIS: {
        patterns: [/kbis/i, /extrait k/i],
        datePatterns: [
            /(?:date d'?emission|emis le)\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i, // Accepte ":" optionnel
            /valable jusqu['au]\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i, // Capture la date de validité
            /(\d{2}\/\d{2}\/\d{4})(?=[^\d]*$)/i // Dernière date dans le document
        ]
    },
    DC1: {
        patterns: [
            /dc1/i,
            /déclaration\s*de\s*conformité/i,
            /formulaire\s*déclaration/i
        ],
        datePatterns: [
            /(?:date\s*de\s*validité|valable\s*jusqu'au?)\s*[:]?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
            /(expire\s*le|échéance)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i
        ]
    },
    ASSURANCE: {
        patterns: [
            /assurance/i,
            /attestation\s*d'assurance/i,
            /police\s*d'assurance/i,
            /contrat\s*d'assurance/i
        ],
        datePatterns: [
            /(?:date\s*d'?expiration|valable\s*jusqu'au?)\s*[:]?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
            /(?:fin\s*de\s*validité)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
            /(?:couv.*jusqu'au?)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i
        ]
    },
};