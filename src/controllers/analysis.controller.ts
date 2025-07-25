import { Request, Response } from 'express';
import { DocumentAnalyzerService } from '../services/documentAnalyzer.service';

const analyzerService = new DocumentAnalyzerService();

export class AnalysisController {
    async analyzeDocuments(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const result = await analyzerService.analyze(req.file.path);
            return res.json(result);
        } catch (error) {
            console.error('Analyse erreur:', error);
            return res.status(500).json({
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
}