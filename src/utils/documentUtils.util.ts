import { DocumentConfig, DocumentType } from '../types/documentTypes';

/**
 * Détecte le type de document à partir du nom de fichier ou du contenu du texte.
 * @param filename
 * @param text 
 * @param config
 * @returns Le type détecté ou null
 */
export function detectDocumentType(
    filename: string,
    text: string,
    config: DocumentConfig
): DocumentType | null {
    for (const [docType, { patterns }] of Object.entries(config)) {
        // Vérifie les correspondances dans le nom de fichier
        if (patterns.some(pattern => pattern.test(filename))) {
            return docType as DocumentType;
        }

        // Vérifie les correspondances dans le contenu texte
        if (patterns.some(pattern => pattern.test(text))) {
            return docType as DocumentType;
        }
    }

    return null;
}

/**
 * Extrait une date d'expiration à partir du texte donné, en utilisant des expressions régulières.
 * @param text 
 * @param datePatterns
 * @returns
 */
export function findExpirationDate(text: string, datePatterns: RegExp[]): string | null {
    const normalizedText = text
        .replace(/\s+/g, ' ')
        .replace(/[éèêë]/g, 'e')
        .toLowerCase();

    for (const pattern of datePatterns) {
        const matches = normalizedText.match(pattern);

        if (matches && matches[1]) {
            const [day, month, year] = matches[1].split('/');
            if (day && month && year) {
                return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
            }
            return matches[1];
        }
    }

    // Fallback : chercher la dernière date au format DD/MM/YYYY dans tout le texte
    const fallbackDate = normalizedText.match(/(\d{2}\/\d{2}\/\d{4})(?=[^\d]*$)/);
    return fallbackDate ? fallbackDate[0] : null;
}
