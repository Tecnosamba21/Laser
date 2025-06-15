import React from "react";
import { cn } from "@/lib/utils";
import CodeEditor from "@uiw/react-textarea-code-editor";

const CodeBlock = React.forwardRef<HTMLTextAreaElement, {
  language?: string;
  darkMode?: boolean;
  readonly: boolean
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, darkMode, readonly, ...props }, ref) => (
    <div className={cn(
      "relative flex min-h-[80px] w-full rounded border-input px-3 py-2 text-sm",
      className
    )} style={{ backgroundColor: darkMode ? "#222225" : "#fff" }}>
      <CodeEditor
        padding={0}
        data-color-mode={darkMode ? "dark" : "light"}
        style={{
          backgroundColor: darkMode ? "#222225" : "#fff",
          width: "100%",
          fontFamily: 'Cascadia Code',
          fontSize: '1.2ch',
          overflow: 'auto',
          maxHeight: '200px',
        }}
        readOnly={readonly}
        ref={ref}
        {...props}
      />
    </div>
  )
);
CodeBlock.displayName = "CodeBlock";
export { CodeBlock };
