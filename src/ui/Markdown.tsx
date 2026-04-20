import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ShikiCode } from "./ShikiCode";

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className, children } = props as {
              className?: string;
              children?: React.ReactNode;
            };
            const raw = String(children ?? "");
            const match = /language-([\w-]+)/.exec(className ?? "");
            // react-markdown v9 dropped the `inline` prop. Fenced/indented blocks
            // get a trailing newline from the parser, and fenced blocks carry a
            // `language-*` class — anything without either is inline code.
            const isInline = !match && !raw.includes("\n");
            if (isInline) {
              return <code className={className}>{children}</code>;
            }
            return <ShikiCode code={raw.replace(/\n$/, "")} language={match?.[1]} />;
          },
          pre(props) {
            // Defer the wrapper to ShikiCode (its output already has a <pre>).
            return <>{props.children}</>;
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
