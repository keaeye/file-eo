export function fileRouter(fileName: string, mimeType: string | false): string {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (!mimeType) return "misc";

  if (mimeType.startsWith("image/")) return "images";
  if (mimeType === "application/pdf") return "docs";
  if (mimeType.startsWith("text/")) return "notes";

  if (["js", "ts", "py", "cpp", "java"].includes(ext || "")) return "code";

  return "misc";
}
