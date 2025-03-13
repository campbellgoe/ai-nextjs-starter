'use server';

import { streamObject, generateText, Message, CallWarning, LanguageModelResponseMetadata, LanguageModelUsage, ProviderMetadata } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';
const GPT_4O = 'gpt-4o'
const GPT_4O_MINI = 'gpt-4o-mini'
const models = {
  [GPT_4O_MINI]: openai(GPT_4O_MINI),
  [GPT_4O]: openai(GPT_4O),
}
export type OnFinishCallback = {
    /**
  The token usage of the generated response.
  */
    usage: LanguageModelUsage;
    /**
  The generated object. Can be undefined if the final object does not match the schema.
  */
    object: any | undefined;
    /**
  Optional error object. This is e.g. a TypeValidationError when the final object does not match the schema.
  */
    error: unknown | undefined;
    /**
  Response metadata.
   */
    response: LanguageModelResponseMetadata;
    /**
  Warnings from the model provider (e.g. unsupported settings).
  */
    warnings?: CallWarning[];
    /**
  Additional provider-specific metadata. They are passed through
  from the provider to the AI SDK and enable provider-specific
  results that can be fully encapsulated in the provider.
  */
    experimental_providerMetadata: ProviderMetadata | undefined;
}
const paramsGenerateLessonsWithChallenges = (model: keyof typeof models = GPT_4O, prompt: string, temperature: number = 0.7, system: string = "") => ({
  model: model in models ? models[model] : models[GPT_4O], // user can set the model for this query but defaults to gpt-4o
    system: 'You generate *lessons* and *challenges* for an education app to learn what they want, you can set (code using specific programming languages or simply in a spoken language as a challenge) challenges. Make sure to make the code questionStarter one iteration before or different from the final complete solution.\nUser instructions for system:\n'+system,
  prompt,
  temperature,
  schema: z.object({
    lessons: z.array(z.object({
      timestamp: z.string().describe('The timestamp of the lesson'),
      questionOrChallenge: z.string().describe('The questionOrChallenge for the lesson'),
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
  }),
  onFinish({ usage }: { usage: LanguageModelUsage } ) {
    console.log('Token usage:', usage);
    
  },
})
// acceptable prompts include the question or challenge, the hint info, the example correct code, and the user code in a single string of characters
const paramsDetermineAndRespondWithCorrectnessFeedback = (prompt: string, temperature: number = 0.7) => ({
  model: models[GPT_4O],// was gpt-4o but mini should be cheaper for now
  system: 'You generate *correctness* feedback for the user code and the question, hint info, and the example correct code. Acceptable answers must solve the problem posed in the question/challenge and alternatives to the solution may be allowed. You provide the correct answer and the feedback on the users code. Example feedback could be "Correct, you provided an alternative solution." or "Incorrect, but you are close." or Correct! Our solutions match!" or "Incorrect, hint:...". or "Correct! Close enough!". Good feedback is concise and to the point and helps the user understand how to solve the given problem.',
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
const paramsGenerateProgrammingLanguages = (model: keyof typeof models = GPT_4O, temperature: number = 0.7) => ({
  model: model in models ? models[model] : models[GPT_4O],
  system: 'You generate a list of programming languages so the user can become aware of them and will render the list in an accordion.',
  prompt: "List all programming languages you know by relevance or popularity enhaustively.",
  temperature,
  schema: z.array(z.object({
    language: z.string().describe('The programming language'),
  }))
});
export async function generateProgrammingLanguages(temperature: number = 0.7) {
  'use server';
  
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject(paramsGenerateProgrammingLanguages(GPT_4O, temperature));

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { data: stream.value };
}
export async function generateLessons(input: string, temperature: number = 0.7) {
  'use server';
  // let questionOrChallenge = 'unknown'
  // let language = 'unknown'
  // const detailsStream = createStreamableValue()
  // const details = {
  //   questionOrChallenge, language
  // }
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject(paramsGenerateLessonsWithChallenges(GPT_4O, input, temperature, ""));

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { data: stream.value };
}

export async function generateCorrectness(correctAndUserCodesInput: string) {
  'use server';
  // let questionOrChallenge = 'unknown'
  // let language = 'unknown'
  // const detailsStream = createStreamableValue()
  // const details = {
  //   questionOrChallenge, language
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


export async function generatePlaceholder(input: string | undefined, messages?: Message[]) {
  const { text } = await generateText({
    model: models[GPT_4O_MINI],
    temperature: 0.7,
    messages: [
      ...(messages || []),
      { role: 'system', content: 'You genarate placeholder text for a prompt input. Generate a short, specific questionOrChallenge that would be interesting to learn about. Your response should be 5-10 words long. Use the programming language in the prompt e.g. {questionOrChallenge} in {language} (if given a coding questionOrChallenge or langauge)' },
      { role: 'user', content: (input || '') }
    ],
  });

  return text;
}

export async function generateWebsite(prompt: string, type: "HTML" | "React" | "Next.js" = "HTML"): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        Generate a complete ${type} website based on this description: "${prompt}"
        
        Requirements:
        - Use Tailwind CSS (it will be included via CDN)
        - Create a responsive design that works on mobile and desktop
        - Include realistic placeholder content
        - Only return the ${type} code, no explanations
        - Do not include <!DOCTYPE>, <html>, <head>, or <body> tags
        - Make sure all elements have proper accessibility attributes
        - Use semantic ${type} elements
      `,
      temperature: 0.7,
      maxTokens: 4000,
    })

    return text
  } catch (error) {
    console.error("Error generating website:", error)
    throw new Error("Failed to generate website. Please try again.")
  }
}

