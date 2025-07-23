import express from 'express';
import multer from 'multer';
import { AnalysisController } from './controllers/analysis.controller';

const app = express();
const upload = multer({ dest: 'uploads/' });
const analysisController = new AnalysisController();

app.use(express.json());

app.post(
    '/analyze',
    upload.single('zipfile'),
    analysisController.analyzeDocuments.bind(analysisController)
);

app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

export default app;