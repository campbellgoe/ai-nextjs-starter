import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useRef, useState } from 'react'
import { highlight } from 'sugar-high'
import Editor from 'react-simple-code-editor';
// @ts-ignore
import { highlight as prismaHighlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another
import confetti from 'canvas-confetti'
import { generateCorrectness } from "@/app/actions/actions";
import { readStreamableValue } from "ai/rsc";
import { Label } from "./ui/label";
// import { slugify } from "@/lib/utils";
export interface Challenge {
  challenge: string;
  helpInfo: string;
  level: string;
  codeComplete: {
    solution: string;
    additionalCode: string;
    helpInfo: string;
  }
  codeExamplesIncomplete: {
    problem: string;
    additionalCode: string;
    helpInfo: string;
  }
}

interface LessonData {
  topic: string;
  language: string;
  helpInfo: string;
  challenges: Challenge[];
}

const ChallengeCard: React.FC<{ input: string, challenge: Challenge; language: string; }> = ({ challenge, language, input }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSolution, setShowSolution] = useState(false)
  const [isGeneratingCorrectness, setIsGeneratingCorrectness] = useState(false);
  const [correctness, setCorrectness] = useState<Map<string, any>>(new Map());

          
  const solution = challenge?.codeComplete?.solution
  const problem = challenge?.codeExamplesIncomplete?.problem
  const solutionExtra = challenge?.codeComplete?.additionalCode
  const problemExtra = challenge?.codeExamplesIncomplete?.additionalCode
  const codeProblemHTML = problem ? highlight(problem) : ''
  const codeSolutionHTML = solution ? highlight(solution) : ''
  const codeProblemExtraHTML = problemExtra ? highlight(problemExtra) : ''
  const codeSolutionExtraHTML = solutionExtra ? highlight(solutionExtra) : ''
  const [challengeHelpInfoUser, challengeHelpInfoSolution] = [challenge?.codeExamplesIncomplete?.helpInfo, challenge?.codeComplete?.helpInfo]
  const [yourAttemptCode, setYourCode] = useState(
    ''
  );
  const isCode = (codeProblemHTML && codeSolutionHTML)
  const promptForCorrectnessFeedback = `User attempt code:
${yourAttemptCode}
Challenge/Question:
${challenge.challenge}
Hint:
${challenge.helpInfo}
`
  const correctnessFeedback = correctness.get(promptForCorrectnessFeedback)
const maxTries = 2
const localCodeKey = useMemo(() => "code.userAttempt."+input,[input]) 
  useEffect(() => {
    
    let storedCode = ''
    try {
      storedCode = localStorage.getItem(localCodeKey) || ''
      console.log('stored code', localCodeKey, storedCode)
    } catch(err){

    }
    if(!!storedCode){
      setYourCode(storedCode)
    } else {
      setYourCode(problem === solution ? '' : problem)
    }
  }, [localCodeKey, problem, solution])
  const [nTries, setNTries] = useState(0)

  useEffect(() => {
    if (showFeedback && !isGeneratingCorrectness) {
      setNTries(ntries => ntries + 1)
      if (correctnessFeedback?.correct) {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 }
        };

        function fire(particleRatio: number, opts: {}) {
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
    setIsGeneratingCorrectness(true);
    const { data } = await generateCorrectness(input);
    
    for await (const partialObject of readStreamableValue(data)) {
      if (partialObject && partialObject.correctness) {
        const newCorrectness = partialObject.correctness
        setCorrectness(prevCorrectness => {
          const updatedCorrectness = new Map(prevCorrectness);
          updatedCorrectness.set(input, newCorrectness);
          return updatedCorrectness;
        });
      }
    }
    setIsGeneratingCorrectness(false);
  };
  
  useEffect(() => {
    if(yourAttemptCode){
      localStorage.setItem(localCodeKey, yourAttemptCode)
    }
  }, [localCodeKey, yourAttemptCode])
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">{challenge.challenge}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2"><strong>Level:</strong> {challenge.level}</p>
        <p className="mb-2"><strong>Help:</strong> {challenge.helpInfo}</p>

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
            <Label htmlFor="code-solution">Type your solution below:</Label>
            <Editor
              id="code-solution"
              placeholder="solution goes here"
              value={yourAttemptCode}
              onValueChange={(code: string) => {
                setYourCode(code)
              }}
              highlight={(code: string) => code ? prismaHighlight(code, !!language && language in languages ? languages[language] : languages.js) : null}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
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
              <p>{!correctnessFeedback?.feedback && (correctnessFeedback?.correct ? 'Well done, Correct!' : 'Update your answer and try again.')}</p>
              <p>{correctnessFeedback?.feedback}</p>
              {!correctnessFeedback?.correct && nTries >= maxTries && <Button
                onClick={() => {
                  setShowSolution(showSolution => !showSolution)
                }}
                className="mt-4"
              >
                {showSolution ? 'Hide Solution' : 'See Solution'}
              </Button>}
              {correctnessFeedback?.correct && correctnessFeedback?.expPointsWon > 0 ? <div>That was worth {correctnessFeedback.expPointsWon} exp. points.</div> : null}
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

export const LessonsContent: React.FC<{ input: string, lessonsData: LessonData[], generateMoreChallenges: (challenges: Challenge[]) => void }> = ({ lessonsData, generateMoreChallenges , input }) => {
  return <>{(lessonsData?.map(lessonData => (
    <div key={lessonData.topic}>
      <h2 className="text-2xl font-bold mb-4">{lessonData.topic}</h2>
      <p className="mb-6">{lessonData.helpInfo}</p>
      <h3 className="text-xl font-semibold mb-4">Challenge</h3>
      {lessonData?.challenges?.map((challenge: Challenge, index: number) => (
        <ChallengeCard input={input} key={index} challenge={challenge} language={lessonData?.language.toLowerCase()} />
      ))}
      {/* <Button onClick={() => {
        generateMoreChallenges(lessonData?.challenges)
      }}>
        Generate more challenges
      </Button> */}
    </div>
  )))}</>
}

