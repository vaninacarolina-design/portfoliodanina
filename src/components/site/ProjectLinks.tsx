import { ArrowUpRight } from "lucide-react";

export type ProjectLink = { label: string; url: string };

interface Props {
  links?: any;
  className?: string;
}

export const ProjectLinks = ({ links, className = "" }: Props) => {
  const list: ProjectLink[] = Array.isArray(links)
    ? links.filter((l: any) => l && typeof l.url === "string" && l.url.trim())
    : [];
  if (list.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {list.map((l, i) => (
        <a
          key={i}
          href={l.url}
          target="_blank"
          rel="noreferrer noopener"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 hover:bg-secondary text-foreground/80 hover:text-foreground transition-colors px-5 py-2.5 text-sm tracking-wide"
        >
          <span>{l.label || "Link"}</span>
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      ))}
    </div>
  );
};
