import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Tradução do seu Tailwind para os estilos do React-PDF
const styles = StyleSheet.create({
  // AQUI: Aumentamos o paddingBottom para proteger o rodapé
  page: { paddingTop: 40, paddingHorizontal: 40, paddingBottom: 80, backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  
  // Cabeçalho
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#2563eb", paddingBottom: 15, marginBottom: 20 },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logoBox: { width: 35, height: 35, backgroundColor: "#2563eb", borderRadius: 6, justifyContent: "center", alignItems: "center", marginRight: 10 },
  logoText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  brandName: { fontSize: 22, fontWeight: "bold", color: "#1e3a8a", letterSpacing: -0.5 },
  headerRight: { alignItems: "flex-end" },
  headerLabel: { fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 },
  headerSku: { fontSize: 14, fontWeight: "bold", color: "#1e293b", marginTop: 4 },

  // Título e Badges
  titleContainer: { marginBottom: 20 },
  badgesRow: { flexDirection: "row", marginBottom: 8 },
  badgeBlue: { backgroundColor: "#dbeafe", color: "#1e40af", fontSize: 8, fontWeight: "bold", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, textTransform: "uppercase", marginRight: 8 },
  badgeGray: { backgroundColor: "#f1f5f9", color: "#475569", fontSize: 8, fontWeight: "bold", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, textTransform: "uppercase" },
  productName: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },

  // Grid Principal (Foto + Info)
  // AQUI FOI CORRIGIDO: Adicionado alignItems: "flex-start" para a caixa cinza não esticar infinitamente
  mainGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: "flex-start" },
  
  imageCol: { width: "32%", height: 180, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#f1f5f9", borderRadius: 8, justifyContent: "center", alignItems: "center" },
  imageObject: { width: "100%", height: "100%", objectFit: "contain", padding: 10 },
  placeholderText: { fontSize: 9, color: "#94a3b8" },
  
  infoCol: { width: "65%", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  infoBox: { width: "48%", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 10, marginBottom: 8 },
  infoBoxFull: { width: "100%", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 10, marginBottom: 8 },
  label: { fontSize: 8, color: "#64748b", fontWeight: "bold", textTransform: "uppercase", marginBottom: 3 },
  value: { fontSize: 10, fontWeight: "bold", color: "#1e293b" },

  // Descrição e Aplicação
  descSection: { backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#dbeafe", borderRadius: 8, padding: 15, marginBottom: 20 },
  descTitle: { fontSize: 10, fontWeight: "bold", color: "#1e3a8a", textTransform: "uppercase", marginBottom: 8 },
  descText: { fontSize: 9, color: "#334155", lineHeight: 1.5 },
  descFooterRow: { flexDirection: "row", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#bfdbfe" },
  descFooterItem: { fontSize: 9, color: "#1e293b", marginRight: 25 },
  descFooterLabel: { fontWeight: "bold" },

  // Classificação Fiscal
  fiscalSection: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 15 },
  fiscalTitle: { fontSize: 10, fontWeight: "bold", color: "#1e293b", textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 6, marginBottom: 12 },
  fiscalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  fiscalBox: { width: "31%" }, 
  fiscalLabel: { fontSize: 8, color: "#64748b", textTransform: "uppercase", marginBottom: 2 },
  fiscalValue: { fontSize: 10, fontWeight: "bold", color: "#1e293b" },

  // Rodapé
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#94a3b8" }
});

export const FichaTecnicaPDF = ({ produto }: { produto: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}><Text style={styles.logoText}>+</Text></View>
          <Text style={styles.brandName}>ORTOPRATIKA</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerLabel}>Ficha Técnica</Text>
          <Text style={styles.headerSku}>SKU: {produto.sku}</Text>
        </View>
      </View>

      {/* TÍTULO E CATEGORIA */}
      <View style={styles.titleContainer}>
        <View style={styles.badgesRow}>
          <Text style={styles.badgeBlue}>{produto.categoria}</Text>
          <Text style={styles.badgeGray}>Ficha Oficial</Text>
        </View>
        <Text style={styles.productName}>{produto.nome}</Text>
      </View>

      {/* GRID PRINCIPAL: FOTO + DADOS BÁSICOS */}
      <View style={styles.mainGrid}>
        
        {/* Coluna da Imagem (Agora com altura blindada) */}
        <View style={styles.imageCol}>
          {produto.imagemUrl ? (
            <Image src={produto.imagemUrl} style={styles.imageObject} />
          ) : (
            <Text style={styles.placeholderText}>[ Sem Imagem ]</Text>
          )}
        </View>

        {/* Coluna de Informações */}
        <View style={styles.infoCol}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Marca</Text>
            <Text style={styles.value}>{produto.marca}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Registro ANVISA</Text>
            <Text style={styles.value}>{produto.registroAnvisa || "N/A"}</Text>
          </View>
          
          <View style={styles.infoBoxFull}>
            <Text style={styles.label}>Fabricante</Text>
            <Text style={styles.value}>{produto.fabricante}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Validade</Text>
            <Text style={styles.value}>{produto.validade}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Origem</Text>
            <Text style={styles.value}>{produto.origem}</Text>
          </View>
        </View>
      </View>

      {/* DESCRIÇÃO E APLICAÇÃO */}
      <View style={styles.descSection}>
        <Text style={styles.descTitle}>Descrição e Aplicação</Text>
        <Text style={styles.descText}>{produto.descricao}</Text>
        
        <View style={styles.descFooterRow}>
          <Text style={styles.descFooterItem}>
            <Text style={styles.descFooterLabel}>Dimensões: </Text>
            {produto.dimensoes || "N/A"}
          </Text>
          <Text style={styles.descFooterItem}>
            <Text style={styles.descFooterLabel}>Peso: </Text>
            {produto.peso}
          </Text>
        </View>
      </View>

      {/* CLASSIFICAÇÃO FISCAL */}
      <View style={styles.fiscalSection}>
        <Text style={styles.fiscalTitle}>Classificação Fiscal</Text>
        
        {/* LINHA 1 (3 itens fixos) */}
        <View style={styles.fiscalRow}>
          <View style={styles.fiscalBox}>
            <Text style={styles.fiscalLabel}>NCM</Text>
            <Text style={styles.fiscalValue}>{produto.ncm}</Text>
          </View>
          <View style={styles.fiscalBox}>
            <Text style={styles.fiscalLabel}>CST Origem</Text>
            <Text style={styles.fiscalValue}>{produto.cstOrigem}</Text>
          </View>
          <View style={styles.fiscalBox}>
            <Text style={styles.fiscalLabel}>CST PIS</Text>
            <Text style={styles.fiscalValue}>{produto.cstPis}</Text>
          </View>
        </View>

        {/* LINHA 2 (3 itens fixos) */}
        <View style={styles.fiscalRow}>
          <View style={styles.fiscalBox}>
            <Text style={styles.fiscalLabel}>CST COFINS</Text>
            <Text style={styles.fiscalValue}>{produto.cstCofins}</Text>
          </View>
          <View style={styles.fiscalBox}>
            <Text style={styles.fiscalLabel}>ICMS Alíquota</Text>
            <Text style={styles.fiscalValue}>{produto.icms}</Text>
          </View>
          <View style={styles.fiscalBox}>
            <Text style={styles.fiscalLabel}>IPI</Text>
            <Text style={styles.fiscalValue}>{produto.ipi}</Text>
          </View>
        </View>

      </View>

      {/* RODAPÉ */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Ortopratika - Catálogo Oficial</Text>
        <Text style={styles.footerText}>[ Espaço reservado para novas informações ]</Text>
      </View>

    </Page>
  </Document>
);