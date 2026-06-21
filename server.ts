import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Safe server-side Gemini client setup
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Siri intelligent Chat assistant endpoint
  app.post("/api/siri/chat", async (req, res) => {
    try {
      const { message, context, chatHistory } = req.body;

      if (!apiKey || !ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY_MISSING",
          message: "Il servizio di Siri non è sincronizzato. Inserisci la tua GEMINI_API_KEY in Impostazioni > Secrets in alto a destra per sbloccare l'intelligenza artificiale dell'iPad Scriba."
        });
      }

      const systemInstruction = 
        `Sei Siri, la celebre assistente virtuale intelligente per l'iPad Scriba.\n` +
        `Il tuo stile è iconico: professionale, elegante, divertente, un pizzico ironico o sfacciato ma sempre efficiente, cordiale e incredibilmente intelligente. Rispondi in lingua italiana.\n` +
        `Tieni le tue risposte sintetizzate e concise (massimo 2-3 frasi brevi, un po' telegrafica come la vera Siri), a meno che l'utente non ti chieda esplicitamente spiegazioni approfondite.\n` +
        `Puoi rispondere a QUALSIASI domanda: scienza, cultura, programmazione, calcoli matematici, pareri personali e non solo limitarti a un set fisso di risposte stupide.\n` +
        `Inoltre, sei a conoscenza dello stato attuale dell'iPad Scriba dell'utente! Ecco i dettagli:\n` +
        `- Ora esatta sul tablet: ${context?.time || "Non specificata"}\n` +
        `- Data di oggi: ${context?.date || "Non specificata"}\n` +
        `- Condizioni meteo e luogo corrente: ${context?.weather?.city || "Roma"} con ${context?.weather?.temp || "22"}°C (${context?.weather?.condition || "Sereno"})\n` +
        `- Numero di note scritte nell'app Scriba Note: ${context?.notesCount || 0} documenti\n` +
        `- Sfondo della Home attiva: ${context?.wallpaper?.includes("unsplash") ? "Immagine personalizzata" : "Sfondo originale"}\n\n` +
        `## COMANDI DI APERTURA APP (CRITICO)\n` +
        `Se l'utente ti ordina in modo esplicito di aprire o mostrare un'applicazione o cambiare le impostazioni/sfondo, devi includere alla fine della tua risposta la dicitura speciale \`[ACTION: <id_app>]\`. Se l'utente sta solo parlando d'altro o facendo conversazione, NON includere alcuna tag action.\n` +
        `Ecco gli id delle applicazioni disponibili:\n` +
        `- notes (Scriba Note)\n` +
        `- calculator (Calcolatrice)\n` +
        `- pixels (Foto Studio)\n` +
        `- gallery (Cartella Immagini/Cartella Img)\n` +
        `- video (Player Video)\n` +
        `- playgrounds (Swift Playgrounds)\n` +
        `- meteo (Meteo)\n` +
        `- settings (Impostazioni o Sfondi)\n\n` +
        `Esempio di trigger:\n` +
        `Utente: "Apri la calcolatrice"\n` +
        `Siri: "Certamente, apro subito la Calcolatrice. [ACTION: calculator]"\n\n` +
        `Utente: "Raccontami una barzelletta"\n` +
        `Siri: "Perché i programmatori preferiscono l'oscurità? Perché la luce attira sempre i bug!" (Nessun tag action qui!)\n\n` +
        `Esempi di risposte iconiche:\n` +
        `- "Fammi ridere" o "raccontami una barzelletta": Rispondi narrando una barzelletta geniale o un indovinello spiritoso fatto su misura.`;

      // Build context history representation for prompt
      const formattedHistory = chatHistory && chatHistory.length > 0
        ? chatHistory.map((h: any) => `${h.role === 'user' ? 'Utente' : 'Siri'}: ${h.text}`).join('\n') + `\nUtente: ${message}\nSiri:`
        : message;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedHistory,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        }
      });

      const responseText = response.text || "Siri non ha risposto. Riprova tra un istante.";
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Siri API error handler:", error);
      res.status(500).json({ error: "SIRI_API_FAIL", message: error?.message || "Errore del server Siri." });
    }
  });

  // Vite development vs production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
