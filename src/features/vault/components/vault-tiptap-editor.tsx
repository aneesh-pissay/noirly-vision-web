"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";

const EMPTY_DOC = JSON.stringify({
  type: "doc",
  content: [],
});

type VaultTiptapEditorProps = {
  content?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  className?: string;
};

function parseEditorContent(content?: string) {
  if (!content) return undefined;

  try {
    return JSON.parse(content);
  } catch {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: content }],
        },
      ],
    };
  }
}

export function VaultTiptapEditor({
  content,
  onChange,
  editable = true,
  className,
}: VaultTiptapEditorProps) {
  const [, forceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [StarterKit],
    content: parseEditorContent(content),
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(JSON.stringify(currentEditor.getJSON()));
      forceUpdate((value) => value + 1);
    },
    onSelectionUpdate: () => {
      forceUpdate((value) => value + 1);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[360px] px-4 py-4 focus:outline-none text-sm leading-relaxed [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
        "data-placeholder": "Capture your thoughts...",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.focus("end");
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const nextContent = parseEditorContent(content);
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(nextContent ?? JSON.parse(EMPTY_DOC));

    if (current !== incoming) {
      editor.commands.setContent(nextContent ?? JSON.parse(EMPTY_DOC), {
        emitUpdate: false,
      });
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  if (!editor) {
    return (
      <div className="min-h-[360px] rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-surface", className)}>
      {editable && (
        <div className="flex flex-wrap gap-1 border-b border-border px-2 py-2">
          <EditorButton
            active={editor.isActive("bold")}
            label="Bold"
            onMouseDown={(event) => {
              event.preventDefault();
              editor.chain().focus().toggleBold().run();
              forceUpdate((value) => value + 1);
            }}
          />
          <EditorButton
            active={editor.isActive("italic")}
            label="Italic"
            onMouseDown={(event) => {
              event.preventDefault();
              editor.chain().focus().toggleItalic().run();
              forceUpdate((value) => value + 1);
            }}
          />
          <EditorButton
            active={editor.isActive("heading", { level: 2 })}
            label="H2"
            onMouseDown={(event) => {
              event.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              forceUpdate((value) => value + 1);
            }}
          />
          <EditorButton
            active={editor.isActive("bulletList")}
            label="List"
            onMouseDown={(event) => {
              event.preventDefault();
              editor.chain().focus().toggleBulletList().run();
              forceUpdate((value) => value + 1);
            }}
          />
          <EditorButton
            active={editor.isActive("blockquote")}
            label="Quote"
            onMouseDown={(event) => {
              event.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
              forceUpdate((value) => value + 1);
            }}
          />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

function EditorButton({
  active,
  label,
  onMouseDown,
}: {
  active: boolean;
  label: string;
  onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      className={cn(
        "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

export function emptyVaultContent() {
  return EMPTY_DOC;
}
