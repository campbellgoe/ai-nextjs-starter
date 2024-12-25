import { openai } from '@ai-sdk/openai';
import { streamText, tool, streamObject } from 'ai';
import { z } from 'zod';

const { partialObjectStream } = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

for await (const partialObject of partialObjectStream) {
  console.clear();
  console.log(partialObject);
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const lessonSchema = z.object({
  lesson: z.object({
    topic: z.string().describe('The topic for the lesson'),
    language: z.string().describe('The language e.g. code or spoken language.'),
    helpInfo: z.string().describe('Helpful info about the topic to make the learners life easier.'),
    challenges: z.array(z.object({
      challenge: z.string().describe('The question or challenge.'),
      helpInfo: z.string().describe('Helpful info about the challenge, a hint.'),
      level: z.enum(["beginner", "intermediate", "advanced"]),
      code: z.array(z.object({ solution: z.string(), questionStarter: z.string() })),
    }))
  }),
})

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { partialObjectStream } = streamObject({
    model: openai('gpt-4-turbo'),
    schema: z.object({
      recipe: z.object({
        name: z.string(),
        ingredients: z.array(z.string()),
        steps: z.array(z.string()),
      }),
    }),
    prompt: 'Generate a lasagna recipe.',
  });
  
  for await (const partialObject of partialObjectStream) {
    console.clear();
    console.log(partialObject);
  }
  const result = streamObject({
    model: openai('gpt-4o'),
    messages,
    tools: {
      lesson: tool({
        description: "Generate a lesson in JSON format which provides helpful information, questions/challenges and possible soutions including code solutions and broken code for them to fix. For string values of some values inside the JSON object, you can use MDX format.",
        parameters: lessonSchema,
        execute: async ({ helpInfo, challenges }) => {
          return {
            helpInfo,
            challenges,
          }
        }
      })
    },
  });

  return result.toDataStreamResponse();
}