import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

import catadoresRoutes from './routes/catadores.routes';
import materiaisRoutes from './routes/materiais.routes';
import coletasRoutes from './routes/coletas.routes';
import pagamentosRoutes from './routes/pagamentos.routes';
import authRoutes from './routes/auth.routes';

app.use(cors());
app.use(express.json());

// Registrando as rotas da API
app.use('/api/catadores', catadoresRoutes);
app.use('/api/materiais', materiaisRoutes);
app.use('/api/coletas', coletasRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Backend - Catadores de Recicláveis' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
