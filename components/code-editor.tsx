"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Copy, Check, Download } from "lucide-react"
import type { FrameworkType } from "./website-builder"

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  framework: FrameworkType
}

export function CodeEditor({ code, onChange, framework }: CodeEditorProps) {
  const [value, setValue] = useState(code)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setValue(code)
  }, [code])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange(newValue)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([value], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")

    let filename = ""
    switch (framework) {
      case "html":
        filename = "index.html"
        break
      case "react":
        filename = "App.jsx"
        break
      case "nextjs":
        filename = "page.tsx"
        break
    }

    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-0">
      <CardContent className="p-0">
        <Textarea
          value={value}
          onChange={handleChange}
          className="font-mono text-sm h-[600px] resize-none rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </CardContent>
      <CardFooter className="flex justify-between p-2 border-t">
        <div className="text-sm text-muted-foreground">
          {framework === "html" ? "HTML" : framework === "react" ? "React" : "Next.js"} Code
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

