import { z } from "zod";

// Define the schema for our analysis result
export const analysisResultSchema = z.object({
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