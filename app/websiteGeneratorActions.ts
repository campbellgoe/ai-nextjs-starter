"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { FrameworkType } from "@/components/website-builder"

export async function generateWebsite(prompt: string, framework: FrameworkType): Promise<string> {
  try {
    const promptTemplate = getPromptTemplate(framework)
// console.log("The current server time is "+((new Date()).toDateString()))
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a website generator. The current server time is ${((new Date()).toDateString())}`,
      prompt: promptTemplate.replaceAll("{PROMPT}", prompt),
      temperature: 0.7,
      maxTokens: 4000,
    })

    return text
  } catch (error) {
    console.error("Error generating website:", error)
    throw new Error("Failed to generate website. Please try again.")
  }
}

function getPromptTemplate(framework: FrameworkType): string {
  switch (framework) {
    case "html":
      return `
        Generate a complete HTML website based on this description: "{PROMPT}"
        
        Requirements:
        - Use Tailwind CSS (it will be included via CDN)
        - Create a responsive design that works on mobile and desktop
        - Include realistic placeholder content
        - Only return the HTML code, no explanations
        - Do not include <!DOCTYPE>, <html>, <head>, or <body> tags
        - Make sure all elements have proper accessibility attributes
        - Use semantic HTML elements
      `

    case "react":
      return `
        Generate a React component based on this description: "{PROMPT}"
        
        Requirements:
        - Use Tailwind CSS for styling
        - Create a responsive design that works on mobile and desktop
        - Include realistic placeholder content
        - Only return the React component code, no explanations
        - Use functional components with hooks
        - Export a default App component
        - Make sure all elements have proper accessibility attributes
        - Use semantic HTML elements where appropriate
      `

    case "nextjs":
      return `
        Generate a Next.js page component based on this description: "{PROMPT}"
        
        Requirements:
        - Use the App Router pattern (not Pages Router)
        - Use Tailwind CSS for styling
        - Create a responsive design that works on mobile and desktop
        - Include realistic placeholder content
        - Only return the Next.js page component code, no explanations
        - Use Server Components where appropriate
        - Export a default Page component
        - Make sure all elements have proper accessibility attributes
        - Use semantic HTML elements where appropriate
        - Use Next.js Image component for images
        - Use Next.js Link component for navigation
      `

    default:
      return `Generate HTML code based on this description: "{PROMPT}"`
  }
}

