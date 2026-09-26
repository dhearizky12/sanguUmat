import { useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import Button from "../Button";
import MonoLabel from "../MonoLabel";
import { Input } from "../Field";
import { ARTICLE_TYPE } from "./articleType";

// The rich text editor for an article body. Its formatting is exactly what the server keeps
// (backend/Articles/ArticleHtml.cs): h2/h3, bold, italic, underline, strikethrough, quotes,
// lists, rules and links — keep the two in step. `onChange` receives the body's HTML.

const PLACEHOLDER =
  "[&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-ink-faint [&_.is-editor-empty:first-child]:before:pointer-events-none";

// "example.com" → "https://example.com"; anything but http(s) or mailto is refused.
function normaliseLink(raw) {
  const value = raw.trim();
  if (!value) return null;
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  return `https://${value}`;
}

function ToolButton({ label, active = false, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the selection in the editor while clicking the toolbar.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-9 h-9 px-2 flex items-center justify-center font-mono text-[13px] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-default ${
        active ? "bg-forest text-cream-text" : "text-ink-muted hover:bg-cream-hover hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="w-px self-stretch my-1.5 bg-stone-line" />;
}

export default function Editor({ value, onChange, placeholder = "Tulis isi artikel di sini…", labelledBy }) {
  const [linkDraft, setLinkDraft] = useState(null);
  const [linkError, setLinkError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto"],
          HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" },
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `${ARTICLE_TYPE} ${PLACEHOLDER} min-h-[420px] px-[clamp(16px,3vw,28px)] py-6 outline-none`,
        ...(labelledBy ? { "aria-labelledby": labelledBy } : {}),
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            quote: e.isActive("blockquote"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            link: e.isActive("link"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  if (!editor || !state) return <div className="min-h-[480px] border border-stone-border bg-paper" />;

  const run = (command) => command(editor.chain().focus()).run();

  const openLink = () => {
    setLinkError("");
    setLinkDraft(editor.getAttributes("link").href ?? "");
  };
  const applyLink = (e) => {
    e?.preventDefault();
    const href = normaliseLink(linkDraft ?? "");
    if (!href) {
      setLinkError("Alamat tautan harus diawali http://, https:// atau berupa email.");
      return;
    }
    run((c) => c.extendMarkRange("link").setLink({ href }));
    setLinkDraft(null);
  };
  const removeLink = () => {
    run((c) => c.extendMarkRange("link").unsetLink());
    setLinkDraft(null);
  };

  return (
    <div className="border border-stone-border bg-paper focus-within:border-forest transition-colors">
      <div
        role="toolbar"
        aria-label="Format teks"
        className="sticky top-[69px] z-10 flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-stone-line bg-paper"
      >
        <ToolButton label="Judul" active={state.h2} onClick={() => run((c) => c.toggleHeading({ level: 2 }))}>
          H2
        </ToolButton>
        <ToolButton label="Subjudul" active={state.h3} onClick={() => run((c) => c.toggleHeading({ level: 3 }))}>
          H3
        </ToolButton>
        <Divider />
        <ToolButton label="Tebal" active={state.bold} onClick={() => run((c) => c.toggleBold())}>
          <span className="font-bold">B</span>
        </ToolButton>
        <ToolButton label="Miring" active={state.italic} onClick={() => run((c) => c.toggleItalic())}>
          <span className="italic">I</span>
        </ToolButton>
        <ToolButton label="Garis bawah" active={state.underline} onClick={() => run((c) => c.toggleUnderline())}>
          <span className="underline">U</span>
        </ToolButton>
        <ToolButton label="Coret" active={state.strike} onClick={() => run((c) => c.toggleStrike())}>
          <span className="line-through">S</span>
        </ToolButton>
        <Divider />
        <ToolButton label="Kutipan" active={state.quote} onClick={() => run((c) => c.toggleBlockquote())}>
          <span className="font-serif text-lg leading-none">&ldquo;</span>
        </ToolButton>
        <ToolButton label="Daftar berpoin" active={state.bullet} onClick={() => run((c) => c.toggleBulletList())}>
          &bull;&thinsp;&mdash;
        </ToolButton>
        <ToolButton label="Daftar bernomor" active={state.ordered} onClick={() => run((c) => c.toggleOrderedList())}>
          1.&thinsp;&mdash;
        </ToolButton>
        <ToolButton label="Garis pemisah" onClick={() => run((c) => c.setHorizontalRule())}>
          &#x2015;
        </ToolButton>
        <ToolButton label="Tautan" active={state.link || linkDraft !== null} onClick={openLink}>
          Tautan
        </ToolButton>
        <Divider />
        <ToolButton label="Urungkan" disabled={!state.canUndo} onClick={() => run((c) => c.undo())}>
          &#x21B6;
        </ToolButton>
        <ToolButton label="Ulangi" disabled={!state.canRedo} onClick={() => run((c) => c.redo())}>
          &#x21B7;
        </ToolButton>
      </div>

      {linkDraft !== null && (
        <div className="flex flex-col gap-2 px-3 py-3 border-b border-stone-line bg-cream-warm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
            <Input
              autoFocus
              aria-label="Alamat tautan"
              placeholder="https://contoh.com"
              value={linkDraft}
              invalid={!!linkError}
              onChange={(e) => {
                setLinkDraft(e.target.value);
                setLinkError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyLink(e);
                if (e.key === "Escape") setLinkDraft(null);
              }}
              className="flex-[1_1_240px] w-auto min-w-0"
            />
            <Button onClick={applyLink} className="px-4 py-3">
              Terapkan
            </Button>
            {state.link && (
              <Button variant="danger" onClick={removeLink}>
                Hapus tautan
              </Button>
            )}
            <Button variant="link" onClick={() => setLinkDraft(null)}>
              Batal
            </Button>
          </div>
          {linkError && (
            <MonoLabel size="xs" className="text-rust normal-case tracking-[0.04em]">
              {linkError}
            </MonoLabel>
          )}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
