'use server';

import { streamObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';
const models = {
  'gpt-4o-mini': openai('gpt-4o-mini'),
  'gpt-4o': openai('gpt-4o'),
  // 'gpt-o1': openai('gpt-o1'),
  'gpt-o3-mini': openai('gpt-o3-mini'),
}
const paramsGenerateLessonsWithChallenges = (prompt: string, temperature: number = 0.7) => ({
  model: models['gpt-o3-mini'], // was gpt-4o but mini should be cheaper for now
  system: 'You generate *lessons* and *challenges* for an education app to learn what they want, you can set (code using specific programming languages or simply in a spoken language as a challenge) challenges. Make sure to leave code questionStarter empty or with incomplete code so the user can fill it out.',
  prompt,
  temperature,
  schema: z.object({
    lessons: z.array(z.object({
      timestamp: z.string().describe('The timestamp of the lesson'),
      topic: z.string().describe('The topic for the lesson'),
      language: z.string().describe('The language e.g. code or spoken language.'),
      helpInfo: z.string().describe('Helpful info about the topic to make the learners life easier.'),
      challenges: z.array(z.object({
        challenge: z.string().describe('The question or challenge.'),
        helpInfo: z.string().describe('Helpful info which explains everything they might be missing to help them resolve all aspects of the problem to fix the code problem. Can be in mdx format.'),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        codeExamplesIncomplete: z.object({
          problem: z.string().describe("Commented incomplete or incorrect code for the user to fix."),
          additionalCode: z.string().describe("Any optional additional code."),
          helpInfo: z.string().describe('Helpful info about the problem code.'),
        }).describe("The incomplete code for the user to fix."),
        codeComplete: z.object({
          solution: z.string().describe("The code solution in the language."),
          additionalCode: z.string().describe("Any optional additional code."),
          helpInfo: z.string().describe('Helpful info about gpts solution.'),
        })
      }))
    })),
  }),
  onFinish({ usage }: any) {
    console.log('Token usage:', usage);
    
  },
})
// acceptable prompts include the question or challenge, the hint info, the example correct code, and the user code in a single string of characters
const paramsDetermineAndRespondWithCorrectnessFeedback = (prompt: string, temperature: number = 0.7) => ({
  model: models['gpt-o3-mini'],// was gpt-4o but mini should be cheaper for now
  system: 'You generate *correctness* feedback for the user code and the question, hint info, and the example correct code. Acceptable answers must solve the problem posed in the question/challenge and alternatives to the solution may be allowed. You provide the correct answer and the feedback on the users code. Example feedback could be "Correct, you provided an alternative solution." or "Incorrect, but you are close." or Correct! Our solutions match!" or "Incorrect, hint:...". or "Correct! Close enough!". Good feedback is concise and to the point and helps the user understand what they did wrong and how to fix it.',
  prompt,
  temperature,
  schema: z.object({
    correctness: z.object({
      correct: z.boolean().describe('Whether the user code is correct or not.'),
      confidence: z.number().describe('The confidence level of the correctness feedback.'),
      feedback: z.string().describe('The feedback on the users code.'),
      correctAnswerCode: z.string().describe('The correct answer code in the language.'),
      expPointsWon: z.number().describe('number of experience points the player won as a result of getting it correct')
    })
  })
})
const paramsGenVertsTris = (prompt: string, temperature: number = 0.7) => ({
  model: models['gpt-o3-mini'],// was gpt-4o but mini should be cheaper for now
  system: 'You generate *vertices* and *triangles* for a 3D model. The vertices are points in 3D space and the triangles are the faces of the 3D model. The vertices and triangles must form a valid 3D model.',
  prompt,
  temperature,
  schema: z.object({
    vertices: z.array(z.number()).describe('The vertices of the 3D model. Each vertex is a 3D point with x, y, and z coordinates.'),
    triangles: z.array(z.number()).describe('The triangles of the 3D model. Each triangle is a set of 3 vertices that form a face of the 3D model.'),
  })
})
export async function generateLessons(input: string, temperature: number = 0.7) {
  'use server';
  // let topic = 'unknown'
  // let language = 'unknown'
  // const detailsStream = createStreamableValue()
  // const details = {
  //   topic, language
  // }
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject(paramsGenerateLessonsWithChallenges(input, temperature));

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { data: stream.value };
}

export async function generateCorrectness(correctAndUserCodesInput: string) {
  'use server';
  // let topic = 'unknown'
  // let language = 'unknown'
  // const detailsStream = createStreamableValue()
  // const details = {
  //   topic, language
  // }
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject(paramsDetermineAndRespondWithCorrectnessFeedback(correctAndUserCodesInput));

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { data: stream.value };
}


export async function generatePlaceholder(input: string | undefined, messages?: any[]) {
  const { text } = await generateText({
    model: models['gpt-o3-mini'],
    temperature: 0.7,
    messages: [
      ...(messages || []),
      { role: 'system', content: 'You genarate placeholder text for a prompt input. Generate a short, specific topic that would be interesting to learn about. Your response should be 5-10 words long. Use the programming language in the prompt e.g. {topic} in {language} (if given a coding topic or langauge)' },
      { role: 'user', content: 'I want to learn and be challenged, what would make a good challenge? '+(input || '') }
    ],
  });

  return text;
}