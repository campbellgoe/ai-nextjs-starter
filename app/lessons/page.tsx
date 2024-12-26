'use client';

import { useEffect, useState } from 'react';
import { generateLesson } from '@/app/actions/actions';
import { readStreamableValue } from 'ai/rsc';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LessonContent } from '@/components/LessonContent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface Lesson {
  topic: string;
  language: string;
  helpInfo: string;
  challenges: any[];
}

export default function Chat() {
  const [input, setInput] = useState('')
  const [lessons, setLessons] = useState<Map<string, Lesson>>(new Map());
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const storedLessons = localStorage.getItem("lessons");
    if (storedLessons) {
      try {
        const parsedLessons = JSON.parse(storedLessons);
        setLessons(new Map(parsedLessons));
      } catch (err) {
        console.warn("Couldn't parse stored lessons", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!isGenerating) {
      const localLessons = Array.from(lessons.entries())
      if(localLessons.length){
        localStorage.setItem("lessons", JSON.stringify(localLessons));
      }
    }
  }, [lessons, isGenerating]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const { data } = await generateLesson(input);

    for await (const partialObject of readStreamableValue(data)) {
      if (partialObject && partialObject.lesson) {
        const newLesson = partialObject.lesson;
        setLessons(prevLessons => {
          const updatedLessons = new Map(prevLessons);
          updatedLessons.set(input, newLesson);
          return updatedLessons;
        });
        setSelectedLesson(input);
      }
    }
    setIsGenerating(false);
  };

  // const parseInput = (input: string): { topic: string; language: string } => {
  //   const parts = input.split(' in ');
  //   return {
  //     topic: parts[0].trim(),
  //     language: parts[1]?.trim() || 'Unknown'
  //   };
  // };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Lesson Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex space-x-4">
            <Input
              className="flex-grow"
              value={input}
              placeholder="E.g. For Loops in Python"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            />
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
            >
              {isGenerating ? 'Generating...' : 'Generate Lesson'}
            </Button>
          </div>
          {lessons.size > 0 && (
            <div className="mb-4">
              <Select onValueChange={setSelectedLesson} value={selectedLesson || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(lessons.keys()).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Card className="bg-gray-50 overflow-auto min-h-[225px] max-h-[90vh]">
            <CardContent>
              {selectedLesson && lessons.has(selectedLesson) ? (
                <LessonContent lessonData={lessons.get(selectedLesson)!} />
              ) : (
                <p>Select or generate a lesson to view its content.</p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

