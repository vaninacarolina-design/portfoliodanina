import { useEffect } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered, Link as LinkIcon, Image as ImgIcon,
  Undo, Redo, Quote, Code, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from "lucide-react";
import { uploadMedia } from "@/lib/upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Mark customizada para tamanho de fonte (usa style="font-size: …")
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() { return { types: ["textStyle"] as string[] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.fontSize?.replace(/['"]/g, "") || null,
          renderHTML: (attrs: any) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) => chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

const Btn = ({ active, onClick, children, title }: any) => (
  <button type="button" onClick={onClick} title={title}
    className={cn("p-2 rounded-sm hover:bg-secondary transition", active && "bg-foreground text-background hover:bg-foreground")}>
    {children}
  </button>
);

const Sep = () => <div className="w-px bg-border mx-1 self-stretch" />;

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px", "64px"];
const FONT_FAMILIES = [
  { label: "Padrão", value: "" },
  { label: "Display (Fraunces)", value: "'Fraunces', Georgia, serif" },
  { label: "Sans (Inter)", value: "'Inter', system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Monoespaçada", value: "'JetBrains Mono', ui-monospace, monospace" },
];

export const RichEditor = ({ value, onChange, placeholder }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize,
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { rel: "noreferrer", target: "_blank" } }),
      ImageExt,
      Placeholder.configure({ placeholder: placeholder || "Comece a escrever…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose-editorial min-h-[200px] focus:outline-none p-4" },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("URL do link:");
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = async () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      try {
        const url = await uploadMedia(file, "editor");
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } catch (e: any) { toast.error(e.message || "Erro no upload"); }
    };
    input.click();
  };

  const currentFontSize = (editor.getAttributes("textStyle") as any).fontSize || "";
  const currentFontFamily = (editor.getAttributes("textStyle") as any).fontFamily || "";

  return (
    <div className="border border-input rounded-sm bg-background">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-secondary/40 sticky top-0 z-10">
        <select
          value={currentFontFamily}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(v).run();
          }}
          className="text-xs border border-input bg-background px-2 py-1 rounded-sm"
          title="Tipografia"
        >
          {FONT_FAMILIES.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={currentFontSize}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) (editor.chain().focus() as any).unsetFontSize().run();
            else (editor.chain().focus() as any).setFontSize(v).run();
          }}
          className="text-xs border border-input bg-background px-2 py-1 rounded-sm"
          title="Tamanho da fonte"
        >
          <option value="">Tamanho</option>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Sep />
        <Btn title="Parágrafo" active={editor.isActive("paragraph") && !editor.isActive("heading")} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow size={15} /></Btn>
        <Btn title="Título 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={15} /></Btn>
        <Btn title="Título 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={15} /></Btn>
        <Btn title="Título 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={15} /></Btn>
        <Sep />
        <Btn title="Negrito (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></Btn>
        <Btn title="Itálico (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></Btn>
        <Btn title="Sublinhado (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={15} /></Btn>
        <Btn title="Tachado" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={15} /></Btn>
        <Btn title="Código" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={15} /></Btn>
        <Sep />
        <Btn title="Alinhar à esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={15} /></Btn>
        <Btn title="Centralizar" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={15} /></Btn>
        <Btn title="Alinhar à direita" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={15} /></Btn>
        <Btn title="Justificar" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><AlignJustify size={15} /></Btn>
        <Sep />
        <Btn title="Lista com marcadores" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></Btn>
        <Btn title="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></Btn>
        <Btn title="Citação" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={15} /></Btn>
        <Btn title="Linha horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={15} /></Btn>
        <Sep />
        <Btn title="Link" active={editor.isActive("link")} onClick={setLink}><LinkIcon size={15} /></Btn>
        <Btn title="Imagem" onClick={insertImage}><ImgIcon size={15} /></Btn>
        <Sep />
        <Btn title="Desfazer (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}><Undo size={15} /></Btn>
        <Btn title="Refazer (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}><Redo size={15} /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
