import { CodeAnalyzer } from "@/components/code-analyzer"
export const maxDuration = 45;
export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Code Analyzer</h1>
      <p className="text-lg mb-8">
        Paste your code below to get instant feedback on bugs, security issues, and potential improvements.
      </p>
      <CodeAnalyzer />
    </main>
  )
}

