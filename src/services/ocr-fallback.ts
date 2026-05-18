export async function getGoogleOcrFallbackText(imageBase64: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [{
            image: { content: imageBase64 },
            features: [{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }],
          }],
        }),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.responses?.[0]?.fullTextAnnotation?.text as string) ?? null;
  } catch {
    return null;
  }
}
