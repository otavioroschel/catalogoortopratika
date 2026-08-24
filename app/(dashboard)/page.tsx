"use client";

import { useState, useEffect, Suspense } from "react";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { obterProdutos, excluirProduto } from "@/actions/produto";
import { pdf } from "@react-pdf/renderer";
import { FichaTecnicaPDF } from "@/components/FichaTecnicaPDF";

// 1. ISOLAMOS O SEU CÓDIGO AQUI
function DashboardConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const busca = searchParams.get("q") || "";

  const [produtos, setProdutos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState<string | null>(null);

 // NOVA FUNÇÃO DE DOWNLOAD (À PROVA DE CELULAR)
  const baixarPDF = async (produto: any) => {
    try {
      setGerandoPdf(produto.id); 
      
      const doc = <FichaTecnicaPDF produto={produto} />;
      const blob = await pdf(doc).toBlob();
      const nomeArquivo = `Ficha_${produto.sku}.pdf`;

      // Verifica se o usuário está no celular (Android, iOS)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // TRUQUE PARA CELULAR: Converte o Blob para Base64 e força o download como arquivo genérico
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          
          // Troca o tipo do arquivo para enganar o navegador e forçar o download
          const base64Forcado = base64data.replace("application/pdf", "application/octet-stream");
          
          const link = document.createElement("a");
          link.href = base64Forcado;
          link.download = nomeArquivo;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
      } else {
        // No Computador, o comportamento normal já funciona perfeito
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o documento.");
    } finally {
      setGerandoPdf(null); 
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExcluir = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${nome}"? Essa ação não pode ser desfeita.`)) {
      const resposta = await excluirProduto(id);
      if (resposta.success) {
        setProdutos(produtos.filter(p => p.id !== id));
      } else {
        alert(resposta.error);
      }
    }
  };

  useEffect(() => {
    async function carregarDados() {
      const resposta = await obterProdutos();
      if (resposta.success && resposta.produtos) {
        setProdutos(resposta.produtos);
      }
      setCarregando(false);
    }
    carregarDados();
  }, []);

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = busca.toLowerCase();
    return (
      produto.nome.toLowerCase().includes(termo) ||
      produto.sku.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Últimas Fichas Geradas</h1>
      
      {carregando ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-3">Carregando produtos...</span>
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Nenhum produto cadastrado ainda.</p>
          <button onClick={() => router.push("/produto/novo")} className="text-blue-600 font-semibold hover:underline">
            Cadastrar o primeiro produto
          </button>
        </div>
      ) : (
        <>
          {produtosFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              Nenhum produto encontrado para "{busca}".
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {produtosFiltrados.map((produto) => (
              <div key={produto.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                    {produto.sku}
                  </span>
                  
                  <button 
                    onClick={() => handleExcluir(produto.id, produto.nome)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Excluir Produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 line-clamp-2" title={produto.nome}>
                  {produto.nome}
                </h3>
                <p className="text-sm text-gray-500 mb-6">{produto.categoria}</p>
                
                <div className="mt-auto flex gap-2">
                  <button 
                    onClick={() => router.push(`/produto/editar/${produto.id}`)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Editar
                  </button>
                 <button 
  onClick={() => baixarPDF(produto)}
  disabled={gerandoPdf === produto.id}
  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {gerandoPdf === produto.id ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Gerando...
    </>
  ) : (
    <>
      <FileText className="w-4 h-4" />
      PDF
    </>
  )}
</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// 2. O COMPONENTE EXPORTADO PROTEGIDO PELO SUSPENSE
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-gray-500">Carregando painel...</div>}>
      <DashboardConteudo />
    </Suspense>
  );
}