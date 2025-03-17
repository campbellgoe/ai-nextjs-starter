"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { FrameworkType } from "./website-builder"
import { getHtmlContent } from "@/utils/getCompleteCodeFromGeneratedCode"

interface WebsitePreviewProps {
  code: string
  framework: FrameworkType
}

export function WebsitePreview({ code, framework }: WebsitePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  // const [actualCode, setActualCode] = useState('')

  useEffect(() => {
    if (!iframeRef.current) return

    try {
      setError(null)
      const iframe = iframeRef.current

      // Create a secure blob URL instead of using document.write
      const actualCode = getHtmlContent("html", code)
      // setActualCode(actualCode)
      const blob = new Blob([actualCode], { type: "text/html" })
      const url = URL.createObjectURL(blob)

      iframe.src = url

      // Clean up the blob URL when the component unmounts or when the code changes
      return () => URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error rendering preview:", err)
      setError("Failed to render preview. Check your code for errors.")
    }
  }, [code, framework])

  return (
    <Card className="overflow-hidden">
      <div className="relative w-full bg-gray-100 border-b">
        <div className="flex items-center px-4 py-2 space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="mx-auto text-sm text-gray-500">
            {framework === "html" ? "HTML" : framework === "react" ? "React" : "Next.js"} Preview
          </div>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <iframe
        ref={iframeRef}
        className="w-full h-[600px] border-0"
        title="Website Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </Card>
  )
}

