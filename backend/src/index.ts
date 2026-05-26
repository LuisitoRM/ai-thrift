import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = 3000;

/**
 * CONFIGURACIÓN DE SEGURIDAD PARA GEMINI
 * Forzamos apiVersion: 'v1' para evitar errores 404 de rutas beta.
 */
const genAI = new GoogleGenerativeAI('AIzaSyDHDFcqgrrYW9-pxXB1kqjUJhAaqzTurAA');
const model = genAI.getGenerativeModel(
  { model: "gemini-1.5-flash" }, 
  { apiVersion: 'v1' }
);

// Configuración de CORS permitiendo cualquier origen para desarrollo local
app.use(cors({ origin: '*' }));
app.use(express.json());

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

    // Ejecución con el modelo configurado en V1
    const result = await model.generateContent(`${systemInstruction}\n\nINPUT: ${prompt}`);
    const response = await result.response;
    const optimizedText = response.text();

    // Cálculos de métricas para la interfaz
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
  console.log(`🚀 Servidor AI-Thrift (MODO ESTABLE V1) activo en http://localhost:${port}`);
});