import type { ImgItem } from "@/components/admin/EditorialImage";

export type SkillsBlock = {
  id: string;
  tipo: "titulo" | "texto" | "imagem" | "par";
  html: string;
  img: ImgItem | null;
  largura: "estreita" | "media" | "total";
  posicao: "left" | "center" | "right";
  lado: "left" | "right";
  vertical: "start" | "center" | "end";
};

export type SkillsHeader = {
  eyebrow?: string;
  titulo?: string;
  subtitulo?: string;
  blocos?: SkillsBlock[];
};

export const newSkillsBlock = (tipo: SkillsBlock["tipo"]): SkillsBlock => ({
  id: crypto.randomUUID(), tipo, html: "", img: null,
  largura: "total", posicao: "left", lado: "left", vertical: "center",
});