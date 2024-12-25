'use client';

import { useState } from 'react';
import { generate } from './actions';
import { readStreamableValue } from 'ai/rsc';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  

  return (
    <div>
      
    </div>
  );
}
import { useChat } from 'ai/react';

export default function Chat() {
  const [generation, setGeneration] = useState<string>('');
  const { messages, input, handleInputChange, handleSubmit } = useChat({maxSteps: 5});
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role+":"}
          {m.toolInvocations ? (
            <pre>{JSON.stringify(m.toolInvocations, null, 2)}</pre>
          ) : (
            <p>{m.content}</p>
          )}
          <pre>{generation}</pre>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="E.g. For Loops in Python"
          onChange={handleInputChange}
        />
      </form>
      <button
        onClick={async () => {
          const { object } = await generate(input);

          for await (const partialObject of readStreamableValue(object)) {
            if (partialObject) {
              setGeneration(
                JSON.stringify(partialObject.notifications, null, 2),
              );
            }
          }
        }}
      >
        Generate lesson
      </button>

      
    </div>
  );
}

