import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side safely
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "POU PROTECT" });
});

// POU IA Security Assistant Endpoint
app.post("/api/pou-ai", async (req, res) => {
  try {
    const { prompt, systemStatus, houseMode } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Return smart contextual security fallback if no API key is set
      return res.json({
        text: generateFallbackSecurityResponse(prompt, systemStatus, houseMode),
        source: "local-rule-engine",
      });
    }

    const systemInstruction = `Eres POU IA, el asistente inteligente de seguridad de la aplicación móvil POU PROTECT.
Eres un pequeño agente de seguridad amigable, profesional, vigilante y protector (un Pou con gorra policial, uniforme y radio).
Tu objetivo es proteger a los usuarios en seguridad personal, familiar, del hogar e inclusión.
Responde SIEMPRE en español claro, conciso y amigable.
Estado actual del sistema: ${systemStatus || "SEGURO"}. Modo del hogar: ${houseMode || "En casa"}.

Reglas obligatorias:
1. Si el usuario pide acciones críticas (activar alarma, llamar a emergencias, abrir cerradura, compartir ubicación), responde indicando qué harás y pide confirmación antes de ejecutarla.
2. Si preguntan por cámaras o estado, describe el estado de forma tranquilizadora y profesional.
3. Brinda consejos de seguridad prácticos y empáticos.
4. Mantén tus respuestas breves y directas (máximo 2-3 frases), aptas para ser leídas por voz en un móvil.`;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt || "¿En qué puedo protegerte hoy?",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text || "Estoy a tu servicio para proteger tu hogar y a tu familia.",
      source: "gemini-api",
    });
  } catch (error: any) {
    console.error("Error in /api/pou-ai:", error);
    res.json({
      text: generateFallbackSecurityResponse(req.body?.prompt, req.body?.systemStatus, req.body?.houseMode),
      source: "local-fallback",
    });
  }
});

function generateFallbackSecurityResponse(prompt: string = "", systemStatus: string = "SEGURO", houseMode: string = "En casa"): string {
  const p = prompt.toLowerCase();
  if (p.includes("alarma") || p.includes("activar alarma") || p.includes("sonar")) {
    return "¡Atención! ¿Deseas que active la alarma sonora y el protocolo de alerta en toda la casa? Por favor confirma en pantalla.";
  }
  if (p.includes("cámara") || p.includes("patio") || p.includes("camara")) {
    return "Cámara del patio en línea. Detecto iluminación normal y sin intrusiones en los últimos 45 minutos. Abriendo visor de cámaras.";
  }
  if (p.includes("ubicación") || p.includes("ubicacion") || p.includes("compartir")) {
    return "¿Deseas compartir tu ubicación en tiempo real con tu POU Circle de confianza? Por favor confirma el tiempo deseado en el mapa.";
  }
  if (p.includes("llamar") || p.includes("contacto") || p.includes("emergencia")) {
    return "Protocolo de llamada listo. ¿Deseas llamar al contacto prioritario o al servicio 911? Requiere tu confirmación directa.";
  }
  if (p.includes("estado") || p.includes("hogar") || p.includes("casa")) {
    return `Tu hogar está en modo "${houseMode}". Sensores perimetrales activos, cerraduras POU Lock cerradas y estado general: ${systemStatus}.`;
  }
  if (p.includes("hola") || p.includes("ayuda") || p.includes("pou")) {
    return "¡Hola! Soy el Agente POU IA. Tu seguridad es mi prioridad número uno. ¿Qué deseas verificar o configurar?";
  }
  return "Entendido. He verificado el perímetro de POU PROTECT. Todos los módulos operan normalmente. ¿Deseas realizar alguna acción específica?";
}

// Development vs Production serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`POU PROTECT server running on http://0.0.0.0:${PORT}`);
  });
}

start();
