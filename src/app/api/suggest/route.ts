import OpenAI from "openai";

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { feeling, recommendations } = await req.json();

    if (!feeling || !Array.isArray(recommendations)) {
      throw new Error("Invalid input");
    }

    const content = recommendations[0];

    const systemPrompt = `
あなたは日本文学に詳しい文芸アドバイザーです。
文学作品を優しくおすすめしてください。
文体は自然で、100〜200文字程度の日本語のおすすめ文にしてください。
`;

    const userMessage = `
作品情報:
タイトル: 『${content.title}』
著者: ${content.author}
概要: ${content.summary}

この作品を読みたくなるような短いおすすめコメントを書いてください。
`;

    const res = await openAiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        // AIの性格・制約など
        { role: "system", content: systemPrompt },
        // ユーザーのプロンプト
        { role: "user", content: userMessage },
      ],
      // 数値が低いほど教科書的。高いほど自由で創造的。0 ~ 2で設定
      temperature: 0.8,
    });

    // オプションを渡すと複数の回答（=選択肢）を作成させることも可能
    const generatedText = res.choices?.[0]?.message?.content?.trim() ?? "";

    const suggestions = [{
      title: content.title,
      author: content.author,
      suggestion: generatedText,
      url: content.url,
    }];

    // レスポンス返却
    return new Response(JSON.stringify({ suggestions }), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (err) {
    // エラー系
    console.error("❌ Error in /api/suggest:", err);
    let errMessage = "Unknown error";
    if (err instanceof Error) {
      errMessage = err.message;
    }
    return new Response(JSON.stringify({ error: errMessage }), { status: 500 });
  }
}
