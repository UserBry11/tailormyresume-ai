import OpenAI from "openai";

export const runtime = "nodejs";

type Body = {
  resume: string;
  jobDescription: string;
};

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body.resume?.trim() || !body.jobDescription?.trim()) {
      return Response.json(
        { error: "Resume and job description are required." },
        { status: 400 }
      );
    }

    const apiKey = requiredEnv("OPENAI_API_KEY");
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const client = new OpenAI({ apiKey });

    const system = `
You are a professional resume writer.
You rewrite resumes to match job descriptions.
You preserve truth and accuracy.
You optimize for ATS keywords.
You return a clean, ready-to-submit resume.
`;

    const user = `
CURRENT RESUME:
${body.resume}

JOB DESCRIPTION:
${body.jobDescription}

TASK:
Rewrite the resume to closely match the job description.
- Keep it honest
- Use relevant keywords
- Improve clarity and impact
- Do NOT invent experience
Return ONLY the rewritten resume text.
`;

    const resp = await client.responses.create({
      model,
      input: [
        { role: "system", content: system.trim() },
        { role: "user", content: user.trim() }
      ]
    });

    const text = resp.output_text?.trim();

    if (!text) {
      throw new Error("No output from OpenAI");
    }

    return Response.json({ text });
  } catch (err: any) {
    console.error("Tailor error:", err);
    return Response.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
