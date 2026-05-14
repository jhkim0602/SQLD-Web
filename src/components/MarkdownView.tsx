import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";

type Props = {
  html?: string;
  source?: string;
  className?: string;
};

export function MarkdownView({ html, source, className = "" }: Props) {
  const cls = `rendered-md ${className}`;

  if (html) {
    return <div className={cls} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  if (source) {
    return (
      <div className={cls}>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkCjkFriendly]}>
          {source}
        </ReactMarkdown>
      </div>
    );
  }

  return null;
}
