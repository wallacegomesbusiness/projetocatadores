import { Router } from 'express';
import { 
  getCatadores, 
  createCatador, 
  updateCatador, 
  deleteCatador 
} from '../controllers/catadores.controller';

const router = Router();

router.get('/', getCatadores);
router.post('/', createCatador);
router.put('/:id', updateCatador);
router.delete('/:id', deleteCatador);

export default router;
