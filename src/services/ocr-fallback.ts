export async function getGoogleOcrFallbackText(imageBase64: string) {
  void imageBase64;
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return null;
  }

  return null;
}
