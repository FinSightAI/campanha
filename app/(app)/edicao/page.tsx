import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";

export default function EdicaoPage() {
  // CAMPANHA_PLAN takes priority; fallback to provider (heygen = Pro)
  const plan = process.env.CAMPANHA_PLAN;
  const provider = process.env.CAMPANHA_VIDEO_PROVIDER ?? "did";
  const isPro = plan === "pro" || (!plan && provider === "heygen");

  return <EditorClient isPro={isPro} />;
}
