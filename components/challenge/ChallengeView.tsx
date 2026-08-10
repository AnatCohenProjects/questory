'use client';

import { ChallengeData } from '@/types/challenge';
import CipherChallenge from './CipherChallenge';
import CipherWheelsChallenge from './CipherWheelsChallenge';
import PatternChallenge from './PatternChallenge';
import OddOneOutChallenge from './OddOneOutChallenge';
import TriviaChallenge from './TriviaChallenge';
import PuzzleChallenge from './PuzzleChallenge';
import ImagePuzzleChallenge from './ImagePuzzleChallenge';

interface ChallengeViewProps {
  challenge: ChallengeData;
  /** מחובר ישירות ל-setAnswer של StationView */
  onCodeChange: (code: string) => void;
}

/**
 * מנתב לקומפוננטת האתגר המתאימה לפי הטיפוס.
 * Cipher הוא display-only — השחקן מפענח ומקיש בשדה הרגיל.
 * שאר הטיפוסים הם אינטראקטיביים ומעדכנים את הקוד ישירות.
 */
export default function ChallengeView({ challenge, onCodeChange }: ChallengeViewProps) {
  switch (challenge.type) {
    case 'cipher':
      return <CipherChallenge challenge={challenge} />;
    case 'cipherWheels':
      return <CipherWheelsChallenge challenge={challenge} />;
    case 'pattern':
      return <PatternChallenge challenge={challenge} onCodeChange={onCodeChange} />;
    case 'oddoneout':
      return <OddOneOutChallenge challenge={challenge} onCodeChange={onCodeChange} />;
    case 'trivia':
      return <TriviaChallenge challenge={challenge} onCodeChange={onCodeChange} />;
    case 'puzzle':
      return <PuzzleChallenge challenge={challenge} onCodeChange={onCodeChange} />;
    case 'imagePuzzle':
      return <ImagePuzzleChallenge challenge={challenge} onCodeChange={onCodeChange} />;
    default:
      return null;
  }
}
