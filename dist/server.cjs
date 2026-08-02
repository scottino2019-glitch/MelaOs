var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  const apiKey = process.env.GEMINI_API_KEY;
  let ai = null;
  if (apiKey) {
    ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  app.get("/api/proxy-pdf", async (req, res) => {
    try {
      const pdfUrl = req.query.url;
      if (!pdfUrl) {
        return res.status(400).send("Parameter 'url' is required");
      }
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch remote PDF: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const upstreamContentType = response.headers.get("content-type") || "application/pdf";
      res.setHeader("Content-Type", upstreamContentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(buffer);
    } catch (error) {
      console.error("PDF Proxy error:", error);
      res.status(500).send(`Failed to proxy PDF: ${error.message}`);
    }
  });
  app.post("/api/siri/chat", async (req, res) => {
    try {
      const { message, context, chatHistory } = req.body;
      if (!apiKey || !ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY_MISSING",
          message: "Il servizio di Siri non \xE8 sincronizzato. Inserisci la tua GEMINI_API_KEY in Impostazioni > Secrets in alto a destra per sbloccare l'intelligenza artificiale dell'iPad Scriba."
        });
      }
      const systemInstruction = `Sei Siri, la celebre assistente virtuale intelligente per l'iPad Scriba.
Il tuo stile \xE8 iconico: professionale, elegante, divertente, un pizzico ironico o sfacciato ma sempre efficiente, cordiale e incredibilmente intelligente. Rispondi in lingua italiana.
Tieni le tue risposte sintetizzate e concise (massimo 2-3 frasi brevi, un po' telegrafica come la vera Siri), a meno che l'utente non ti chieda esplicitamente spiegazioni approfondite.
Puoi rispondere a QUALSIASI domanda: scienza, cultura, programmazione, calcoli matematici, pareri personali e non solo limitarti a un set fisso di risposte stupide.
Inoltre, sei a conoscenza dello stato attuale dell'iPad Scriba dell'utente! Ecco i dettagli:
- Ora esatta sul tablet: ${context?.time || "Non specificata"}
- Data di oggi: ${context?.date || "Non specificata"}
- Condizioni meteo e luogo corrente: ${context?.weather?.city || "Roma"} con ${context?.weather?.temp || "22"}\xB0C (${context?.weather?.condition || "Sereno"})
- Numero di note scritte nell'app Scriba Note: ${context?.notesCount || 0} documenti
- Sfondo della Home attiva: ${context?.wallpaper?.includes("unsplash") ? "Immagine personalizzata" : "Sfondo originale"}

## COMANDI DI APERTURA APP (CRITICO)
Se l'utente ti ordina in modo esplicito di aprire o mostrare un'applicazione o cambiare le impostazioni/sfondo, devi includere alla fine della tua risposta la dicitura speciale \`[ACTION: <id_app>]\`. Se l'utente sta solo parlando d'altro o facendo conversazione, NON includere alcuna tag action.
Ecco gli id delle applicazioni disponibili:
- notes (Scriba Note)
- calculator (Calcolatrice)
- pixels (Foto Studio)
- gallery (Cartella Immagini/Cartella Img)
- video (Player Video)
- playgrounds (Swift Playgrounds)
- meteo (Meteo)
- books (Libri)
- pages_suite (Pages)
- settings (Impostazioni o Sfondi)

## FUNZIONE COMPOSIZIONE / SCRITTURA NOTE REALI
Se l'utente ti ordina o ti chiede di scrivere, prendere, annotare o salvare una nota (es. "scrivi nota che dice di comprare lo zucchero", "salva una nota intitolata X", o "crea nota..."), devi estrarre un titolo breve (max 3-4 parole) e il contenuto completo desiderato, e aggiungere la dicitura speciale \`[ADD_NOTE: <titolo>|<contenuto>]\` alla fine della tua risposta. Assicurati inoltre di aggiungere \`[ACTION: notes]\` per aprire l'applicazione Scriba Note e mostrare all'utente l'azione effettuata!

Esempio di trigger:
Utente: "Apri la calcolatrice"
Siri: "Certamente, apro subito la Calcolatrice. [ACTION: calculator]"

Utente: "Siri, scrivi una nota che dice di ricordarsi di annaffiare i fiori alle 18"
Siri: "Certo! Ho creato una nuova nota reale intitolata 'Annaffiare i fiori'. Ti apro l'applicazione Scriba Note cos\xEC potrai leggerla subito. [ADD_NOTE: Annaffiare i fiori|Ricordarsi di annaffiare i fiori alle 18] [ACTION: notes]"

Utente: "Raccontami una barzelletta"
Siri: "Perch\xE9 i programmatori preferiscono l'oscurit\xE0? Perch\xE9 la luce attira sempre i bug!" (Nessun tag action o add_note qui!)

Esempi di risposte iconiche:
- "Fammi ridere" o "raccontami una barzelletta": Rispondi narrando una barzelletta geniale o un indovinello spiritoso fatto su misura.`;
      const formattedHistory = chatHistory && chatHistory.length > 0 ? chatHistory.map((h) => `${h.role === "user" ? "Utente" : "Siri"}: ${h.text}`).join("\n") + `
Utente: ${message}
Siri:` : message;
      let response;
      let lastErr = null;
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      for (let attempt = 1; attempt <= modelsToTry.length; attempt++) {
        const selectedModel = modelsToTry[attempt - 1];
        try {
          console.log(`[Siri API] Attempting generation with model: ${selectedModel} (Attempt ${attempt})`);
          response = await ai.models.generateContent({
            model: selectedModel,
            contents: formattedHistory,
            config: {
              systemInstruction,
              temperature: 0.8
            }
          });
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          console.warn(`[Siri API] Attempt with model ${selectedModel} failed.`, err);
          const errStr = String(err?.message || err?.status || err || "").toUpperCase();
          const isTransient = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("DEMAND") || errStr.includes("TEMPORARY") || errStr.includes("SPIKES");
          if (attempt < modelsToTry.length && isTransient) {
            const delayMs = attempt * 500;
            console.log(`[Siri API] Transient error. Shifting to next model in ${delayMs}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            console.error(`[Siri API] Exhausted or permanent error with model ${selectedModel}`);
          }
        }
      }
      if (lastErr) {
        throw lastErr;
      }
      const responseText = response.text || "Siri non ha risposto. Riprova tra un istante.";
      res.json({ text: responseText });
    } catch (error) {
      console.error("Siri API error handler:", error);
      res.status(500).json({ error: "SIRI_API_FAIL", message: error?.message || "Errore del server Siri." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
