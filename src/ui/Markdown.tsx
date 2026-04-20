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
            const { className, children, inline } = props as {
              className?: string;
              children?: React.ReactNode;
              inline?: boolean;
            };
            const text = String(children ?? "").replace(/\n$/, "");
            if (inline) {
              return <code className={className}>{children}</code>;
            }
            const match = /language-([\w-]+)/.exec(className ?? "");
            return <ShikiCode code={text} language={match?.[1]} />;
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
