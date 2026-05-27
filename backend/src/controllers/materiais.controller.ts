import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMateriais = async (req: Request, res: Response) => {
  try {
    const materiais = await prisma.material.findMany({
      orderBy: { nome: 'asc' }
    });
    res.json(materiais);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar materiais' });
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { nome, precoPorKg, unidade } = req.body;
    const material = await prisma.material.create({
      data: { nome, precoPorKg: Number(precoPorKg), unidade }
    });
    res.status(201).json(material);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar material' });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nome, precoPorKg, unidade } = req.body;
    
    const material = await prisma.material.update({
      where: { id },
      data: { nome, precoPorKg: Number(precoPorKg), unidade }
    });
    
    res.json(material);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar material' });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.material.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar material' });
  }
};
