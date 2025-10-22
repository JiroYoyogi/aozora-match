import fs from "fs/promises";
import path from "path";

// ベクトルがどれだけ同じ方向を向いているかを測る関数
// -1 ~ 1。1に近いほど意味が近い
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

export async function POST(req: Request) {
  try {
    const { embedding, limit = 3 } = await req.json();
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Invalid embedding");
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
    // エラー系
    console.error("❌ Error in /api/recommend:", err);
    let errMessage = "Unknown error";
    if (err instanceof Error) {
      errMessage = err.message;
    }
    return new Response(JSON.stringify({ error: errMessage }), { status: 500 });
    
  }
}
