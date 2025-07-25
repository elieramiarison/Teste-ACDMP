import { Request, Response } from 'express';
import { DocumentAnalyzerService } from '../services/documentAnalyzer.service';

const analyzerService = new DocumentAnalyzerService();

export class AnalysisController {
    async analyzeDocuments(req: Request, res: Response): Promise<Response> {
        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier n’a été uploadé." });
        }

        try {
            const result = await analyzerService.analyze(req.file.path);
            return res.status(200).json(result);
        } catch (error: unknown) {
            console.error('Erreur lors de l’analyse :', error);
            return res.status(500).json({
                error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
            });
        }
    }
}
