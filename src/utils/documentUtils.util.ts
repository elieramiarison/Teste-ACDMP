import { DocumentConfig, DocumentType } from '../types/documentTypes';

export function detectDocumentType(
    filename: string,
    text: string,
    config: DocumentConfig
): DocumentType | null {
    for (const [docType, patterns] of Object.entries(config)) {
        // Vérifier d'abord le nom du fichier
        if (patterns.patterns.some(pattern => filename.match(pattern))) {
            return docType as DocumentType;
        }

        // Vérifier ensuite le contenu du texte
        if (patterns.patterns.some(pattern => text.match(pattern))) {
            return docType as DocumentType;
        }
    }
    return null;
}

// export function findExpirationDate(text: string, datePatterns: RegExp[]): string | null {
//     for (const pattern of datePatterns) {
//         const match = text.match(pattern);
//         if (match && match[1]) {
//             return match[1];
//         }
//     }
//     return null;
// }

export function findExpirationDate(text: string, datePatterns: RegExp[]): string | null {
    // Normaliser le texte pour mieux détecter les dates
    const normalizedText = text
        .replace(/\s+/g, ' ')
        .replace(/[éèêë]/g, 'e')
        .toLowerCase();

    for (const pattern of datePatterns) {
        const match = normalizedText.match(pattern);
        if (match && match[1]) {
            // Formater la date en JJ/MM/AAAA
            const dateParts = match[1].split('/');
            if (dateParts.length === 3) {
                return `${dateParts[0].padStart(2, '0')}/${dateParts[1].padStart(2, '0')}/${dateParts[2]}`;
            }
            return match[1];
        }
    }
    return null;
}