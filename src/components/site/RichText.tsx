import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface Props {
  html?: string | null;
  /** "block" = parágrafos com margens; "inline" = sem margens (títulos, frases) */
  variant?: "block" | "inline";
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/** Renderiza HTML rico vindo do CMS, sanitizado. */
export const RichText = ({ html, variant = "inline", className, as: Tag = "div" }: Props) => {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  const C: any = Tag;
  return (
    <C
      className={cn(variant === "block" ? "prose-editorial" : "prose-inline", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};
