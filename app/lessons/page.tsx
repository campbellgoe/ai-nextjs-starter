'use client';

import { useEffect, useState } from 'react';
import { generateLesson } from '@/app/actions/actions';
import { readStreamableValue } from 'ai/rsc';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LessonContent } from '@/components/LessonContent';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Chat() {
  const [input, setInput] = useState('')
  const [generation, setGeneration] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
useEffect(() => {
      if(!isGenerating){
        const generationLocal = localStorage.getItem("generation.") || ''
        try {
          const data = JSON.parse(generationLocal)
          if(data){
            setGeneration(data)
          }
        } catch(err){
          console.warn("Couldn't parse local lesson generation", err)
        }
      }
      return () => {
        if(!isGenerating){
          localStorage.setItem("generation.", JSON.stringify(generation))
        }
      }
  }, [isGenerating])
  const handleGenerate = async () => {
    setIsGenerating(true);
    console.log('stream object with input', input)
    const { data } = await generateLesson(input);

    for await (const partialObject of readStreamableValue(data)) {
      if (partialObject) {
        setGeneration(partialObject.lesson);
      }
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Lesson Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              className="w-full"
              value={input}
              placeholder="E.g. For Loops in Python"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            />
          </div>
          <Card className="bg-gray-50 overflow-auto max-h-[calc(100vh-300px)]">
            <CardContent>
              {generation ? (
                <LessonContent lessonData={generation} />
              ) : (
                <p>Generated lesson will appear here...</p>
              )}
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !input.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate Lesson'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

