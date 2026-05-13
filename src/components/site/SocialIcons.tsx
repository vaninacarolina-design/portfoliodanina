import { Instagram, Linkedin, Youtube, Facebook, Globe, Mail, Music2, ArrowUpRight } from "lucide-react";

export type SocialItem = { plataforma: string; url: string };

const ICONS: Record<string, any> = {
  instagram: Instagram,
  linkedin: Linkedin,
  behance: Globe,
  youtube: Youtube,
  facebook: Facebook,
  tiktok: Music2,
  spotify: Music2,
  email: Mail,
  site: Globe,
  outro: ArrowUpRight,
};

const LABELS: Record<string, string> = {
  instagram: "Instagram", linkedin: "LinkedIn", behance: "Behance",
  youtube: "YouTube", facebook: "Facebook", tiktok: "TikTok",
  spotify: "Spotify", email: "Email", site: "Website", outro: "Link",
};

interface Props {
  itens: SocialItem[];
  align?: "left" | "center" | "right";
}

export const SocialIcons = ({ itens, align = "center" }: Props) => {
  const list = (itens || []).filter(i => i?.url?.trim());
  if (list.length === 0) return null;
  const justify = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  return (
    <div className={`flex flex-wrap gap-4 ${justify}`}>
      {list.map((it, i) => {
        const key = (it.plataforma || "outro").toLowerCase();
        const Icon = ICONS[key] || ICONS.outro;
        const href = key === "email" ? `mailto:${it.url}` : it.url;
        return (
          <a
            key={i}
            href={href}
            target={key === "email" ? undefined : "_blank"}
            rel="noreferrer noopener"
            aria-label={LABELS[key] || it.plataforma}
            className="group inline-flex items-center justify-center w-14 h-14 rounded-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Icon size={20} strokeWidth={1.6} />
          </a>
        );
      })}
    </div>
  );
};
