'use client';

import { useEffect, useState } from 'react';
import { generateLesson, generatePlaceholder } from '@/app/actions/actions';
import { readStreamableValue } from 'ai/rsc';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Challenge, LessonContent } from '@/components/LessonContent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { DiceButton } from '@/components/dice-button';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface Lesson {
  topic: string;
  language: string;
  helpInfo: string;
  challenges: any[];
  timestamp: number;
}
export default function Chat() {
  const [input, setInput] = useState('')
  const [lessons, setLessons] = useState<Map<string, Lesson>>(new Map());
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptPlaceholder, setPlaceholder] = useState('Type any topic you want to learn')
  useEffect(() => {
    if(selectedLesson) setInput(selectedLesson)
  }, [selectedLesson])
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
    // generatePlaceholder('').then(setPlaceholder)
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
  const handleGenerateMoreLessons = async (prompt: string = "") => {
    setIsGenerating(true)
    const lessonKey = input+'\n'+prompt
    const { data } = await generateLesson(lessonKey, 0.75)
    for await (const partialObject of readStreamableValue(data)) {
      if (partialObject && partialObject.lesson) {
        const newLesson = partialObject.lesson
        setLessons(prevLessons => {
          const updatedLessons = new Map(prevLessons);
          updatedLessons.set(lessonKey, newLesson);
          return updatedLessons;
        });
        setSelectedLesson(input);
      }
    }
    setIsGenerating(false);
  }
  


  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Challenge Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col space-y-2">
            <Label htmlFor="topic">What topic do you want to learn?</Label>
            <div className="flex flex-row">
              <DiceButton onClick={() => {
                generatePlaceholder(input).then(val => {
                  setPlaceholder(val)
                  setInput(val)
                })
              }} />
              <Input
                id="topic"
                className="flex-grow"
                value={input}
                placeholder={promptPlaceholder}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = e.target.value
                  setInput(v)
                  if(v === ' ' || v === '   '){
                    setInput(promptPlaceholder)
                  }
                }}
              />
            </div>
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
                  <SelectValue placeholder="Select a previous prompt" />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh] overflow-y-auto">
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
                <LessonContent input={input} lessonData={lessons.get(selectedLesson)!} generateMoreChallenges={(existingChallenges: Challenge[]) => {
                  const prompt = `Generate more challenges.`+Math.random()
handleGenerateMoreLessons(prompt)
                }} />
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
