'use client';

import { Message, useChat } from '@ai-sdk/react';
import {  Suspense, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Delete } from 'lucide-react';
import { getData, setData } from '@/contexts/datasource';
// This is the only place InitializedMDXEditor is imported directly.
const MyMdx = dynamic(() => import('@/components/InitializedMDXEditor'), {
  // Make sure we turn SSR off
  ssr: false
})
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other
// props, including a ref.

// TS complains without the following line
MyMdx.displayName = 'MyMDX'
export default function ChatPage() {
  // const _usage = useContextState(['usage', 'setUsage'])
  const [generating, setGenerating] = useState(false)
  const { messages, setMessages, input, handleInputChange, handleSubmit } = useChat({maxSteps: 5, onFinish: (/*_message: Message, { usage, finishReason: _finishReason }*/) => {
      setGenerating(false)
      // setUsage(u => u + usage.totalTokens)
  }});
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  useEffect(() => {
    const messagesLocal = getData("messages.") || []
      if(Array.isArray(messagesLocal)){
        setMessages(messagesLocal)
      }
    },[])
  useEffect(() => {
      
    return () => {
      const handleSetSavedMessagesOnExit = async () => {
        await setData("messages.", messages)
      }
      handleSetSavedMessagesOnExit()
    }
  }, [messages, setMessages])
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">AI Chat</CardTitle>
        </CardHeader>
        <CardContent> 
            {/* <pre>{JSON.stringify(messages, null, 2)}</pre> */}
        <div className="grid auto-rows-max grid-cols-12">
            {messages.map(m => (
              <Card key={m.id} className={cn("mb-4", {
                "justify-self-start": m.role === 'user',
                "justify-self-end col-start-4": m.role === 'assistant' && !(expandedMessage === m.id),
                "max-w-full col-span-10": !(expandedMessage === m.id),
                "col-span-12 col-start-2": expandedMessage === m.id
              })}>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">
                    {m.role?.charAt(0).toUpperCase() + m.role?.slice(1)} <Button className="mt-4" onClick={() => {
                      const confirmed = confirm("Delete "+m.content.slice(0, 30)+"...?")
                      if(confirmed){
                        
                        setMessages((messages: Message[]) => messages.filter(a => a.id != m.id))

                      }
                    }}>Delete<Delete></Delete></Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expandedMessage === m.id ? (
                    <div className="whitespace-pre-wrap">
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
            </div>
        </CardContent>
        <CardFooter className="sticky bottom-0 bg-[#cce3ff7d] backdrop-blur-sm ">
          <form onSubmit={handleSubmit} className="w-full p-2">
            <div className="flex space-x-2">
              <textarea
                className="flex-grow bg-white resize-y w-full p-2"
                value={input}
                placeholder="Ask away!"
                onChange={handleInputChange}
              />
              <Button type="submit" onClick={() => {
                if(input) setGenerating(true)
              }}>
                Ask
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

