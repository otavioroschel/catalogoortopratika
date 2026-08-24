import { supabase } from "./supabase";
import imageCompression from 'browser-image-compression';

export async function uploadImagemProduto(file: File) {
  try {
    // 1. A Mágica da Compressão no lado do Cliente!
    const options = {
      maxSizeMB: 0.5,           // Máximo de 500KB
      maxWidthOrHeight: 1200,   // Resolução máxima de 1200px
      useWebWorker: true,       // Usa um worker pra não travar a tela
      fileType: "image/jpeg"    // Converte pra jpeg (salva muito espaço)
    };

    // Comprime a imagem antes de fazer qualquer coisa
    const compressedFile = await imageCompression(file, options);

    // 2. Gera um nome único (forçando a extensão .webp porque convertemos acima)
    const nomeArquivo = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    
    // 3. Faz o upload da foto comprimida pro bucket "produtos"
    const { error } = await supabase.storage
      .from('produtos')
      .upload(nomeArquivo, compressedFile, {
        cacheControl: '3600',
        upsert: false 
      });

    if (error) {
      console.error("Erro do Supabase Storage:", error);
      return { success: false, error: "Falha ao enviar a imagem para o servidor." };
    }

    // 4. Pega o link público da imagem lá no Supabase
    const { data: publicUrlData } = supabase.storage
      .from('produtos')
      .getPublicUrl(nomeArquivo);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (error) {
    console.error("Erro inesperado no upload/compressão:", error);
    return { success: false, error: "Erro ao processar e comprimir a imagem." };
  }
}