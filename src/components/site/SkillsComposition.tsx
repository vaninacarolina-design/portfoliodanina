import type { SkillsBlock } from "@/lib/skills-composition";
import { EditorialImg } from "@/components/site/EditorialImage";
import { RichText } from "@/components/site/RichText";
import { Reveal } from "@/components/site/Reveal";

const widths = { estreita: "max-w-xl", media: "max-w-4xl", total: "max-w-none" };
const positions = { left: "mr-auto", center: "mx-auto", right: "ml-auto" };
const vertical = { start: "items-start", center: "items-center", end: "items-end" };

export const SkillsComposition = ({ blocks }: { blocks: SkillsBlock[] }) => (
  <div className="space-y-12 md:space-y-20">
    {blocks.map(b => {
      const hasText = b.html.replace(/<[^>]*>/g, "").trim().length > 0;
      const hasImage = !!b.img?.url;
      if (!hasText && !hasImage) return null;
      return (
        <Reveal key={b.id}>
          <div className={`w-full ${widths[b.largura]} ${positions[b.posicao]}`}>
            {b.tipo === "titulo" && hasText && <RichText as="h2" html={b.html} className="font-display text-4xl md:text-6xl leading-tight break-words" />}
            {b.tipo === "texto" && hasText && <RichText html={b.html} className="prose-editorial break-words" />}
            {b.tipo === "imagem" && b.img && <EditorialImg item={b.img} alt="Vanina trabalhando" natural={b.img.ratio === "auto"} />}
            {b.tipo === "par" && (
              <div className={`grid gap-8 md:gap-12 ${hasImage && hasText ? "md:grid-cols-2" : "grid-cols-1"} ${vertical[b.vertical]}`}>
                {b.img && hasImage && <div className={b.lado === "right" ? "md:order-2" : ""}><EditorialImg item={b.img} alt="Vanina trabalhando" natural={b.img.ratio === "auto"} /></div>}
                {hasText && <RichText html={b.html} className="prose-editorial min-w-0 break-words" />}
              </div>
            )}
          </div>
        </Reveal>
      );
    })}
  </div>
);