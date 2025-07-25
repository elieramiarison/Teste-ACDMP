const { convert } = require('pdf-poppler');
import path from 'path';
import fsPromises from 'fs/promises';
import fs from 'fs';

export async function convertPdfToImage(pdfPath: string, outputDir: string): Promise<string> {
    const outputFile = path.basename(pdfPath, path.extname(pdfPath));
    const options = {
        format: 'jpeg',
        out_dir: outputDir,
        out_prefix: outputFile,
        page: 1
    };

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    await convert(pdfPath, options);

    return path.join(outputDir, `${outputFile}-1.jpg`);
}
