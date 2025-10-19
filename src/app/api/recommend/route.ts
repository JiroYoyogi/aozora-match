import fs from "fs/promises";
import path from "path";

// ✅ コサイン類似度を計算する関数
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

export async function POST(req: Request) {
  try {
    const { embedding, limit = 5 } = await req.json();
    if (!embedding || !Array.isArray(embedding)) {
      return new Response(JSON.stringify({ error: "Invalid embedding" }), { status: 400 });
    }

    // JSONファイル群を読み込み
    const dir = path.join(process.cwd(), "data");
    const files = await fs.readdir(dir);

    const allData = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(path.join(dir, file), "utf-8");
        return JSON.parse(content);
      })
    );

    // 類似度を計算
    const results = allData
      .map((item) => ({
        ...item,
        similarity: cosineSimilarity(embedding, item.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return new Response(JSON.stringify({ items: results }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error:", err);
    if (err instanceof Error) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    } else {
      return new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 });
    }
    
  }
}
