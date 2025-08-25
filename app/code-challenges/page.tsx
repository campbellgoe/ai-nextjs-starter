'use client';

import { useEffect, useMemo, useState } from 'react';
import { generateLessons, generatePlaceholder } from '@/app/actions/actions';
import { readStreamableValue } from 'ai/rsc';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lesson, LessonsContent } from '@/components/LessonsContent';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { DiceButton } from '@/components/dice-button';
import { getData, setData } from '@/contexts/datasource';
import { Message } from 'ai';

// Allow streaming responses up to 45 seconds
export const maxDuration = 35;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedLessons, setSelectedLessons] = useState<string>('');
  const [messagesLocal, setMessagesLocal] = useState([])
  useEffect(() => {
    const handleGetLocalMessages = async (): Promise<[]> => {
      const key = "messages"
      return await getData(key) || []
    }
    handleGetLocalMessages().then((messages: []) => {
      setMessagesLocal(messages)
    })
  }, [selectedLessons])
      const oldMessages: Message[] = useMemo(() => {
        try {
          return messagesLocal
        } catch(err){
          console.warn(err)
          return []
        }
      }, [messagesLocal])
  const [input, setInput] = useState('')

  const [lessons, setLessons] = useState<Map<string, Lesson[]>>(new Map());

  
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptPlaceholder, setPlaceholder] = useState('Type any topic you want to learn')
  useEffect(() => {
    if(selectedLessons) setInput(selectedLessons)
  }, [selectedLessons])
  useEffect(() => {
    const handleSetStoredLessonsOnStartup = async () => {
      const storedLessons = await getData<[]>("lessons");
      if (Array.isArray(storedLessons)) {
        try {
            setLessons(new Map(storedLessons));
        } catch (err) {
          console.warn("Couldn't parse stored lessons", err);
        }
      }
    }
    handleSetStoredLessonsOnStartup()
   
    return () => {
      // on exit
      const handleSetStoredLessonsOnExit = async () => {
        const existing: [] | null = await getData("lessons")
        if(existing && lessons.size > existing.length) {
          await setData("lessons", JSON.stringify(Array.from(lessons.entries())));
        }
      }
      handleSetStoredLessonsOnExit()
    }
  } , [])
  const isUser = (message: Message) => message.role === 'user'
  useEffect(() => {
    if(oldMessages.length && messages.length < oldMessages.length){
      setMessages(oldMessages)
      if(oldMessages[oldMessages.length - 1].content.length){
        setPlaceholder(oldMessages.findLast(isUser)?.content || '')
        // console.log(oldMessages.findLast(isUser))
      }
    }
  }, [oldMessages, messages.length])

  useEffect(() => {
    if (!isGenerating) {
      setData("lessons", Array.from(lessons.entries()));
    }
  }, [lessons, isGenerating]);
const firstLessonKey = useMemo(() => lessons.size > 0 ? [...lessons.entries().filter((_, i) => i === 0).map(([Key]) => Key)][0] : '', [lessons])
  useEffect(() => {
    if(!selectedLessons || !lessons.has(selectedLessons)){
      setSelectedLessons(firstLessonKey)
    }
  }, [lessons, selectedLessons, firstLessonKey])
  const lessonsData: Lesson[]= useMemo(() => (lessons.has(selectedLessons || '') ? lessons.get(selectedLessons || '') : []) || [], [lessons, selectedLessons])
  const handleGenerateLessons = async (prompt: string) => {
    setIsGenerating(true);
    const { data } = await generateLessons(prompt);

    for await (const partialObject of readStreamableValue(data)) {
      if (partialObject && partialObject.lessons) {
        const newLessons = [...lessonsData, ...partialObject.lessons]
        setLessons(prevLessons => {
          const updatedLessons = new Map(prevLessons);
          updatedLessons.set(prompt, newLessons);
          return updatedLessons;
        });
      }
    }
        setSelectedLessons(prompt);
    
    setIsGenerating(false);
  };
  const handleGenerateMoreLessons = async (prompt: string = "") => {
    return await handleGenerateLessons(prompt)
  }
  const removeLesson = (prompt: string) => {
    setLessons(prevLessons => {
      const updatedLessons = new Map(prevLessons);
      updatedLessons.set(prompt, []);
      return updatedLessons;
    });
    // setSelectedLessons()
  }
  const [offsetIndex, setOffsetIndex] = useState<number>(0)

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
              <DiceButton onClick={async () => {
                 try {
                  const messagesLocal = await getData("messages") || []
                

                  generatePlaceholder(input, Array.isArray(messagesLocal) ? messagesLocal : []).then(val => {
                    setPlaceholder(val)
                    setInput(val)
                  })
              } catch(err){
                console.warn(err)
              }
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
              onClick={() => {
                handleGenerateLessons(input)
                setOffsetIndex(lessonsData.length)
              }}
              disabled={isGenerating || !input.trim()}
            >
              {isGenerating ? 'Generating...' : 'Generate Challenges'}
            </Button>
          </div>
          
          {/* {selectedLessons && <Button className="mb-4" onClick={() => setSelectedLessons(null)}>Deselect</Button>} */}
          {/* Select input for choosing a lesson */}
          {/* {lessons.size > 0 && (
            <div className="mb-4">
               <Select required={false} onValueChange={(v: string) => {
                if(v){
                  setSelectedLessons(v)
                }
               }} value={selectedLessons || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a previous prompt" />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh] overflow-y-auto">
                  {Array.from(lessons.entries())
                    .map(([key]) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )} */}
          
           
          {!isGenerating && selectedLessons && <><Button className="mb-4" onClick={() => {
            const confirmed = confirm("Delete "+input+"?")
            if(confirmed) removeLesson(input)
          }}>
            Delete
          </Button>{" "}<span>{input}</span></>}
          <Card className="bg-gray-50">
            <CardContent>
              {!!(lessonsData.length && offsetIndex > 0) && <Button onClick={() => {
setOffsetIndex(i => i-1)
          }}>
            {"<-"}
          </Button>}
          {!!(lessonsData.length && offsetIndex < lessonsData.length-1) && <Button className="float-right" onClick={() => {
            setOffsetIndex(i => i+1)
          }}>
            {"->"}
          </Button>}
              {selectedLessons && lessonsData && (
                <LessonsContent offsetIndex={offsetIndex} isGenerating={isGenerating} lessonsData={lessonsData} generateMoreChallenges={() => {
                  // const prompt = `${input}. Previous challenge: ${existingChallenges.map((challenge: Challenge) => challenge.challenge).join(", ")}`
handleGenerateMoreLessons(input)
setOffsetIndex(lessonsData.length)
                }} />
              )}
              
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
