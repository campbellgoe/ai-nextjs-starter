'use client';

import { Message, useChat } from 'ai/react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic';
// This is the only place InitializedMDXEditor is imported directly.
const MyMdx = dynamic(() => import('@/components/InitializedMDXEditor'), {
  // Make sure we turn SSR off
  ssr: false
})
// Allow streaming responses up to 30 seconds
export const maxDuration = 60;
// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.


// TS complains without the following line
MyMdx.displayName = 'MyMDX'
export default function Chat() {
  const [generating, setGenerating] = useState(false)
  const { messages, setMessages, input, handleInputChange, handleSubmit } = useChat({maxSteps: 5, onFinish: (message: Message, { usage, finishReason }) => {
      setGenerating(false)
  }});
  const handleSubmitClient = (d: FormData) => {
    if(input) setGenerating(true)
  }
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  useEffect(() => {
    if(messages.length === 0){
      const messagesLocal = localStorage.getItem("messages.") || '[]'
      const oldMessages = JSON.parse(messagesLocal)
      if(oldMessages.length){
        setMessages(oldMessages)
      }
    }
    return () => {
      if(messages.length > 0){
        localStorage.setItem("messages.", JSON.stringify(messages))
      }
    }
  }, [messages])
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">AI Chat</CardTitle>
        </CardHeader>
        <CardContent> 
            {/* <pre>{JSON.stringify(messages, null, 2)}</pre> */}
            {messages.map(m => (
              <Card key={m.id} className="mb-4">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">
                    {m.role?.charAt(0).toUpperCase() + m.role?.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expandedMessage === m.id ? (
                    <div className="whitespace-pre-wrap">
                      {m.toolInvocations ? (
                        <pre className="bg-gray-100 p-2 rounded whitespace-break-spaces">
                          {JSON.stringify(m.toolInvocations, null, 2)}
                        </pre>
                      ) : null}
                        <Suspense fallback={<pre>{m.content}</pre>}>
                          {!generating ? <MyMdx
                            markdown={m.content}
                          /> : <pre>{m.content}</pre>}
                        </Suspense>
                    </div>
                  ) : (
                    <p className="truncate">{m.content.slice(0, 300)}</p>
                  )}
                </CardContent>
               {m.content?.length > 60 && <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setExpandedMessage(expandedMessage => expandedMessage === m.id ? null : m.id)}
                  >
                    {expandedMessage === m.id ? 'Collapse' : 'Expand'}
                  </Button>
                </CardFooter>}
              </Card>
            ))}
        </CardContent>
        <CardFooter className="fixed bottom-0 bg-[#cce3ff7d] backdrop-blur-sm rounded-tr-md">
          <form onSubmit={(...args) => {
            handleSubmit(...args)
            handleSubmitClient(...args)
          }} className="w-full p-2">
            <div className="flex space-x-2">
              <Input
                className="flex-grow bg-white"
                value={input}
                placeholder="Ask away!"
                onChange={handleInputChange}
              />
              <Button type="submit">
                Ask
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

