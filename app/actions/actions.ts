'use server';

import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';
const paramsGenerateLessonWithChallenges = (prompt: string) => ({
  model: openai('gpt-4o'),
  system: 'You generate *lessons* for an education app to learn what they want, if it\'s for a programming language you can set code challenges. Make sure to leave code questionStarter empty or with incomplete code so the user can fill it out.',
  prompt,
  schema: z.object({
    lesson: z.object({
      timestamp: z.string().describe('The timestamp of the lesson'),
      topic: z.string().describe('The topic for the lesson'),
      language: z.string().describe('The language e.g. code or spoken language.'),
      helpInfo: z.string().describe('Helpful info about the topic to make the learners life easier.'),
      challenges: z.array(z.object({
        challenge: z.string().describe('The question or challenge.'),
        helpInfo: z.string().describe('Helpful info to help them resolve all aspects of the problem to fix the code problem.'),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        code: z.array(z.object({ solution: z.string().describe("The code solution in the language"), questionStarter: z.string().describe("Commented incomplete code without the full answer in the language") })),
      }))
    }),
  }),
  onFinish({ usage }: any) {
    console.log('Token usage:', usage);
    
  },
})
// acceptable prompts include the question or challenge, the hint info, the example correct code, and the user code in a single string of characters
const paramsDetermineAndRespondWithCorrectnessFeedback = (prompt: string) => ({
  model: openai('gpt-4o'),
  system: 'You generate *correctness* feedback for the user code and the question, hint info, and the example correct code. Acceptable answers must solve the problem posed in the question/challenge and alternatives to the solution may be allowed. You provide the correct answer and the feedback on the users code. Example feedback could be "Correct, you provided an alternative solution." or "Incorrect, but you are close." or Correct! Our solutions match!" or "Incorrect, hint:...". Good feedback is concise and to the point and helps the user understand what they did wrong and how to fix it.',
  prompt,
  schema: z.object({
    correctness: z.object({
      correct: z.boolean().describe('Whether the user code is correct or not.'),
      confidence: z.number().describe('The confidence level of the correctness feedback.'),
      feedback: z.string().describe('The feedback on the users code.'),
      correctAnswerCode: z.string().describe('The correct answer code in the language.'),
    })
  })
})
export async function generateLesson(input: string) {
  'use server';
  // let topic = 'unknown'
  // let language = 'unknown'
  // const detailsStream = createStreamableValue()
  // const details = {
  //   topic, language
  // }
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject(paramsGenerateLessonWithChallenges(input));

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
