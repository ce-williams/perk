import type { CardProduct } from "@/lib/types";
export function CardArt({
  product,
  compact = false,
}: {
  product: CardProduct;
  compact?: boolean;
}) {
  return (
    <div
      className={`card-art ${compact ? "compact" : ""}`}
      style={{ background: product.color, color: product.ink }}
      role="img"
      aria-label={`${product.name}, original demo card illustration`}
    >
      <svg className="card-geometry" viewBox="0 0 320 200" aria-hidden="true">
        <path
          d="M155 -80 A180 180 0 1 1 155 280 M185 -80 A180 180 0 1 1 185 280 M215 -80 A180 180 0 1 1 215 280 M245 -80 A180 180 0 1 1 245 280"
          fill="none"
          stroke="currentColor"
          strokeWidth=".5"
          opacity=".22"
        />
        <path
          d="M26 85h26v20H26z M26 95h26 M39 85v20"
          fill="none"
          stroke="currentColor"
          strokeWidth=".8"
          opacity=".65"
        />
      </svg>
      <span className="card-issuer">{product.issuer}</span>
      <strong>{product.shortName}</strong>
      <span className="card-art-foot">
        PERK STUDY <span>DEMO</span>
      </span>
    </div>
  );
}
