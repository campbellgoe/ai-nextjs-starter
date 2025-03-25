import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { highlight } from 'sugar-high'
import Editor from 'react-simple-code-editor';
import { highlight as prismaHighlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another
import confetti from 'canvas-confetti'
import { generateCorrectness } from "@/app/actions/actions";
import { Label } from "./ui/label";
import { useAppContext } from "@/contexts/AppContext";
import { getData, setData } from "@/contexts/datasource";
// import { slugify } from "@/lib/utils";
export interface Challenge {
  challenge: string;
  hintInfo: string;
  level: string;
  codeComplete: {
    solution: string;
    additionalCode: string;
    hintInfo: string;
  }
  codeExamplesIncomplete: {
    problem: string;
    additionalCode: string;
    hintInfo: string;
  }
}

export interface Lesson {
  challenge: string;
  language: string;
  hintInfo: string;
  challenges: Challenge[];
  timestamp: number;
}

const ChallengeCard: React.FC<{ challenge: Challenge; language: string; }> = ({ challenge, language }) => {
  const { localCodeKey, setLocalCodeKey, setExpPoints, experiencePoints } = useAppContext()
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSolution, setShowSolution] = useState(false)
  const [isGeneratingCorrectness, setIsGeneratingCorrectness] = useState(false);
  const [correctness, setCorrectness] = useState<Map<string, any>>(new Map());
const challengeText = challenge?.challenge;
  const solution = challenge?.codeComplete?.solution
  const problem = challenge?.codeExamplesIncomplete?.problem
  const solutionExtra = challenge?.codeComplete?.additionalCode
  const problemExtra = challenge?.codeExamplesIncomplete?.additionalCode
  const codeProblemHTML = problem ? highlight(problem) : ''
  const codeSolutionHTML = solution ? highlight(solution) : ''
  const codeProblemExtraHTML = problemExtra ? highlight(problemExtra) : ''
  const codeSolutionExtraHTML = solutionExtra ? highlight(solutionExtra) : ''
  const [challengeHelpInfoUser, challengeHelpInfoSolution] = [challenge?.codeExamplesIncomplete?.hintInfo, challenge?.codeComplete?.hintInfo]
  const [yourAttemptCode, setYourCode] = useState(
    '// code goes here'
  );
  const isCode = (codeProblemHTML && codeSolutionHTML)
  const promptForCorrectnessFeedback = `User attempt code:
${yourAttemptCode}
Challenge/Question:
${challenge.challenge}
Hint:
${challenge.hintInfo}
`
  const correctnessFeedback = correctness.get(promptForCorrectnessFeedback)
const maxTries = 2
const codeUserAttemptKey = useMemo(() => "code.userAttempt."+challengeText,[challengeText]) 
useEffect(() => {
  if(!localCodeKey && localCodeKey != codeUserAttemptKey){
    setLocalCodeKey(codeUserAttemptKey)
  }
}, [codeUserAttemptKey])
  useEffect(() => {
    
    try {
      const handleGetStoredCode = async () => {
        if(codeUserAttemptKey){
        return await getData(codeUserAttemptKey) || ''
        }
        return ''
      }
      handleGetStoredCode().then((storedCode: any) => {
        if(!!storedCode){
          setYourCode(storedCode)
        } else {
          // setYourCode(problem === solution ? '' : problem)
        }
      })
    } catch(err: any){
console.warn(err)
    }
    
  }, [codeUserAttemptKey])
  const [nTries, setNTries] = useState(0)

  useEffect(() => {
    if (showFeedback && !isGeneratingCorrectness) {
      setNTries(ntries => ntries + 1)
      if (correctnessFeedback?.correct) {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 }
        };

        function fire(particleRatio: number, opts: any) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        }

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        });
        fire(0.2, {
          spread: 60,
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      } else {
        
      }
    }
  }, [showFeedback, yourAttemptCode, solution, isGeneratingCorrectness])

  const handleGenerateCorrectness = async (input: string) => {
    const correctnessKey = input
    setIsGeneratingCorrectness(true);
    const object = await generateCorrectness(input);
    setCorrectness(correctness => {
      const correctness2 = correctness
      correctness2.set(correctnessKey, {...correctness2.get(correctnessKey), ...object.correctness})
      return new Map(correctness2)
    })
    setIsGeneratingCorrectness(false);
  };
  
  useEffect(() => {
    if(yourAttemptCode){
      const handleSetCodeAttempt = async () => {
        await setData(codeUserAttemptKey, yourAttemptCode)
      }
      handleSetCodeAttempt()
    }
  }, [codeUserAttemptKey, yourAttemptCode])
  const [enabledGetExp, setEnabledGetExp] = useState<boolean>(false)
  useEffect(() => {
    if(correctnessFeedback && correctnessFeedback?.correct && correctnessFeedback?.expPointsWon > 0) {
      
      // TODO: only enable get exp if they haven't already collected it
      //if(!hasCollectedExp){

        setEnabledGetExp(true)
     // }
      
      // setEnabledGetExp(true)
      // setExpPoints((n: number) => n+10 : 0)
    }
  }, [correctnessFeedback, setExpPoints, codeUserAttemptKey])
  
  const handleGetExp = useCallback((exp: number = 10) => {
    const handler = async () => {
      // if(!hasCollectedExp) await setData(codeUserAttemptKey+".hasCollectedExp", true)
      // if(typeof exp == 'number' && exp > 0) await setData("experiencePoints", experiencePoints+exp)
      setExpPoints((e: number) => e + exp)
      // setHasCollectedExp(true)
    }
    handler()
  }, [codeUserAttemptKey, experiencePoints, setExpPoints])
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">{challenge.challenge}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2"><strong>Level:</strong> {challenge.level}</p>
        <p className="mb-2"><strong>Help:</strong> {challenge.hintInfo}</p>

        {isCode && <><strong>Fix this code:</strong><div className="mt-2 p-4 bg-gray-100 rounded">
          <pre className="whitespace-break-spaces"><code dangerouslySetInnerHTML={{ __html: codeProblemHTML }} /></pre>
          {!!codeProblemExtraHTML && <details>
            <summary>Additional code</summary>
            <pre className="whitespace-break-spaces"><code dangerouslySetInnerHTML={{ __html: codeProblemExtraHTML }} /></pre>
          </details>}
        </div>
        </>}
        {isCode && <>
          <>
            <Label htmlFor="code-solution">Type your answer below:</Label>
            <Editor
              id="code-solution"
              placeholder="your answer goes here"
              value={yourAttemptCode}
              onValueChange={(code: string) => {
                setYourCode(code)
              }}
              highlight={(code: string) => code ? prismaHighlight(code, !!language && language in languages ? languages[language] : languages.js) : null}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,

              }}
            />
            <Button
              onClick={() => {
                handleGenerateCorrectness(promptForCorrectnessFeedback)

                setShowFeedback(!showFeedback)
              }}
              className="mt-4"
            >
              {showFeedback ? correctnessFeedback?.correct ? 'Close feedback' : 'Try again' : 'Check answer'}
            </Button>
          </>
          {showFeedback && (
            <div className="mt-2 p-4 bg-gray-100 rounded">
              <label>Feedback:</label>
              {isGeneratingCorrectness ? 'Generating Feedback...' : null}
              <p>{!!correctnessFeedback?.feedback && (correctnessFeedback?.correct ? 'Well done, Correct!' : 'Update your answer and try again.')}</p>
              <p>{correctnessFeedback?.feedback}</p>
              {!correctnessFeedback?.correct && nTries >= maxTries && <Button
                onClick={() => {
                  setShowSolution(showSolution => !showSolution)
                }}
                className="mt-4"
              >
                {showSolution ? 'Hide Solution' : 'See Solution'}
              </Button>}
              {correctnessFeedback?.correct ? <div>That was worth {correctnessFeedback.expPointsWon} exp. points. {(enabledGetExp) && <Button className="hover:underline hover:scale-105" onClick={async () => {
                if(enabledGetExp){
                  handleGetExp(correctnessFeedback.expPointsWon)
                 // allowGetExpLock.current = false
                 setEnabledGetExp(false)
                } else {
                  alert("Something went wrong getting your exp. or you already received it.")
                 // setEnabledGetExp(false)
                }

              }}>Collect exp.</Button>}</div> : null}
              {(showSolution || correctnessFeedback?.correct )&& <div>
                <label>GPTs solution:</label>
                <pre className="whitespace-break-spaces"><code dangerouslySetInnerHTML={{ __html: codeSolutionHTML }} /></pre>
                <label>Additional code:</label>
                <pre className="whitespace-break-spaces"><code dangerouslySetInnerHTML={{ __html: codeSolutionExtraHTML }} /></pre>
                <details><summary>Extra info:</summary><div>{challengeHelpInfoUser}</div>
                <div>{challengeHelpInfoSolution}</div></details>
              </div>}

            </div>
          )}
        </>}
      </CardContent>
    </Card>
  );
};

export const LessonsContent: React.FC<{ isGenerating: boolean, lessonsData: Lesson[], generateMoreChallenges: (challenges: Challenge[]) => void }> = ({ lessonsData, generateMoreChallenges, isGenerating}) => {
  return (lessonsData?.map((lessonData, index) => (
    <div key={lessonData?.challenge || "challenge-"+index}>
      <h2 className="text-2xl font-bold mb-4">{lessonData.challenge}</h2>
      <p className="mb-6">{lessonData.hintInfo}</p>
      <h3 className="text-xl font-semibold mb-4">Challenge</h3>
      {lessonData?.challenges?.map((challenge: Challenge, index: number) => (
        <ChallengeCard key={index} challenge={challenge} language={lessonData?.language.toLowerCase()} />
      ))}
      {!isGenerating && <Button className="mt-4" onClick={() => {
        generateMoreChallenges(lessonData?.challenges)
      }}>
        Generate more challenges
      </Button>}
    </div>
  )))
}

