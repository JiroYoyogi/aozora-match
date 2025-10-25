import fs from "fs/promises";
import path from "path";

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

    const results = allData.slice(0, limit);

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
