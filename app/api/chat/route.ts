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
.describe('The location to get the weather for')
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const lessonSchema = z.object({
  topic: z.string(),
  language: z.string(),
  helpInfo: z.string(),
  challenges: z.array(z.object({
    challenge: z.string(),
    helpInfo: z.string(),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    code: z.array(z.object({ solution: z.string(), questionStarter: z.string() })),
  }))
})

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
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
      // weather: tool({
      //   description: 'Get the weather in a location (fahrenheit)',
      //   parameters: z.object({
      //     location: z.string().describe('The location to get the weather for'),
      //   }),
      //   execute: async ({ location }) => {
      //     const temperature = Math.round(Math.random() * (90 - 32) + 32);
      //     return {
      //       location,
      //       temperature,
      //     };
      //   },
      // }),
      // convertFahrenheitToCelsius: tool({
      //   description: 'Convert a temperature in fahrenheit to celsius',
      //   parameters: z.object({
      //     temperature: z
      //       .number()
      //       .describe('The temperature in fahrenheit to convert'),
      //   }),
      //   execute: async ({ temperature }) => {
      //     const celsius = Math.round((temperature - 32) * (5 / 9));
      //     return {
      //       celsius,
      //     };
      //   },
      // }),
    },
  });

  return result.toDataStreamResponse();
}