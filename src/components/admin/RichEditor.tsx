import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link as LinkIcon, Image as ImgIcon, Undo, Redo, Quote } from "lucide-react";
import { uploadMedia } from "@/lib/upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const Btn = ({ active, onClick, children, title }: any) => (
  <button type="button" onClick={onClick} title={title}
    className={cn("p-2 rounded-sm hover:bg-secondary transition", active && "bg-foreground text-background hover:bg-foreground")}>
    {children}
  </button>
);

export const RichEditor = ({ value, onChange, placeholder }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noreferrer", target: "_blank" } }),
      Image,
      Placeholder.configure({ placeholder: placeholder || "Comece a escrever…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose-editorial min-h-[300px] focus:outline-none p-4" },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", false);
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

  return (
    <div className="border border-input rounded-sm">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-secondary/40">
        <Btn title="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></Btn>
        <Btn title="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></Btn>
        <Btn title="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={15} /></Btn>
        <Btn title="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={15} /></Btn>
        <Btn title="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></Btn>
        <Btn title="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></Btn>
        <Btn title="Citação" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={15} /></Btn>
        <Btn title="Link" active={editor.isActive("link")} onClick={setLink}><LinkIcon size={15} /></Btn>
        <Btn title="Imagem" onClick={insertImage}><ImgIcon size={15} /></Btn>
        <div className="w-px bg-border mx-1" />
        <Btn title="Desfazer" onClick={() => editor.chain().focus().undo().run()}><Undo size={15} /></Btn>
        <Btn title="Refazer" onClick={() => editor.chain().focus().redo().run()}><Redo size={15} /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
