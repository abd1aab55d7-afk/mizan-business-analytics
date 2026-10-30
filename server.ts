import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // AI Business Analyst API Proxy Route
  app.post('/api/analyst', async (req, res) => {
    const { query, metrics } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in environment',
      });
    }

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    try {
      const ai = new GoogleGenAI();
      const prompt = `أنت كبير محللي الأعمال وخبير ذكاء الأعمال (BI) المتخصص في قطاع توزيع السلع والتجارة في مصر.
المستخدم يسألك السؤال التالي حول أداء شركته:
"${query}"

فيما يلي ملخص المؤشرات والأرقام المحسوبة والمحققة فعلياً في قاعدة البيانات:
- صافي المبيعات (Net Revenue): ${metrics.revenue} ${metrics.currency || 'EGP'}
- مبيعات الفترة السابقة: ${metrics.prevRevenue ?? 'غير متوفرة'}
- عدد الطلبات المميزة (Orders): ${metrics.orders}
- متوسط قيمة الفاتورة (AOV): ${metrics.aov}
- هامش الربح الإجمالي (Margin): ${metrics.margin ? `${metrics.margin}%` : 'غير متوفر لعدم توفر التكلفة'}
- أفضل المنتجات إيراداً: ${JSON.stringify(metrics.topProducts || [])}
- أكبر العملاء تركيزاً: ${JSON.stringify(metrics.topCustomers || [])}

تعليمات إلزامية للإجابة:
1. أجب بلغة عربية إدارية واضحة ومفهومة لأصحاب الشركات والموزعين في مصر.
2. اعتمد حصراً على الأرقام المعطاة أعلاه، ولا تخترع أي أرقام من خارج هذا السياق أبداً.
3. ميز بدقة بين "الحقائق الرقمية المثبتة" و"الفرضيات القابلة للاختبار"، ولا تدعي أن عاملاً هو السبب الرئيسي دون دليل مباشر.
4. اعرض إجابتك بصيغة JSON تحتوي على المفاتيح التالية:
   - answer: فقرة الشرح الأساسية بصيغة HTML خفيفة (استخدم <strong> للتركيز).
   - facts: مصفوفة من الحقائق الرقمية المؤكدة.
   - hypotheses: مصفوفة من الفرضيات المقترحة التي تستحق التحقق.
   - limitations: مصفوفة من محددات البيانات.
   - nextSteps: مصفوفة من 2-3 خطوات عملية وتوصيات تنفيذية لمتخذ القرار.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      try {
        const parsed = JSON.parse(text);
        res.json(parsed);
      } catch (e) {
        res.json({
          answer: text,
          facts: [],
          hypotheses: [],
          limitations: [],
          nextSteps: [],
        });
      }
    } catch (err: any) {
      console.error('Gemini Analyst Error:', err);
      res.status(500).json({ error: err.message || 'Error executing AI analysis' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Development: Mount Vite middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Business Insight AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
