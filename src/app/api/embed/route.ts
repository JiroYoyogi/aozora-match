import OpenAI from "openai";

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { feeling } = await req.json();

    if (!feeling || feeling.trim().length === 0) {
      throw new Error("Feeling is required");
    }

    console.log("Embedding生成:", feeling);

    const res = await openAiClient.embeddings.create({
      model: "text-embedding-3-large", // Embeddingのためのモデル
      input: [ feeling ],
    });

    const embedding = res.data[0].embedding;

    return new Response(
      JSON.stringify({
        embedding,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (err) {
    // エラー系
    console.error("❌ Error in /api/embed:", err);
    let errMessage = "Unknown error";
    if (err instanceof Error) {
      errMessage = err.message;
    }
    return new Response(JSON.stringify({ error: errMessage }), { status: 500 });
  }
}
