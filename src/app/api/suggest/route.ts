import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { feeling, recommendations } = await req.json();

    if (!feeling || !Array.isArray(recommendations)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }

    const systemPrompt = `
あなたは日本文学に詳しい文芸アドバイザーです。
与えられたユーザーの感情や気分に合わせて、文学作品を優しくおすすめしてください。
文体は自然で、100〜200文字程度の日本語のおすすめ文にしてください。
`;

    // 各作品ごとにおすすめ文を生成
    const suggestions = await Promise.all(
      recommendations.map(async (w) => {
        const userMessage = `
ユーザーの気分: ${feeling}

作品情報:
タイトル: 『${w.title}』
著者: ${w.author}
概要: ${w.summary}

この作品を読みたくなるような短いおすすめコメントを書いてください。
`;

        const res = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.8,
        });

        const suggestion = res.choices?.[0]?.message?.content?.trim() ?? "";

        return {
          title: w.title,
          author: w.author,
          suggestion,
          similarity: w.similarity,
          url: w.url,
        };
      })
    );

    // レスポンス返却
    return new Response(JSON.stringify({ suggestions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ /api/suggest Error:", err instanceof Error ? err.message : err);
    return new Response(JSON.stringify({ error: "Failed to generate suggestions" }), {
      status: 500,
    });
  }
}
