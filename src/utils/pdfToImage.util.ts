// utils/pdfToImage.util.ts
// const { PdfConverter } = require('pdf-poppler');
const { convert } = require('pdf-poppler');
import path from 'path';
import fsPromises from 'fs/promises';
import fs from 'fs';

// export async function convertPdfToImage(pdfPath: string, outputDir: string): Promise<string> {
//     const outputPath = path.join(outputDir, path.basename(pdfPath, '.pdf'));
//     await fs.mkdir(outputDir, { recursive: true });

//     const options = {
//         format: 'jpeg',
//         out_dir: outputDir,
//         out_prefix: path.basename(outputPath),
//         page: 1
//     };

//     await PdfConverter.convert(pdfPath, options);
//     return `${outputPath}-1.jpg`; // pdf-poppler suffixe toujours par "-1.jpg" la première page
// }

export async function convertPdfToImage(pdfPath: string, outputDir: string): Promise<string> {
    const outputFile = path.basename(pdfPath, path.extname(pdfPath));
    const options = {
        format: 'jpeg',
        out_dir: outputDir,
        out_prefix: outputFile,
        page: 1 // uniquement la première page
    };

    // Assurez-vous que le dossier existe
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    await convert(pdfPath, options);

    return path.join(outputDir, `${outputFile}-1.jpg`);
}
