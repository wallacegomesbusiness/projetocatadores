import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getColetas = async (req: Request, res: Response) => {
  try {
    const coletas = await prisma.coleta.findMany({
      include: {
        catador: true,
        itens: {
          include: { material: true }
        }
      },
      orderBy: { dataColeta: 'desc' }
    });
    res.json(coletas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar coletas' });
  }
};

export const createColeta = async (req: Request, res: Response) => {
  try {
    const { catadorId, itens, valorTotal } = req.body;
    
    const coleta = await prisma.coleta.create({
      data: {
        catadorId,
        valorTotal: Number(valorTotal),
        itens: {
          create: itens.map((item: { materialId: string; peso: number; subtotal: number }) => ({
            materialId: item.materialId,
            peso: Number(item.peso),
            subtotal: Number(item.subtotal)
          }))
        }
      },
      include: { itens: true }
    });
    res.status(201).json(coleta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar coleta' });
  }
};

export const deleteColeta = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.coleta.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar coleta' });
  }
};

export const updateColeta = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { catadorId, itens, valorTotal } = req.body;
    
    const coleta = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.itemColeta.deleteMany({
        where: { coletaId: id }
      });
      
      // Update coleta and create new items
      return await tx.coleta.update({
        where: { id },
        data: {
          catadorId,
          valorTotal: Number(valorTotal),
          itens: {
            create: itens.map((item: { materialId: string; peso: number; subtotal: number }) => ({
              materialId: item.materialId,
              peso: Number(item.peso),
              subtotal: Number(item.subtotal)
            }))
          }
        },
        include: { itens: true }
      });
    });
    
    res.json(coleta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar coleta' });
  }
};
