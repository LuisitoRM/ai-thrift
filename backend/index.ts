import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || '');
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

app.post('/api/optimize', async (req: Request, res: Response) => {
  try {
    const { prompt, tool } = req.body;
    const tokensBefore = Math.ceil(prompt.length / 4);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const instruction = `Optimiza este prompt para ${tool}. Elimina cortesías, sé técnico y directo. Devuelve SOLO el prompt optimizado.`;
    
    const result = await model.generateContent([instruction, prompt]);
    const optimized = result.response.text().trim();
    const tokensAfter = Math.ceil(optimized.length / 4);
    const savings = Math.round(((tokensBefore - tokensAfter) / tokensBefore) * 100);

    await supabase.from('token_savings').insert([{
      original_prompt: prompt,
      optimized_prompt: optimized,
      tokens_before: tokensBefore,
      tokens_after: tokensAfter,
      savings_percent: savings,
      tool_target: tool
    }]);

    res.json({ optimizedPrompt: optimized, tokensBefore, tokensAfter, savings });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
});

export default app;
