import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'
import { highlight } from 'sugar-high'
import Editor from 'react-simple-code-editor';
import { highlight as prismaHighlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another
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
  const solution = challenge?.code?.[0]?.solution
  const questionStarter = challenge?.code?.[0]?.questionStarter
  const codeStarterHTML =  questionStarter ? highlight(questionStarter) : ''
  const codeSolutionHTML = solution ? highlight(solution) : ''
  const [yourAttemptCode, setYourCode] = useState(
    questionStarter
  );
  useEffect(() => {
    setYourCode(questionStarter)
  }, [questionStarter])
  useEffect(() => {
    if(showSolution){
      if(yourAttemptCode === solution){
        alert("*Confetti falls* - your solutions match!")
      }
    }
  }, [showSolution, yourAttemptCode, solution])
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">{challenge.challenge}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2"><strong>Level:</strong> {challenge.level}</p>
        <p className="mb-2"><strong>Help:</strong> {challenge.helpInfo}</p>
        <div className="mt-2 p-4 bg-gray-100 rounded">
          <pre><code dangerouslySetInnerHTML={{ __html: codeStarterHTML }} /></pre>
        </div>
       {language && <>
       <label>Type your answer below:</label>
       <Editor
          value={yourAttemptCode}
          onValueChange={(code: string) => setYourCode(code)}
          highlight={(code: string) => prismaHighlight(code, language in languages ? languages[language] : languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}
        /></>}
        <Button 
          onClick={() => setShowSolution(!showSolution)} 
          className="mt-4"
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </Button>
        {showSolution && (
          <div className="mt-2 p-4 bg-gray-100 rounded">
            <pre><code dangerouslySetInnerHTML={{ __html: codeSolutionHTML }} /></pre>
          </div>
        )}
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
        <ChallengeCard key={index} challenge={challenge} language={lessonData.language.toLowerCase()}/>
      ))}
    </div>
  );
};

