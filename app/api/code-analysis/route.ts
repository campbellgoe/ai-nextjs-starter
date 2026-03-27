import { Output, streamText } from "ai";
import { z } from "zod";
const GPT = 'gpt'
const models = {
  [GPT]: 'openai/gpt-oss-120b',
}
// Define the schema for our analysis result
export const analysisResultSchema = () => z.object({
  report: z.object({
    bugs: z.array(
      z.object({
        description: z.string(),
        lineNumber: z.number().optional(),
        severity: z.enum(["low", "medium", "high"]),
      }),
    ),
    securityIssues: z.array(
      z.object({
        description: z.string(),
        lineNumber: z.number().optional(),
        severity: z.enum(["low", "medium", "high"]),
      }),
    ),
    improvements: z.array(
      z.object({
        description: z.string(),
        lineNumber: z.number().optional(),
      }),
    ),
    fixedCode: z.string(),
  })
})

export async function generateCodeAnalysis(code: string, language: string) {
    const textStream = streamText({
      model: models[GPT],
      output: Output.object({ schema: analysisResultSchema() }),
      system: `You are an expert code analyzer. Analyze the provided code for bugs, security issues, and potential improvements.
      Be thorough but concise in your analysis. Focus on practical issues that would affect production code.
      For security issues, consider common vulnerabilities like injection attacks, authentication issues, etc.
      For bugs, look for logical errors, edge cases, and potential runtime exceptions.
      For improvements, suggest better patterns, performance optimizations, and code readability enhancements.
      Provide fixed code that addresses all the issues you've identified.`,
      prompt: `Analyze the following ${language} code and provide a detailed report:
${code}

Identify bugs, security issues, and potential improvements. Then provide a fixed version of the code.`,
      // onChunk: async ({ chunk }: any) => {
      //   if (chunk.type === "object-delta") {
      //     // Convert the chunk to a JSON string and send it to the client
      //     const encoder = new TextEncoder()
      //     controller.enqueue(encoder.encode(JSON.stringify(chunk.delta)))
      //   }
      // },
      onFinish: async () => {
      },
    });

  return textStream.toTextStreamResponse();
}

export const maxDuration = 30;

export async function POST(req: Request) {
    const { code, language } = await req.json();
    return generateCodeAnalysis(code, language)
}