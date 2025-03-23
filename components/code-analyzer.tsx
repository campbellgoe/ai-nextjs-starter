"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertTriangle, ShieldAlert, Wrench } from "lucide-react"
import { CodeBlock } from "@/components/code-block"
import { readStreamableValue } from 'ai/rsc';
import { generateCodeAnalysis } from "@/app/actions/actions"

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
]

type AnalysisResult = {
  bugs?: Array<{
    description: string
    lineNumber?: number
    severity: "low" | "medium" | "high"
  }>
  securityIssues?: Array<{
    description: string
    lineNumber?: number
    severity: "low" | "medium" | "high"
  }>
  improvements?: Array<{
    description: string
    lineNumber?: number
  }>
  fixedCode?: string
}

export function CodeAnalyzer() {
  
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  // const [results, setResults] = useState<AnalysisResult[]>([])
  const [activeTab, setActiveTab] = useState("bugs")
  // const [reports, setReports] = useState(new Map())
  // const [selectedReport, setSelectedReport] = useState('')
  const handleGenerateCodeAnalysis = async (code: string, language: string) => {
    setIsAnalyzing(true);
    const { data } = await generateCodeAnalysis(code, language);

    for await (const partialObject of readStreamableValue(data)) {
      if (partialObject && partialObject.report) {
        setResult(pr => ({...(pr || {}), ...partialObject.report}))
      }
    }
    // setSelectedReport(code+language);
    // setResults(Array.from(reports))
    // setResult(Array.from(reports)?.[0]?.[0])
    setIsAnalyzing(false);
  };
  const handleAnalyze = async () => {
    if (!code.trim()) return
    await handleGenerateCodeAnalysis(code.trim(), language )

  }

  const detectLanguage = (code: string) => {
    if(code.includes("<html") || code.includes("<body") || code.includes("<head")) return "html"
    // Simple language detection based on file extensions or syntax patterns
    if (code.includes("import ") || code.includes("export default")) {
      if (code.includes("<") && code.includes(">")) {
        return code.includes(": ") ? "tsx" : "jsx"
      }
      return code.includes(": ") ? "typescript" : "javascript"
    }

    if (code.includes("fn main") || code.includes("impl ")) return "rust"
    if (code.includes("def ") && code.includes(":")) return "python"
    if (code.includes("package main") && code.includes("func ")) return "go"
    if (code.includes("public static void main")) return "java"

    // Default to JavaScript if we can't detect
    return language || ""
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    if (!language && value.trim()) {
      const detectedLanguage = detectLanguage(value)
      setLanguage(detectedLanguage)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-amber-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Textarea
            placeholder="Paste your code here..."
            className="font-mono h-64 resize-none"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
          />
        </div>
        <div className="space-y-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleAnalyze} disabled={!code.trim() || isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Code"
            )}
          </Button>
        </div>
      </div>

      {result && (<Card className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="bugs" className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Bugs {result?.bugs?.length ? `(${result.bugs.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Security {result?.securityIssues?.length ? `(${result.securityIssues.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="improvements" className="flex items-center">
                <Wrench className="mr-2 h-4 w-4" />
                Improvements {result?.improvements?.length ? `(${result.improvements.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="fixed">Fixed Code</TabsTrigger>
            </TabsList>

            <TabsContent value="bugs" className="space-y-4">
              {isAnalyzing && !result?.bugs?.length && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Analyzing bugs...</span>
                </div>
              )}
              {result?.bugs?.length === 0 && !isAnalyzing && <div className="text-center p-4">No bugs detected!</div>}
              {result?.bugs?.map((bug: any, index: number) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-start">
                    <AlertTriangle className={`h-5 w-5 mr-2 ${getSeverityColor(bug?.severity)}`} />
                    <div>
                      <div className="font-medium">
                        {bug?.lineNumber ? `Line ${bug?.lineNumber}: ` : ""}
                        <span className={getSeverityColor(bug?.severity)}>
                          {bug?.severity?.charAt(0)?.toUpperCase() + bug?.severity?.slice(1)} severity
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{bug?.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              {isAnalyzing && !result?.securityIssues?.length && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Analyzing security issues...</span>
                </div>
              )}
              {result?.securityIssues?.length === 0 && !isAnalyzing && (
                <div className="text-center p-4">No security issues detected!</div>
              )}
              {result?.securityIssues?.map((issue, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-start">
                    <ShieldAlert className={`h-5 w-5 mr-2 ${getSeverityColor(issue?.severity)}`} />
                    <div>
                      <div className="font-medium">
                        {issue?.lineNumber ? `Line ${issue.lineNumber}: ` : ""}
                        <span className={getSeverityColor(issue?.severity)}>
                          {issue?.severity?.charAt(0)?.toUpperCase() + issue?.severity?.slice(1)} severity
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{issue.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="improvements" className="space-y-4">
              {isAnalyzing && !result?.improvements?.length && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Finding improvements...</span>
                </div>
              )}
              {result?.improvements?.length === 0 && !isAnalyzing && (
                <div className="text-center p-4">No improvements suggested!</div>
              )}
              {result?.improvements?.map((improvement, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-start">
                    <Wrench className="h-5 w-5 mr-2" />
                    <div>
                      <div className="font-medium">
                        {improvement.lineNumber ? `Line ${improvement.lineNumber}: ` : ""}
                        Suggestion
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{improvement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="fixed">
              {isAnalyzing && !result?.fixedCode && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Generating fixed code...</span>
                </div>
              )}
              {result?.fixedCode && <CodeBlock code={result.fixedCode} language={language} />}
            </TabsContent>
          </Tabs>
        </Card>)}
    </div>
  )
}

