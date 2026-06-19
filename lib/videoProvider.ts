export type VideoProvider = "did" | "heygen";

export function getVideoProvider(): VideoProvider {
  return process.env.CAMPANHA_VIDEO_PROVIDER === "heygen" ? "heygen" : "did";
}

export function getProviderDisplayName(): string {
  return getVideoProvider() === "heygen" ? "HeyGen" : "D-ID";
}
