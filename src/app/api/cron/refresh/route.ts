import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json(
        { ok: false, error: "unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/archive");
  revalidateTag("daily-quote");
  revalidateTag("github-repo");

  return Response.json(
    {
      ok: true,
      refreshedAt: new Date().toISOString(),
      revalidated: ["/", "/posts", "/archive", "daily-quote", "github-repo"]
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
