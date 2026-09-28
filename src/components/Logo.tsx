/**
 * Typographic recreation of the SUPERNOVA wordmark (thin geometric sans, very wide tracking,
 * graphite on light grey) as seen on the Instagram avatar. Replace with the brand's vector file
 * when available — only a 150px raster exists publicly.
 */
export function Logo({ variant = "wordmark", className = "" }: { variant?: "wordmark" | "badge"; className?: string }) {
  if (variant === "badge") {
    return (
      <span className={`logo-badge ${className}`} aria-label="SUPERNOVA">
        <span aria-hidden="true">SUPERNOVA</span>
      </span>
    );
  }
  return (
    <span className={`logo ${className}`} aria-label="SUPERNOVA">
      <span aria-hidden="true">SUPERNOVA</span>
    </span>
  );
}
