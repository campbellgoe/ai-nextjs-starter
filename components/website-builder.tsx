"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateWebsite } from "@/app/actions"
import { WebsitePreview } from "@/components/website-preview"
import { CodeEditor } from "@/components/code-editor"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type FrameworkType = "html" | "react" | "nextjs"

export function WebsiteBuilder() {
  const [prompt, setPrompt] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [framework, setFramework] = useState<FrameworkType>("html")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const code = await generateWebsite(prompt, framework)
      setGeneratedCode(code)
      setActiveTab("preview")
    } catch (error) {
      console.error("Failed to generate website:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Framework</label>
            <Select value={framework} onValueChange={(value) => setFramework(value as FrameworkType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML & Tailwind</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Describe the website you want to build (e.g., 'A modern portfolio website for a photographer with a dark theme, gallery section, and contact form')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] mb-4"
          />
          <Button onClick={handleGenerate} className="w-full" disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Website"
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedCode && (
        <Card className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="preview" className="flex-1">
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex-1">
                Code
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="p-0">
              <WebsitePreview code={generatedCode} framework={framework} />
            </TabsContent>
            <TabsContent value="code" className="p-0">
              <CodeEditor code={generatedCode} onChange={setGeneratedCode} framework={framework} />
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  )
}

