import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, RemoveFormatting, Code } from "lucide-react";

export default function RichTextEditor({ value, onChange, placeholder = "Write description here..." }) {
  const editorRef = useRef(null);
  const isInputActive = useRef(false);

  // Initialize and update the innerHTML only when value changes externally (not during active typing)
  useEffect(() => {
    if (editorRef.current && !isInputActive.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInputActive.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleBlur = () => {
    isInputActive.current = false;
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all flex flex-col w-full">
      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 bg-slate-50 border-b border-slate-200 p-1.5 shrink-0 select-none">
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className="p-1 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="Bold"
        >
          <Bold size={13} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className="p-1 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="Italic"
        >
          <Italic size={13} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className="p-1 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="Underline"
        >
          <Underline size={13} />
        </button>

        <div className="w-px h-3 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          className="p-1 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="Bulleted List"
        >
          <List size={13} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          className="p-1 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="Numbered List"
        >
          <ListOrdered size={13} />
        </button>

        <div className="w-px h-3 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<h1>")}
          className="px-1.5 py-0.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors font-bold text-[10px]"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<h2>")}
          className="px-1.5 py-0.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors font-bold text-[10px]"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<pre>")}
          className="p-1 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="Code Block"
        >
          <Code size={13} />
        </button>

        <div className="w-px h-3 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("removeFormat")}
          className="p-1 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="Clear Formatting"
        >
          <RemoveFormatting size={13} />
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleBlur}
        className="p-3 min-h-[140px] max-h-[300px] overflow-y-auto outline-none text-slate-800 text-xs leading-relaxed"
        placeholder={placeholder}
      />
    </div>
  );
}
