import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from 'react'

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

const ChallengeCard: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">{challenge.challenge}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2"><strong>Level:</strong> {challenge.level}</p>
        <p className="mb-2"><strong>Help:</strong> {challenge.helpInfo}</p>
        <details className="mt-4">
          <summary className="cursor-pointer font-semibold">Show Code</summary>
          <div className="mt-2 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap">{challenge?.code?.[0]?.questionStarter}</pre>
          </div>
        </details>
        <Button 
          onClick={() => setShowSolution(!showSolution)} 
          className="mt-4"
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </Button>
        {showSolution && (
          <div className="mt-2 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap">{challenge?.code?.[0]?.solution}</pre>
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
        <ChallengeCard key={index} challenge={challenge} />
      ))}
    </div>
  );
};

