
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";

import "prismjs/themes/prism-tomorrow.css";

// Register languages commonly returned in technical AI answers.
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-python";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-7 text-2xl font-semibold leading-tight tracking-tight first:mt-0">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 text-xl font-semibold leading-snug tracking-tight">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-base font-semibold">
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <p className="mb-4 text-sm leading-7 last:mb-0">
      {children}
    </p>
  ),

  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-sm leading-7 marker:text-[#C85A32]">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6 text-sm leading-7 marker:font-medium marker:text-[#C85A32]">
      {children}
    </ol>
  ),

  li: ({ children }) => <li className="pl-1">{children}</li>,

  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-[#C85A32] pl-4 text-sm italic leading-7 text-[#706B64]">
      {children}
    </blockquote>
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[#A94321] underline decoration-[#C85A32]/40 underline-offset-4 hover:decoration-[#C85A32]"
    >
      {children}
    </a>
  ),

  hr: () => <hr className="my-6 border-[#D6CEC3]" />,

  strong: ({ children }) => (
    <strong className="font-semibold text-[#171614]">
      {children}
    </strong>
  ),

  table: ({ children }) => (
    <div className="my-5 max-w-full overflow-x-auto border border-[#D6CEC3]">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }) => (
    <thead className="bg-[#E9E2D8]">{children}</thead>
  ),

  th: ({ children }) => (
    <th className="border-b border-r border-[#D6CEC3] px-3 py-2.5 font-semibold last:border-r-0">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="border-b border-r border-[#D6CEC3] px-3 py-2.5 align-top last:border-r-0">
      {children}
    </td>
  ),

  pre: ({ children }) => (
    <div className="my-5 overflow-hidden border border-[#373532] bg-[#171614]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#B8AFA4]">
          Code
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-[12px] leading-6">
        {children}
      </pre>
    </div>
  ),

  code: ({ className, children }) => {
    const code = String(children).replace(/\n$/, "");
    const language = /language-([\w-]+)/.exec(className ?? "")?.[1];

    // Inline code, e.g. `@RestController`
    if (!className && !code.includes("\n")) {
      return (
        <code className="rounded-sm border border-[#D6CEC3] bg-[#E9E2D8] px-1.5 py-0.5 font-mono text-[0.85em] text-[#8B3518]">
          {children}
        </code>
      );
    }

    const grammar = language
      ? Prism.languages[language]
      : undefined;

    const highlighted = grammar
      ? Prism.highlight(code, grammar, language!)
      : Prism.util.encode(code);

    return (
      <code
        className={`font-mono text-[12px] leading-6 ${className ?? ""}`}
        dangerouslySetInnerHTML={{ __html: String(highlighted) }}
      />
    );
  },
};

export default function AssistantMarkdown({
  content,
}: {
  content: string;
}) {
  return (
    <div className="min-w-0 break-words text-[#171614] [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
