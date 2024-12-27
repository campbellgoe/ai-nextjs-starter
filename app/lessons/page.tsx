'use client';

import { useEffect, useState } from 'react';
import { generateLesson, generateCorrectness } from '@/app/actions/actions';
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
  timestamp: number;
}
const languages = [['JavaScript', 'javascript', 'js'],
['Python', 'python', 'py'],
['Java', 'java'],
['C++', 'cpp'],
['C#', 'csharp'],
['PHP', 'php'],
['TypeScript', 'ts'],
['Rust', 'rust', 'rs'],
['Go', 'go'],
['Swift', 'swift'],
['Kotlin', 'kotlin'],
['Ruby', 'ruby'],
['SQL', 'sql'],
['Dart', 'dart'],
['Shell scripting (Bash, PowerShell)', 'bash'],
['Lua', 'lua'],
['Haskell', 'haskell'],
['R', 'r'],
['MATLAB', 'matlab'],
['Assembly (common architectures like x86/x64)', 'assembly', 'wasm'],
]
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
        if(parsedLessons.length) {
          setLessons(new Map(parsedLessons));
        }
      } catch (err) {
        console.warn("Couldn't parse stored lessons", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!isGenerating) {
      localStorage.setItem("lessons", JSON.stringify(Array.from(lessons.entries())));
    }
  }, [lessons, isGenerating]);

  const handleGenerateLesson = async () => {
    setIsGenerating(true);
    const { data } = await generateLesson(input);

    for await (const partialObject of readStreamableValue(data)) {
      if (partialObject && partialObject.lesson) {
        const newLesson = { ...partialObject.lesson, timestamp: partialObject.timestamp || partialObject.lesson?.timestamp || Date.now() };
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


  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Challenge Generator</CardTitle>
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
              onClick={handleGenerateLesson}
              disabled={isGenerating || !input.trim()}
            >
              {isGenerating ? 'Generating...' : 'Generate Challenges'}
            </Button>
          </div>
          {lessons.size > 0 && (
            <div className="mb-4">
              <Select onValueChange={setSelectedLesson} value={selectedLesson || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {Array.from(lessons.entries())
                    .sort((a, b) => b[1].timestamp - a[1].timestamp)
                    .map(([key, lesson]) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Card className="bg-gray-50">
            <CardContent>
              {selectedLesson && lessons.has(selectedLesson) ? (
                <LessonContent lessonData={lessons.get(selectedLesson)!} />
              ) : (
                <p>Select or type a prompt and click generate to view its content.</p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
