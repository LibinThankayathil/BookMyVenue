const DEFAULT_API_URL = "http://localhost:8000";

export function getApiBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;

  if (typeof window === "undefined") {
    try {
      const fs = eval("require")("fs");
      if (fs.existsSync("/.dockerenv")) {
        url = url.replace("://localhost:8000", "://api-gateway:8000");
      }
    } catch (e) {
    }
  }

  url = url.replace(/\/$/, "");
  if (!url.endsWith("/api")) {
    url += "/api";
  }
  return url;
}
