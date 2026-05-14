import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";

type Props = {
  source: string;
  className?: string;
};

export function MarkdownView({ source, className = "" }: Props) {
  return (
    <div className={`prose-ko text-[15px] leading-[1.75] text-zinc-800 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCjkFriendly]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-8 text-[1.875rem] font-bold leading-tight tracking-tight text-zinc-900 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-8 text-[1.5rem] font-bold leading-tight tracking-tight text-zinc-900 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 text-[1.25rem] font-bold tracking-tight text-zinc-900">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-2 mt-5 text-[1.05rem] font-semibold text-zinc-900">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-[1.75]">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-[1.7]">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-700">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-zinc-900">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="min-w-full border-collapse border border-zinc-200 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-zinc-200 px-3 py-2 align-top">{children}</td>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) return <code className={className}>{children}</code>;
            return (
              <code className="rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 font-mono text-[0.85em]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre>{children}</pre>,
          hr: () => <hr className="my-6 border-zinc-200" />,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
