import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPagamentos = async (req: Request, res: Response) => {
  try {
    const pagamentos = await prisma.pagamento.findMany({
      include: { catador: true },
      orderBy: { dataPagamento: 'desc' }
    });
    res.json(pagamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
};

export const createPagamento = async (req: Request, res: Response) => {
  try {
    const { catadorId, valor, referenciaMesAno, dataPagamento, status } = req.body;
    
    const pagamento = await prisma.pagamento.create({
      data: { 
        catadorId, 
        valor: Number(valor), 
        referenciaMesAno,
        dataPagamento: dataPagamento ? new Date(dataPagamento) : undefined,
        status: status || 'pendente'
      },
      include: { catador: true }
    });
    res.status(201).json(pagamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
};

export const updateStatusPagamento = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    
    const pagamento = await prisma.pagamento.update({
      where: { id },
      data: { status, dataPagamento: status === 'concluido' ? new Date() : undefined },
      include: { catador: true }
    });
    res.json(pagamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status do pagamento' });
  }
};

export const updatePagamento = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { catadorId, valor, referenciaMesAno, dataPagamento, status } = req.body;
    
    const pagamento = await prisma.pagamento.update({
      where: { id },
      data: { 
        catadorId, 
        valor: valor ? Number(valor) : undefined,
        referenciaMesAno,
        dataPagamento: dataPagamento ? new Date(dataPagamento) : undefined,
        status
      },
      include: { catador: true }
    });
    res.json(pagamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar pagamento' });
  }
};

export const deletePagamento = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.pagamento.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar pagamento' });
  }
};
