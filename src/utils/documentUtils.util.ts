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

export function findExpirationDate(text: string, datePatterns: RegExp[]): string | null {
    // Normalisation agressive du texte
    const normalizedText = text
        .replace(/\s+/g, ' ')
        .replace(/[éèêë]/g, 'e')
        .toLowerCase();

    console.log("=== TEXTE NORMALISÉ ===");
    console.log(normalizedText);

    for (const pattern of datePatterns) {
        const matches = normalizedText.match(pattern);
        console.log(`Test pattern: ${pattern}`);
        console.log("Matches:", matches);

        if (matches && matches[1]) {
            const dateParts = matches[1].split('/');
            if (dateParts.length === 3) {
                return `${dateParts[0].padStart(2, '0')}/${dateParts[1].padStart(2, '0')}/${dateParts[2]}`;
            }
            return matches[1];
        }
    }

    const lastDateMatch = normalizedText.match(/(\d{2}\/\d{2}\/\d{4})(?=[^\d]*$)/);
    return lastDateMatch ? lastDateMatch[0] : null;
}