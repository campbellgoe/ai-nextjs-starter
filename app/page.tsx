'use client';

import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Chat() {
  const { messages, setMessages, input, handleInputChange, handleSubmit } = useChat({maxSteps: 5});
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  useEffect(() => {
    if(messages.length === 0){
      const messagesLocal = localStorage.getItem("messages.") || ''
      setMessages(JSON.parse(messagesLocal ))
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
          <CardTitle className="text-2xl font-bold text-center">AI Chat Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] pr-4">
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
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(m.toolInvocations, null, 2)}
                        </pre>
                      ) : (
                        <p>{m.content}</p>
                      )}
                    </div>
                  ) : (
                    <p className="truncate">{m.content}</p>
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
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex space-x-2">
              <Input
                className="flex-grow"
                value={input}
                placeholder="E.g. For Loops in Python"
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

