"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { FrameworkType } from "./website-builder"

interface WebsitePreviewProps {
  code: string
  framework: FrameworkType
}

export function WebsitePreview({ code, framework }: WebsitePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!iframeRef.current) return

    try {
      setError(null)
      const iframe = iframeRef.current

      // Create a secure blob URL instead of using document.write
      const getHtmlContent = () => {
        if (framework === "html") {
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Website Preview</title>
                <script src="https://cdn.tailwindcss.com"></script>
              </head>
              <body>
                ${code}
              </body>
            </html>
          `
        } else if (framework === "react") {
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width-device-width, initial-scale=1">
                <title>React Preview</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              </head>
              <body>
                <div id="root"></div>
                <script type="text/babel">
                  ${code}
                  
                  // Add rendering if not included in the code
                  if (typeof App !== 'undefined' && !code.includes('ReactDOM.render') && !code.includes('createRoot')) {
                    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
                  }
                </script>
              </body>
            </html>
          `
        } else if (framework === "nextjs") {
          // For Next.js, we'll use a simplified React preview with a note
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Next.js Preview</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              </head>
              <body>
                <div id="root"></div>
                <div style="position: absolute; top: 10px; left: 10px; background: #f0f0f0; padding: 10px; border-radius: 4px; font-size: 12px; z-index: 1000;">
                  ⚠️ Next.js preview is simplified (client-side only)
                </div>
                <script type="text/babel">
                  // Mock Next.js components and hooks
                  const Link = ({ href, children, ...props }) => (
                    <a href={href} {...props}>{children}</a>
                  );
                  
                  const Image = ({ src, alt, width, height, ...props }) => (
                    <img 
                      src={src || '/placeholder.svg?height=300&width=300'} 
                      alt={alt || ''} 
                      width={width} 
                      height={height}
                      {...props}
                    />
                  );
                  
                  const useRouter = () => ({
                    push: (path) => console.log('Navigate to:', path),
                    pathname: '/current-path'
                  });
                  
                  ${code}
                  
                  // Add rendering if not included in the code
                  if (typeof Page !== 'undefined' || typeof Home !== 'undefined' || typeof App !== 'undefined') {
                    const ComponentToRender = Page || Home || App;
                    ReactDOM.createRoot(document.getElementById('root')).render(<ComponentToRender />);
                  }
                </script>
              </body>
            </html>
          `
        }

        return "<html><body>Unsupported framework</body></html>"
      }

      const blob = new Blob([getHtmlContent()], { type: "text/html" })
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

