import { Router } from 'express';
import { 
  getPagamentos, 
  createPagamento, 
  updateStatusPagamento, 
  updatePagamento,
  deletePagamento 
} from '../controllers/pagamentos.controller';

const router = Router();

router.get('/', getPagamentos);
router.post('/', createPagamento);
router.put('/:id', updatePagamento);
router.put('/:id/status', updateStatusPagamento);
router.delete('/:id', deletePagamento);

export default router;
