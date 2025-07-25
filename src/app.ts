import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import { AnalysisController } from './controllers/analysis.controller';

const app = express();
const upload = multer({ dest: 'uploads/' });
const analysisController = new AnalysisController();

// Middleware
app.use(cors());
app.use(express.json());

// Route d’analyse des fichiers ZIP
app.post(
    '/test',
    upload.single('zipfile'),
    analysisController.analyzeDocuments.bind(analysisController)
);

// Gestion des routes non définies
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "Endpoint n'existe pas" });
});

export default app;
