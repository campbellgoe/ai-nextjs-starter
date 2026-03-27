import z from "zod";

export const lessonsChallengesSchema = z.object({
    lessons: z.array(z.object({
      timestamp: z.string().describe('The timestamp of the lesson'),
      challenge: z.string().describe('The challenge for the lesson'),
      language: z.string().describe('The language e.g. code or spoken language.'),
      hintInfo: z.string().describe('A hint toward the solution. Detailed and helpful information about the questionOrChallenge to make the learners life easier. Don\'t worry if you give the answer away but try to only hint at the solution.'),
      challenges: z.array(z.object({
        challenge: z.string().describe('The question or challenge.'),
        hintInfo: z.string().describe('Helpful info which explains everything they might be missing to help them resolve all aspects of the problem to fix the code problem.'),
        level: z.enum(["beginner", "intermediate", "advanced", "expert", "master"]),
        codeExamplesIncomplete: z.object({
          problem: z.string().describe("Commented incomplete or incorrect code for the user to fix."),
          additionalCode: z.string().describe("Any optional additional code."),
          hintInfo: z.string().describe('Helpful info about the problem code.'),
        }).describe("The incomplete code for the user to fix."),
        codeComplete: z.object({
          solution: z.string().describe("The code solution in the language."),
          additionalCode: z.string().describe("Any optional additional code."),
          hintInfo: z.string().describe('Helpful info about gpts solution.'),
        })
      }))
    })),
  })