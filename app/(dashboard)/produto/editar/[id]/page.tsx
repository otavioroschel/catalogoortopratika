"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, UploadCloud, X, Loader2 } from "lucide-react";
import { obterProdutoPorId, atualizarProduto } from "@/actions/produto";
import { uploadImagemProduto } from "@/lib/storage";

const produtoSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  marca: z.string().min(1, "Marca é obrigatória"),
  origem: z.string().min(1, "Origem é obrigatória"),
  registroAnvisa: z.string().optional().nullable(),
  fabricante: z.string().min(1, "Fabricante é obrigatório"),
  validade: z.string().min(1, "Validade é obrigatória"),
  peso: z.string().min(1, "Peso é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  dimensoes: z.string().optional().nullable(),
  ncm: z.string().min(1, "NCM é obrigatório"),
  cstOrigem: z.string().min(1, "CST Origem é obrigatório"),
  cstPis: z.string().min(1, "CST PIS é obrigatório"),
  cstCofins: z.string().min(1, "CST COFINS é obrigatório"),
  ipi: z.string().min(1, "IPI é obrigatório"),
  icms: z.string().min(1, "ICMS é obrigatório"),
});

type ProdutoForm = z.infer<typeof produtoSchema>;

export default function EditarProduto() {
  const router = useRouter();
  const params = useParams();
  const produtoId = params.id as string;

  const [erro, setErro] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemAntigaUrl, setImagemAntigaUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProdutoForm>({
    resolver: zodResolver(produtoSchema),
  });

  // Busca os dados assim que a tela abre
  useEffect(() => {
    async function carregar() {
      if (!produtoId) return;
      const resposta = await obterProdutoPorId(produtoId);
      
      if (resposta.success && resposta.produto) {
        // Preenche os campos de texto
        reset(resposta.produto);
        // Preenche a imagem se existir
        if (resposta.produto.imagemUrl) {
          setImagemPreview(resposta.produto.imagemUrl);
          setImagemAntigaUrl(resposta.produto.imagemUrl);
        }
      } else {
        setErro("Não foi possível carregar os dados deste produto.");
      }
      setCarregandoDados(false);
    }
    carregar();
  }, [produtoId, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Selecione apenas arquivos de imagem.");
        return;
      }
      setImagemFile(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  const removerImagem = () => {
    setImagemFile(null);
    setImagemPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: ProdutoForm) => {
    setErro(null);
    setIsSubmittingForm(true);
    
    try {
      // Se tiver um "File" novo selecionado, ele faz o upload. 
      // Se não, ele mantém a imagem antiga (ou null se foi apagada)
      let imagemUrlFinal = imagemPreview === imagemAntigaUrl ? imagemAntigaUrl : null;

      if (imagemFile) {
        const uploadResult = await uploadImagemProduto(imagemFile);
        if (!uploadResult.success) {
          setErro(uploadResult.error || "Erro no upload da imagem.");
          setIsSubmittingForm(false);
          return;
        }
        imagemUrlFinal = uploadResult.url || null;
      }

      const dadosParaSalvar = {
        ...data,
        imagemUrl: imagemUrlFinal,
      };

      const resposta = await atualizarProduto(produtoId, dadosParaSalvar);

      if (resposta.success) {
        alert("Produto atualizado com sucesso!");
        router.push("/");
      } else {
        setErro(resposta.error || "Erro ao salvar edições.");
      }
    } catch (err) {
      setErro("Ocorreu um erro inesperado.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  if (carregandoDados) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-3">Carregando dados do produto...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Editar Produto</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {erro && <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium">{erro}</div>}

        {/* ÁREA DE IMAGEM */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Foto do Produto</h2>
          <div className="mt-2">
            {imagemPreview ? (
              <div className="relative w-full max-w-sm mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img src={imagemPreview} alt="Preview" className="w-full h-48 object-cover" />
                <button type="button" onClick={removerImagem} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group">
                <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                <p className="font-medium text-gray-700">Clique ou arraste a imagem aqui</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
        </div>

        {/* INFORMAÇÕES BÁSICAS */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">SKU *</label><input {...register("sku")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">Nome do Produto *</label><input {...register("nome")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">Categoria *</label><input {...register("categoria")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">Marca *</label><input {...register("marca")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">Origem *</label><input {...register("origem")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">Registro ANVISA</label><input {...register("registroAnvisa")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">Fabricante *</label><input {...register("fabricante")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">Validade *</label><input {...register("validade")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
          </div>
        </div>

        {/* DETALHAMENTO */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Detalhamento Físico</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Peso *</label><input {...register("peso")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">Dimensões</label><input {...register("dimensoes")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Descrição e Aplicação *</label><textarea {...register("descricao")} rows={4} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
          </div>
        </div>

        {/* DADOS FISCAIS */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Classificação Fiscal</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">NCM *</label><input {...register("ncm")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">CST Origem *</label><input {...register("cstOrigem")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">CST PIS *</label><input {...register("cstPis")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">CST COFINS *</label><input {...register("cstCofins")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">Alíquota IPI *</label><input {...register("ipi")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
            <div><label className="block text-sm font-medium mb-1">ICMS *</label><input {...register("icms")} className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 focus:ring-1" /></div>
          </div>
        </div>

        {/* BOTÃO SALVAR */}
        <div className="flex justify-end pt-4 pb-12">
          <button type="submit" disabled={isSubmittingForm} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="w-5 h-5" />
            {isSubmittingForm ? "Salvando..." : "Salvar Edições"}
          </button>
        </div>
      </form>
    </div>
  );
}