import { Router } from 'express';
import { getMateriais, createMaterial, updateMaterial, deleteMaterial } from '../controllers/materiais.controller';

const router = Router();

router.get('/', getMateriais);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

export default router;
