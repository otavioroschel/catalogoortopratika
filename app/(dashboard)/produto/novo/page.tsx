"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { criarProduto } from "@/actions/produto";
import { uploadImagemProduto } from "@/lib/storage"; // Nosso Service Layer!

const produtoSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  marca: z.string().min(1, "Marca é obrigatória"),
  origem: z.string().min(1, "Origem é obrigatória"),
  registroAnvisa: z.string().optional(),
  fabricante: z.string().min(1, "Fabricante é obrigatório"),
  validade: z.string().min(1, "Validade é obrigatória"),
  peso: z.string().min(1, "Peso é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  dimensoes: z.string().optional(),
  ncm: z.string().min(1, "NCM é obrigatório"),
  cstOrigem: z.string().min(1, "CST Origem é obrigatório"),
  cstPis: z.string().min(1, "CST PIS é obrigatório"),
  cstCofins: z.string().min(1, "CST COFINS é obrigatório"),
  ipi: z.string().min(1, "IPI é obrigatório"),
  icms: z.string().min(1, "ICMS é obrigatório"),
});

type ProdutoForm = z.infer<typeof produtoSchema>;

export default function NovoProduto() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  
  // Estados para gerenciar a Imagem
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProdutoForm>({
    resolver: zodResolver(produtoSchema),
  });

  // Função para lidar com a seleção da imagem (click ou drag&drop)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione apenas arquivos de imagem.");
        return;
      }
      setImagemFile(file);
      // Cria um link temporário só para mostrar o preview na tela
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
      let imagemUrlFinal = null;

      // Se o usuário selecionou uma imagem, faz o upload PRIMEIRO
      if (imagemFile) {
        const uploadResult = await uploadImagemProduto(imagemFile);
        if (!uploadResult.success) {
          setErro(uploadResult.error || "Erro ao fazer upload da imagem.");
          setIsSubmittingForm(false);
          return; // Para tudo se a imagem der erro
        }
        imagemUrlFinal = uploadResult.url;
      }

      // Agora junta a URL da imagem com os dados do formulário
      const dadosParaSalvar = {
        ...data,
        imagemUrl: imagemUrlFinal,
      };

      // Manda pro Motor do Prisma
      const resposta = await criarProduto(dadosParaSalvar);

      if (resposta.success) {
        alert("Produto cadastrado com sucesso!");
        router.push("/");
      } else {
        setErro(resposta.error || "Erro desconhecido ao salvar.");
      }
    } catch (err) {
      setErro("Ocorreu um erro inesperado ao salvar o produto.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-12">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Cadastrar Novo Produto</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {erro && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 font-medium">{erro}</div>}

        {/* NOVA ÁREA: Upload de Imagem */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Foto do Produto</h2>
          
          <div className="mt-2">
            {imagemPreview ? (
              <div className="relative w-full max-w-sm mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img src={imagemPreview} alt="Preview" className="w-full h-48 object-cover" />
                <button 
                  type="button" 
                  onClick={removerImagem}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-blue-400 transition-colors group"
              >
                <div className="bg-white p-4 rounded-full shadow-sm group-hover:shadow text-blue-500 mb-3">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="font-medium text-gray-700">Clique ou arraste a imagem aqui</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG ou WEBP (Max. 5MB)</p>
              </div>
            )}
            
            {/* O input real fica escondido */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden" 
            />
          </div>
        </div>

        {/* BLOCO 1: Informações Básicas */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input {...register("sku")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: 2AC1.002" />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
              <input {...register("nome")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: Manta Térmica Aluminizada" />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <input {...register("categoria")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: Térmicos e Resgate" />
              {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
              <input {...register("marca")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: Ortopratika" />
              {errors.marca && <p className="text-red-500 text-xs mt-1">{errors.marca.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origem *</label>
              <input {...register("origem")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: Nacional" />
              {errors.origem && <p className="text-red-500 text-xs mt-1">{errors.origem.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registro ANVISA</label>
              <input {...register("registroAnvisa")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Opcional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fabricante *</label>
              <input {...register("fabricante")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: Ortopratika Ind. e Com." />
              {errors.fabricante && <p className="text-red-500 text-xs mt-1">{errors.fabricante.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validade *</label>
              <input {...register("validade")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: Indeterminada" />
              {errors.validade && <p className="text-red-500 text-xs mt-1">{errors.validade.message}</p>}
            </div>
          </div>
        </div>

        {/* BLOCO 2: Detalhamento */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Detalhamento Físico</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso *</label>
              <input {...register("peso")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: 56 g" />
              {errors.peso && <p className="text-red-500 text-xs mt-1">{errors.peso.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensões</label>
              <input {...register("dimensoes")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: 2,10 m x 1,40 m" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição e Aplicação *</label>
              <textarea {...register("descricao")} rows={4} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Digite a descrição completa do produto..." />
              {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao.message}</p>}
            </div>
          </div>
        </div>

        {/* BLOCO 3: Dados Fiscais */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Classificação Fiscal</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NCM *</label>
              <input {...register("ncm")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: 6301.90.00" />
              {errors.ncm && <p className="text-red-500 text-xs mt-1">{errors.ncm.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CST Origem *</label>
              <input {...register("cstOrigem")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: 00" />
              {errors.cstOrigem && <p className="text-red-500 text-xs mt-1">{errors.cstOrigem.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CST PIS *</label>
              <input {...register("cstPis")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: 01" />
              {errors.cstPis && <p className="text-red-500 text-xs mt-1">{errors.cstPis.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CST COFINS *</label>
              <input {...register("cstCofins")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: 01" />
              {errors.cstCofins && <p className="text-red-500 text-xs mt-1">{errors.cstCofins.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alíquota IPI *</label>
              <input {...register("ipi")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: 0%" />
              {errors.ipi && <p className="text-red-500 text-xs mt-1">{errors.ipi.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ICMS *</label>
              <input {...register("icms")} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: Tributado" />
              {errors.icms && <p className="text-red-500 text-xs mt-1">{errors.icms.message}</p>}
            </div>
          </div>
        </div>

        {/* Botão de Enviar */}
        <div className="flex justify-end pt-4 pb-12">
          <button
            type="submit"
            disabled={isSubmittingForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSubmittingForm ? "Processando..." : "Salvar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
}