import { normalizeItem, type ImgItem } from "@/components/admin/EditorialImage";
import { cn } from "@/lib/utils";

const ratioStyle = (r?: string): React.CSSProperties | undefined => {
  if (!r || r === "auto") return undefined;
  const [a, b] = r.split(":").map(Number);
  return { aspectRatio: `${a} / ${b}` };
};

export const SIZE_TO_COLS: Record<string, string> = {
  s: "md:col-span-4",
  m: "md:col-span-6",
  l: "md:col-span-8",
  xl: "md:col-span-12",
};

interface Props {
  item: ImgItem | string;
  alt?: string;
  className?: string;
  /** Se true ignora aspect-ratio e renderiza no tamanho natural. */
  natural?: boolean;
  onClick?: () => void;
}

export const EditorialImg = ({ item, alt = "", className, natural, onClick }: Props) => {
  const it = normalizeItem(item);
  if (!it.url) return null;
  const useRatio = !natural && it.ratio && it.ratio !== "auto";

  return (
    <div
      onClick={onClick}
      className={cn("relative overflow-hidden bg-secondary/40", onClick && "cursor-pointer", className)}
      style={useRatio ? ratioStyle(it.ratio) : undefined}
    >
      <img
        src={it.url}
        alt={alt}
        loading="lazy"
        className={cn(useRatio || it.fit === "cover" ? "w-full h-full" : "w-full h-auto")}
        style={{
          objectFit: it.fit ?? "cover",
          objectPosition: `${it.posX ?? 50}% ${it.posY ?? 50}%`,
        }}
      />
    </div>
  );
};

interface GridProps {
  items: (ImgItem | string)[];
  alt?: string;
  className?: string;
}

/** Grid editorial 12-col com tamanhos por item (s/m/l/xl). */
export const EditorialGrid = ({ items, alt = "", className }: GridProps) => {
  const list = (items || []).map(normalizeItem).filter(i => i.url);
  if (list.length === 0) return null;
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10", className)}>
      {list.map((it, i) => (
        <EditorialImg key={i} item={it} alt={`${alt} ${i + 1}`} className={SIZE_TO_COLS[it.size ?? "m"]} />
      ))}
    </div>
  );
};
