export type DocumentType =
    | 'KBIS'
    | 'DC1'
    | 'ATTESTATION_FISCALE'
    | 'NOTE_INTERNE';


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
            /(?:date d'?emission|emis le)\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i,
            /valable jusqu['au]\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i,
            /(\d{2}\/\d{2}\/\d{4})(?=[^\d]*$)/i
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
    ATTESTATION_FISCALE: {
        patterns: [
            /attestation\s*fiscale/i,
            /avis\s*d['’]?imposition/i,
            /imp[oô]ts/i
        ],
        datePatterns: [
            /date\s*d['’]?émission\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
            /valide\s*jusqu['’]?au\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i
        ]
    },
    NOTE_INTERNE: {
        patterns: [
            /note\s*interne/i,
            /note\s*d'information/i,
            /communication\s*interne/i
        ],
        datePatterns: [
            /date\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i
        ]
    }
};