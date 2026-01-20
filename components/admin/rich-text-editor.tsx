"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import { 
  Bold, Italic, List, 
  Heading2, Link2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ 
        openOnClick: false, 
        HTMLAttributes: { class: 'text-blue-600 underline' } 
      }),
    ],
    content: value,
    // Fixes the SSR/Hydration error in Next.js
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none max-w-none min-h-[150px] p-3 text-slate-700",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content when value changes externally (e.g., when switching products in Edit mode)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
      {/* Mini Toolbar */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-50 border-b">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          active={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          active={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        
        <div className="w-px h-4 bg-slate-300 mx-1 self-center" />
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          active={editor.isActive("bulletList")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => {
            const url = window.prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }} 
          active={editor.isActive("link")}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({ 
  onClick, 
  active, 
  children 
}: { 
  onClick: () => void; 
  active?: boolean; 
  children: React.ReactNode 
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 ${
        active 
          ? "bg-orange-100 text-orange-600 hover:bg-orange-200" 
          : "text-slate-600"
      }`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}