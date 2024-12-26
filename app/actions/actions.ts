'use server';

import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';

export async function generateLesson(input: string) {
  'use server';
  let topic = 'unknown'
  let language = 'unknown'
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject({
      model: openai('gpt-4o'),
      system: 'You generate lessons for an education app to learn languages, spoken or programming languages.',
      prompt: input,
      schema: z.object({
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
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
      if(partialObject.lesson?.topic){
        topic = partialObject.lesson.topic
      }
      if(partialObject.lesson?.language){
        language = partialObject.lesson.language
      }
    }

    stream.done();
  })();

  return { topic, language, data: stream.value };
}
