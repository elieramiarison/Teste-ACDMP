import express from 'express';
import multer from 'multer';
import { AnalysisController } from './controllers/analysis.controller';
import cors from 'cors';


const app = express();
const upload = multer({ dest: 'uploads/' });
const analysisController = new AnalysisController();

app.use(express.json());
app.use(cors());

app.post(
    '/test',
    upload.single('zipfile'),
    analysisController.analyzeDocuments.bind(analysisController)
);

app.use((req, res) => {
    res.status(404).json({ message: "Endpoint n'existe pas" });
});

export default app;