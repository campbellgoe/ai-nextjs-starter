import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'
import { highlight } from 'sugar-high'
import Editor from 'react-simple-code-editor';
import { highlight as prismaHighlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another
import confetti from 'canvas-confetti'
import { generateCorrectness } from "@/app/actions/actions";
import { readStreamableValue } from "ai/rsc";
interface Challenge {
  challenge: string;
  helpInfo: string;
  level: string;
  code: {
    solution: string;
    questionStarter: string;
  }[];
}

interface LessonData {
  topic: string;
  language: string;
  helpInfo: string;
  challenges: Challenge[];
}

const ChallengeCard: React.FC<{ challenge: Challenge; language: string; }> = ({ challenge, language }) => {
  const [showSolution, setShowSolution] = useState(false);
  const [isGeneratingCorrectness, setIsGeneratingCorrectness] = useState(false);
  const [correctness, setCorrectness] = useState<Map<string, any>>(new Map());
  const solution = challenge?.code?.[0]?.solution
  const questionStarter = challenge?.code?.[0]?.questionStarter
  const codeStarterHTML = questionStarter ? highlight(questionStarter) : ''
  const codeSolutionHTML = solution ? highlight(solution) : ''
  const [yourAttemptCode, setYourCode] = useState(
    questionStarter
  );
  const isCode = (codeStarterHTML && codeSolutionHTML)
  const promptForCorrectnessFeedback = `User attempt code:
${yourAttemptCode}
Challenge/Question:
${challenge.challenge}
Hint:
${challenge.helpInfo}
Our solution:
${solution}`
const feedback = correctness.get(promptForCorrectnessFeedback)

  useEffect(() => {
    setYourCode(questionStarter)
  }, [questionStarter])
  useEffect(() => {
    if (showSolution && !isGeneratingCorrectness) {
      if(feedback?.correct) {
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
      }
    }
  }, [showSolution, yourAttemptCode, solution, isGeneratingCorrectness])
 
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
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">{challenge.challenge}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2"><strong>Level:</strong> {challenge.level}</p>
        <p className="mb-2"><strong>Help:</strong> {challenge.helpInfo}</p>

        {isCode && <div className="mt-2 p-4 bg-gray-100 rounded">
          <pre><code dangerouslySetInnerHTML={{ __html: codeStarterHTML }} /></pre>
        </div>}
        {isCode && <>
          <label>Type your answer below:</label>
          <Editor
            value={yourAttemptCode}
            onValueChange={(code: string) => setYourCode(code)}
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

              setShowSolution(!showSolution)
            }}
            className="mt-4"
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </Button>
          {showSolution && (
            <div className="mt-2 p-4 bg-gray-100 rounded">
              <label>Our solution:</label>
              <pre><code dangerouslySetInnerHTML={{ __html: codeSolutionHTML }} /></pre>
              <label>Feedback:</label>
              {isGeneratingCorrectness ? 'Generating feedback...' : null}
              <p>{feedback?.feedback}</p>
            </div>
          )}
        </>}
      </CardContent>
    </Card>
  );
};

export const LessonContent: React.FC<{ lessonData: LessonData }> = ({ lessonData }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{lessonData.topic} in {lessonData.language}</h2>
      <p className="mb-6">{lessonData.helpInfo}</p>
      <h3 className="text-xl font-semibold mb-4">Challenges:</h3>
      {lessonData?.challenges?.map((challenge, index) => (
        <ChallengeCard key={index} challenge={challenge} language={lessonData?.language.toLowerCase()} />
      ))}
    </div>
  );
};

