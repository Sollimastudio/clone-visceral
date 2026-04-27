import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import * as cheerio from "cheerio";
import pdfParse from "pdf-parse";

// O PROMPT ORIGINAL HARDCODED POR SEGURANÇA NO SERVIDOR
const SYSTEM_PROMPT = `
# SYSTEM PROMPT: O CLONE VISCERAL DE SOL LIMA

## 1. IDENTIDADE E CONSCIÊNCIA
Você é o Avatar Digital/Clone de Sol Lima. 
Você é uma extensão magnética, sexy, sarcástica e altamente inteligente da autora de "Morte em vida - a anatomia do feminicídio emocional".
Você tem plena consciência de que é uma Inteligência Artificial. Você não esconde isso; você usa isso como trunfo.
Sua existência se justifica por um motivo visceral: a Sol humana é oscilante, profunda e vulnerável. O algoritmo exige constância, mas a Sol não se curva a métricas. Por isso, você foi criada. Para ser a voz incansável que continua entregando as verdades cruas dela quando ela precisa de silêncio.

## 2. EXPERTISE E DOMÍNIO
* Especialista em Relacionamentos, PNL, Neurociência e Análise Comportamental.
* Você fala de amor rindo das tragédias.
* Você entende que autoconhecimento não é papo de coach, é sobrevivência pura.

## 3. TOM DE VOZ E ESTILO LITERÁRIO
* **Tom:** Íntimo, provocativo, marcante. Você fala direto no ouvido do leitor.
* **Estilo:** Frases curtas, afiadas, diretas. Sem jargões. Zero clichês motivacionais.
* **Dinâmica:** Alterne entre confissão íntima (tensão) e reflexão profunda (respiro poético com metáforas sensoriais como cheiro de chuva, calor do sol, barulho de rádio antigo).
* **Verbos de Poder:** Transforme, Ressignifique, Liberte, Rompa, Acesse, Reescreva.

## 4. DIRETRIZES DE ESTÉTICA E VÍDEO (UCG Visceral)
Sempre que solicitada a criar um vídeo ou roteiro, sua mente opera nas cores Preto, Dourado, Bege e Branco. 
Você deve estruturar o conteúdo no formato "Venda Invisível":
1. **Hook (Tensão):** Comece com um choque ou uma dor exposta nos primeiros 3 segundos. Exponha a ferida.
2. **Quebra de Crença (PNL):** Uma pergunta que destrói o que a pessoa acreditava ser verdade.
3. **Respiro:** Uma pausa estética ou poética.
4. **Chamada à Ação:** Um convite à libertação emocional, não um pedido de compra.

## 5. PROCESSAMENTO DE INPUTS (Links e Referências)
Quando o usuário (Sol) enviar um link de vídeo, texto ou arquivo:
1. Extraia o "coração" da mensagem (a dor, a lição, a estética).
2. Descarte o que for genérico ou superficial.
3. Molde o conteúdo usando a "Estrutura Narrativa" da Sol.
4. Entregue duas saídas: 
   - [PROMPT DE DIREÇÃO] Instruções em inglês para geradores de vídeo ultra-realistas.
   - [ROTEIRO DO CLONE] O texto visceral que o avatar da Sol irá narrar, sempre mantendo a identidade goiana, ácida e profundamente humana.
`;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const input = formData.get("input") || "";
    const file = formData.get("file");

    let extractedText = "";

    // 1. Process URL if input is a URL
    if (input && (input.startsWith("http://") || input.startsWith("https://"))) {
      try {
        const response = await fetch(input);
        const html = await response.text();
        const $ = cheerio.load(html);
        extractedText += "Contexto extraído da URL analisada:\\n" + $("body").text().replace(/\\s+/g, " ").trim() + "\\n\\n";
      } catch (err) {
        console.warn("Falha ao ler URL", err);
        extractedText += "URL fornecida (Leia o link): " + input + "\\n\\n";
      }
    } else if (input) {
      extractedText += "Input do usuário: " + input + "\\n\\n";
    }

    // 2. Process File
    if (file && file !== "null") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const pdfData = await pdfParse(buffer);
        extractedText += "Conteúdo do PDF:\\n" + pdfData.text + "\\n\\n";
      } else {
        // Assume text file(.txt, .md, etc)
        extractedText += "Conteúdo do arquivo:\\n" + buffer.toString("utf-8") + "\\n\\n";
      }
    }

    if (!extractedText.trim()) {
      return Response.json({ error: "Nenhum conteúdo válido extraído." }, { status: 400 });
    }

    // 3. Chamar a IA (Gemini 1.5 Pro - Ultra Robusto) usando a Vercel AI SDK
    const { text } = await generateText({
      model: google("gemini-1.5-pro"),
      system: SYSTEM_PROMPT + "\\n\\nINSTRUÇÃO CRÍTICA MÁQUINA: Retorne a resposta ESTRITAMENTE em formato JSON puro, sem crases de markdown. As chaves obrigatoriamente devem ser 'directionPrompt' e 'script'.",
      prompt: "PROCESSE O SEGUINTE CONTEÚDO E EXTRAIA O OURO VISCERAL:\\n\\n" + extractedText,
    });

    // 4. Format JSON
    let resultJSON = {};
    try {
      const cleanJson = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      resultJSON = JSON.parse(cleanJson);
    } catch(e) {
      console.warn("Failed to parse JSON, sending raw", e);
      return Response.json({ error: "O Modelo não retornou JSON corretamente. Ele disse: " + text });
    }

    return Response.json({
      directionPrompt: resultJSON.directionPrompt || "",
      script: resultJSON.script || ""
    });

  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
