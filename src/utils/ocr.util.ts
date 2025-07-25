import { createWorker } from 'tesseract.js';

export async function extractTextWithOCR(imagePath: string): Promise<string> {
    const worker = await createWorker();
    await worker.load();
    await worker.reinitialize('fra');

    const { data } = await worker.recognize(imagePath);
    await worker.terminate();

    return data.text;
}

