import { useEffect } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, List, ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Mostra também controles de tipografia/tamanho (default true) */
  showTypography?: boolean;
}

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
  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={title}
    className={cn("p-1.5 rounded-sm hover:bg-secondary transition", active && "bg-foreground text-background hover:bg-foreground")}>
    {children}
  </button>
);
const Sep = () => <div className="w-px bg-border mx-0.5 self-stretch" />;

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "40px", "56px", "72px"];
const FONT_FAMILIES = [
  { label: "Padrão", value: "" },
  { label: "Display", value: "'Fraunces', Georgia, serif" },
  { label: "Sans", value: "'Inter', system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "'JetBrains Mono', ui-monospace, monospace" },
];

export const RichEditorMini = ({ value, onChange, placeholder, showTypography = true }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, horizontalRule: false }),
      Underline,
      TextAlign.configure({ types: ["paragraph"] }),
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize,
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { rel: "noreferrer", target: "_blank" } }),
      Placeholder.configure({ placeholder: placeholder || "" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose-inline focus:outline-none px-3 py-2 min-h-[42px]" },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("URL:");
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const currentFontSize = (editor.getAttributes("textStyle") as any).fontSize || "";
  const currentFontFamily = (editor.getAttributes("textStyle") as any).fontFamily || "";

  return (
    <div className="border border-input rounded-sm bg-background">
      <div className="flex flex-wrap items-center gap-0.5 p-1 border-b border-border bg-secondary/40">
        {showTypography && (
          <>
            <select value={currentFontFamily}
              onChange={(e) => { const v = e.target.value; v ? editor.chain().focus().setFontFamily(v).run() : editor.chain().focus().unsetFontFamily().run(); }}
              className="text-xs border border-input bg-background px-1.5 py-1 rounded-sm" title="Tipografia">
              {FONT_FAMILIES.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
            </select>
            <select value={currentFontSize}
              onChange={(e) => { const v = e.target.value; v ? (editor.chain().focus() as any).setFontSize(v).run() : (editor.chain().focus() as any).unsetFontSize().run(); }}
              className="text-xs border border-input bg-background px-1.5 py-1 rounded-sm" title="Tamanho">
              <option value="">Tam.</option>
              {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Sep />
          </>
        )}
        <Btn title="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={13} /></Btn>
        <Btn title="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={13} /></Btn>
        <Btn title="Sublinhado" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={13} /></Btn>
        <Sep />
        <Btn title="Esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={13} /></Btn>
        <Btn title="Centro" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={13} /></Btn>
        <Btn title="Direita" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={13} /></Btn>
        <Sep />
        <Btn title="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={13} /></Btn>
        <Btn title="Numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={13} /></Btn>
        <Sep />
        <Btn title="Link" active={editor.isActive("link")} onClick={setLink}><LinkIcon size={13} /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
