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

// Fonction farany nampeseko

// export function findExpirationDate(text: string, datePatterns: RegExp[]): string | null {
//     // Normaliser le texte pour mieux détecter les dates
//     const normalizedText = text
//         .replace(/\s+/g, ' ')
//         .replace(/[éèêë]/g, 'e')
//         .toLowerCase();

//     for (const pattern of datePatterns) {
//         const match = normalizedText.match(pattern);
//         if (match && match[1]) {
//             // Formater la date en JJ/MM/AAAA
//             const dateParts = match[1].split('/');
//             if (dateParts.length === 3) {
//                 return `${dateParts[0].padStart(2, '0')}/${dateParts[1].padStart(2, '0')}/${dateParts[2]}`;
//             }
//             return match[1];
//         }
//     }
//     return null;
// }

// Afa koa
// export function findExpirationDate(text: string, datePatterns: RegExp[]): string | null {
//     // Normalisation du texte
//     const normalizedText = text
//         .replace(/\s+/g, ' ')
//         .replace(/[éèêë]/g, 'e')
//         .toLowerCase();

//     console.log("=== TEXTE NORMALISÉ POUR RECHERCHE ===");
//     console.log(normalizedText.substring(0, 500) + "...");

//     for (const pattern of datePatterns) {
//         const matches = normalizedText.match(pattern);
//         console.log(`Test pattern: ${pattern}`);
//         console.log("Résultats:", matches);

//         if (matches && matches[1]) {
//             // Formatage standard de la date
//             const dateParts = matches[1].split(/[\/\-]/);
//             if (dateParts.length === 3) {
//                 const [day, month, year] = dateParts;
//                 const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.length === 2 ? '20' + year : year}`;
//                 console.log("Date formatée:", formattedDate);
//                 return formattedDate;
//             }
//             return matches[1];
//         }
//     }
//     return null;
// }

export function findExpirationDate(text: string, datePatterns: RegExp[]): string | null {
    // Normalisation agressive du texte
    const normalizedText = text
        .replace(/\s+/g, ' ') // Remplace tous les espaces multiples par un seul
        .replace(/[éèêë]/g, 'e') // Normalise les caractères accentués
        .toLowerCase();

    console.log("=== TEXTE NORMALISÉ ===");
    console.log(normalizedText);

    for (const pattern of datePatterns) {
        const matches = normalizedText.match(pattern);
        console.log(`Test pattern: ${pattern}`);
        console.log("Matches:", matches);

        if (matches && matches[1]) {
            // Formatage standard JJ/MM/AAAA
            const dateParts = matches[1].split('/');
            if (dateParts.length === 3) {
                return `${dateParts[0].padStart(2, '0')}/${dateParts[1].padStart(2, '0')}/${dateParts[2]}`;
            }
            return matches[1];
        }
    }

    // Fallback: cherche n'importe quelle date en fin de document
    const lastDateMatch = normalizedText.match(/(\d{2}\/\d{2}\/\d{4})(?=[^\d]*$)/);
    return lastDateMatch ? lastDateMatch[0] : null;
}