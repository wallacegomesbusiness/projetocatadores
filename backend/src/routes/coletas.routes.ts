import { Router } from 'express';
import { getColetas, createColeta, deleteColeta, updateColeta } from '../controllers/coletas.controller';

const router = Router();

router.get('/', getColetas);
router.post('/', createColeta);
router.put('/:id', updateColeta);
router.delete('/:id', deleteColeta);

export default router;
