import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { feeling } = await req.json();

    if (!feeling || feeling.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Feeling is required" }), { status: 400 });
    }

    console.log("Embedding生成中:", feeling);

    const res = await client.embeddings.create({
      model: "text-embedding-3-large",
      input: [feeling],
    });

    const embedding = res.data[0].embedding;

    return new Response(
      JSON.stringify({
        embedding,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Error in /api/embed:", err);
    return new Response(JSON.stringify({ error: "Failed to generate embedding" }), { status: 500 });
  }
}
