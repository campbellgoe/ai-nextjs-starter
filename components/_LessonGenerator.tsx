"use client"

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LessonGenerator() {
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // const eventSourceRef = useRef<EventSource | null>(null)
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "http://127.0.0.1:8000/generate-lesson-stream/?topic="+topic+"&language="+language+"&chatGptModel=gpt-4o"
  });

  // useEffect(() => {
  //   return () => {
  //     if (eventSourceRef.current) {
  //       eventSourceRef.current.close()
  //     }
  //   }
  // }, [])

  const generateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setLessonContent('')

    // if (eventSourceRef.current) {
    //   eventSourceRef.current.close()
    // }

    // const eventSource = new EventSource(`http://localhost:8000/generate-lesson-stream/?topic=${encodeURIComponent(topic)}&language=${encodeURIComponent(language)}`)
    // eventSourceRef.current = eventSource

    // eventSource.onmessage = (event) => {
    //   const newContent = JSON.parse(event.data).content
    //   setLessonContent((prevContent) => prevContent + newContent)
    // }

    // eventSource.onerror = (error) => {
    //   console.error('EventSource failed:', error)
    //   setError('An error occurred while generating the lesson. Please try again.')
    //   setIsLoading(false)
    //   eventSource.close()
    // }

    // eventSource.onopen = () => {
    //   setIsLoading(true)
    // }

    // eventSource.addEventListener('done', () => {
    //   setIsLoading(false)
    //   eventSource.close()
    // })
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>AI Lesson Generator</CardTitle>
          <CardDescription>Enter a topic and programming language to generate a lesson</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., For Loops"
                required
              />
            </div>
            <div>
              <Label htmlFor="language">Programming Language</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g., Python"
                required
              />
            </div>
            <label>
              Say something...
              <input value={input} onChange={handleInputChange} />
            </label>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Lesson'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-start">
          {error && <p className="text-red-500">{error}</p>}
          {/* {lessonContent && (
            <div className="mt-4 w-full">
              <h2 className="text-xl font-bold mb-2">Generated Lesson:</h2>
              <div className="bg-gray-100 p-4 rounded-md ">{lessonContent}</div>
            </div>
          )} */}
          {messages.map((m) => (
          <div key={m.id}>
            {m.role === "user" ? "User: " : "AI: "}
            {m.content}
          </div>
        ))}
        </CardFooter>
      </Card>
    </div>
  )
}

