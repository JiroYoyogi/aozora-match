# セットアップ

- Next.js

```
npm i
```

- Open AI SDK

```
npm i openai
```

- `.env`ファイルを作成

```
OPENAI_API_KEY=
```

# 手順

- Step1: ユーザーの気分をEmbedding
- Step2: Embeddingを元に類似作品を取得
- Step3: オススメ文を作成

# Step1: ユーザーの気分をEmbedding

```tsx
      // Step1: ユーザーの気分をEmbedding
      const embedRes = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeling }),
      });

      const embedResJson = await embedRes.json();

      if (!embedRes.ok) {
        throw new Error(embedResJson.error || `API Error (${embedRes.status})`);
      }

      const embedding = embedResJson.embedding;

      console.log(embedding);
```

# Step2: Embeddingを元に類似作品を取得

- page.tsx

リストの先頭から３冊を取得

```tsx
      // Step2: Embeddingで類似作品を取得
      const recRes = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedding, limit: 3 }),
      });

      const recResJson = await recRes.json();

      if (!recRes.ok) {
        throw new Error(recResJson.error || `API Error (${recRes.status})`);
      }

      const recommendations = recResJson.items;

      console.log(recommendations);
```

- api/recommend/route.ts

Step1で得られた座標と同じ方向を向いた本を取得

```ts
// ベクトルがどれだけ同じ方向を向いているかを測る関数
// -1 ~ 1。1に近いほど意味が近い
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}
```

上記関数でリストを選択した感情のに近いものでソート

```ts
    // 類似度を計算
    const results = allData
      .map((item) => ({
        ...item,
        similarity: cosineSimilarity(embedding, item.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
```

# Step3: オススメ文を作成

- page.tsx

```tsx
      // Step3: オススメ文を作成
      const sugRes = await fetch("/api/suggest", {
        method: "POST",
        body: JSON.stringify({ feeling, recommendations }),
      });
      const sugResJson = await sugRes.json();

      if (!sugRes.ok) {
        throw new Error(sugResJson.error || `API Error (${sugRes.status})`);
      }

      const suggestions = sugResJson.suggestions;
      setSuggestions(suggestions);
```

- api/suggest/route.ts

ユーザーの気分に合わせてオススメ文を作成

（システムプロンプト）

```ts
    const systemPrompt = `
あなたは日本文学に詳しい文芸アドバイザーです。
与えられたユーザーの感情や気分に合わせて、文学作品を優しくおすすめしてください。
文体は自然で、100〜200文字程度の日本語のおすすめ文にしてください。
`;
```

（ユーザープロンプト）

```ts
    const userMessage = `
ユーザーの気分: ${feeling}
作品情報:
タイトル: 『${content.title}』
著者: ${content.author}
概要: ${content.summary}

この作品を読みたくなるような短いおすすめコメントを書いてください。
`;
```

３件のオススメを作成

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { feeling, recommendations } = await req.json();

    if (!feeling || !Array.isArray(recommendations)) {
      throw new Error("Invalid input");
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
    // エラー系
    console.error("❌ Error in /api/suggest:", err);
    let errMessage = "Unknown error";
    if (err instanceof Error) {
      errMessage = err.message;
    }
    return new Response(JSON.stringify({ error: errMessage }), { status: 500 });
  }
}
```