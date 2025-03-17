"use client"

import { highlight } from "sugar-high"

interface CodeBlockProps {
  code: string
  language: string
}
function Code({ children, ...props }: any) {
  const codeHTML = highlight(children as string);
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
}
export function CodeBlock({ code, language }: CodeBlockProps) {


  // Map language values to Prism's supported languages
  const getPrismLanguage = (lang: string) => {
    const mapping: Record<string, string> = {
      javascript: "javascript",
      typescript: "typescript",
      jsx: "jsx",
      tsx: "tsx",
      python: "python",
      rust: "rust",
      go: "go",
      java: "java",
      c: "c",
      cpp: "cpp",
      csharp: "csharp",
      php: "php",
      ruby: "ruby",
      swift: "swift",
      kotlin: "kotlin",
      html: "markup",
      css: "css",
      sql: "sql",
    }

    return mapping[lang] || "javascript"
  }

  return (
    <div className="relative rounded-md overflow-hidden">
      <pre className="p-4 overflow-x-auto bg-gray-50 dark:bg-gray-900 text-sm">
        <Code className={`language-${getPrismLanguage(language)}`}>
          {code}
        </Code>
      </pre>
    </div>
  )
}

