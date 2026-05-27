import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCatadores = async (req: Request, res: Response) => {
  try {
    const catadores = await prisma.catador.findMany({
      orderBy: { nome: 'asc' }
    });
    res.json(catadores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar catadores' });
  }
};

export const createCatador = async (req: Request, res: Response) => {
  try {
    const { nome, cpf, telefone, status } = req.body;
    
    const catadorExistente = await prisma.catador.findUnique({ where: { cpf } });
    if (catadorExistente) {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }

    const catador = await prisma.catador.create({
      data: { nome, cpf, telefone, status }
    });
    res.status(201).json(catador);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar catador' });
  }
};

export const updateCatador = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nome, cpf, telefone, status } = req.body;
    const catador = await prisma.catador.update({
      where: { id },
      data: { nome, cpf, telefone, status }
    });
    res.json(catador);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar catador' });
  }
};

export const deleteCatador = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.catador.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar catador' });
  }
};
