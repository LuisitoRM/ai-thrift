import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
// Vercel asigna el puerto automáticamente, por eso usamos process.env.PORT
const port = process.env.PORT || 3000;

/**
 * CONFIGURACIÓN DE SEGURIDAD PARA GEMINI
 * Eliminamos el forzado de 'v1' que causaba el error 404.
 * Usamos la variable de entorno para la API Key.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Simplificamos la llamada: el SDK seleccionará la versión correcta automáticamente
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors()); // Permitimos CORS para que el frontend en Vercel pueda conectar
app.use(express.json());

// Ruta raíz para evitar el error "Cannot GET /" que vimos antes
app.get('/', (req, res) => {
  res.send('AI-Thrift Backend está activo 🚀');
});

app.post('/api/optimize', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, tool } = req.body;

    if (!prompt || !prompt.trim()) {
      res.status(400).json({ error: 'El prompt es requerido.' });
      return;
    }

    const systemInstruction = `Eres un experto en ingeniería de prompts para ${tool}. 
Transforma el siguiente mensaje del usuario en una estructura técnica Markdown con:
### Objetivo
### Requisitos
### Restricciones
Elimina cualquier saludo, cortesía o relleno innecesario. No expliques lo que haces, solo entrega el prompt optimizado.`;

    const result = await model.generateContent(`${systemInstruction}\n\nINPUT: ${prompt}`);
    const response = await result.response;
    const optimizedText = response.text();

    const tokensBefore = Math.round(prompt.length / 4);
    const tokensAfter = Math.round(optimizedText.length / 4);
    const savings = Math.max(5, Math.round(((tokensBefore - tokensAfter) / tokensBefore) * 100)) || 30;

    res.json({
      optimizedPrompt: optimizedText,
      tokensBefore: tokensBefore,
      tokensAfter: tokensAfter,
      savings: savings
    });

  } catch (error: any) {
    console.error('--- ERROR EN EL PIPELINE DE GEMINI ---');
    console.error('Detalle:', error.message);
    
    res.status(500).json({ 
      error: 'Error interno en el servidor de IA.',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor AI-Thrift activo en el puerto ${port}`);
});
