"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Função para CADASTRAR um produto novo
export async function criarProduto(data: any) {
  try {
    const novoProduto = await prisma.produto.create({
      data: {
        sku: data.sku,
        nome: data.nome,
        categoria: data.categoria,
        marca: data.marca,
        origem: data.origem, // Olha ele aqui!
        registroAnvisa: data.registroAnvisa,
        fabricante: data.fabricante,
        validade: data.validade,
        peso: data.peso,
        descricao: data.descricao,
        dimensoes: data.dimensoes,
        imagemUrl: data.imagemUrl,
        ncm: data.ncm,
        cstOrigem: data.cstOrigem,
        cstPis: data.cstPis,
        cstCofins: data.cstCofins,
        ipi: data.ipi,
        icms: data.icms,
      },
    });

    // Avisa o Next.js para atualizar a página inicial e mostrar o produto novo
    revalidatePath("/"); 
    
    return { success: true, produto: novoProduto };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return { success: false, error: "Erro ao salvar no banco de dados. Verifique se o SKU já existe." };
  }
}

// (Mantenha a função criarProduto que já está aí em cima...)

// Função para LISTAR os produtos
export async function obterProdutos() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: { createdAt: "desc" }, // Mostra os mais novos primeiro
    });
    return { success: true, produtos };
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return { success: false, error: "Erro ao carregar os dados." };
  }
}

// Função para EXCLUIR um produto
export async function excluirProduto(id: string) {
  try {
    await prisma.produto.delete({
      where: { id },
    });
    
    // Avisa o Next.js para atualizar a lista na tela inicial
    revalidatePath("/"); 
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return { success: false, error: "Erro ao tentar excluir." };
  }
}

// Função para BUSCAR APENAS UM produto pelo ID
export async function obterProdutoPorId(id: string) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id },
    });
    return { success: true, produto };
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return { success: false, error: "Erro ao carregar o produto." };
  }
}

// Função para ATUALIZAR o produto
export async function atualizarProduto(id: string, data: any) {
  try {
    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: {
        sku: data.sku,
        nome: data.nome,
        categoria: data.categoria,
        marca: data.marca,
        origem: data.origem,
        registroAnvisa: data.registroAnvisa,
        fabricante: data.fabricante,
        validade: data.validade,
        peso: data.peso,
        descricao: data.descricao,
        dimensoes: data.dimensoes,
        imagemUrl: data.imagemUrl, // A imagem pode mudar ou continuar a mesma
        ncm: data.ncm,
        cstOrigem: data.cstOrigem,
        cstPis: data.cstPis,
        cstCofins: data.cstCofins,
        ipi: data.ipi,
        icms: data.icms,
      },
    });

    revalidatePath("/");
    return { success: true, produto: produtoAtualizado };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return { success: false, error: "Erro ao atualizar. Verifique se o SKU já existe em outro produto." };
  }
}