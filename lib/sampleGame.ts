import { Game } from '@/types/game';
import { ChallengeData } from '@/types/challenge';

export const sampleGame: Game = {
  id: 'sample-001',
  title: 'מסתורין של הכוכב האבוד',
  story: 'לפני מאות שנים, אסטרונום מפורסם נעלם בלי שנותר ממנו זכר. הוא השאיר אחריו שלושה רמזים — מוסתרים בשלושה מקומות שאהב. האם תצליחו לפתור את מסתורי היעלמותו?',
  duration: '45 דקות',
  difficulty: 'מתקדם',
  character: {
    name: 'פרופסור קווסטו',
    tone: 'מסתורי, נלהב, אוהב חידות. משתמש בשפה עשירה אך ברורה. מעודד ולא מגלה יותר מדי.',
    avatarUrl: undefined,
  },
  stations: [
    {
      id: 0,
      triggerType: 'code',
      triggerValue: '1',
      navigationHint: 'פנו לספרייה. הקוד נמצא מודבק על דלת הכניסה.',
      narrative: 'האסטרונום אהב לצפות בשמיים מגג הספרייה. שם, בין הספרים הישנים, הוא הסתיר את הרמז הראשון.',
      narrativeMedia: { type: 'image', url: '/north-star.jpg', caption: 'כוכב הצפון — המצפן של האסטרונום' },
      task: 'פתחו את הספר שלפניכם בעמוד הראשון — שם מודפסים שלושה סמלים. השתמשו במפתח הצופן כדי להמיר אותם לקוד.',
      hints: [
        'שלושת הסמלים מודפסים בכותרת עמוד 1 של הספר שלפניכם.',
        'השתמשו במפתח הצופן שמופיע למטה כדי להמיר כל סמל לספרה.',
        'הסמלים מופיעים בסדר: ★ ואחריו ◆ ואחריו ▲ — פענחו לפי המפתח.',
      ],
      answer: '742',
      challenge: {
        type: 'cipher',
        key: [
          { symbol: '★', digit: '7' },
          { symbol: '◆', digit: '4' },
          { symbol: '▲', digit: '2' },
        ],
        encodedMessage: ['★', '◆', '▲'],
        solution: '742',
      } satisfies ChallengeData,
    },
    {
      id: 1,
      triggerType: 'code',
      triggerValue: '2',
      navigationHint: 'צאו לגינה. הקוד חקוק על האבן שליד העץ הגדול.',
      narrative: 'מצוין! הרמז הראשון חשף שהאסטרונום הסתיר את כלי עבודתו בגינה. שם, ליד עץ העתיק, חיכה לו סוד נוסף.',
      task: 'ליד האבן תמצאו סדרת מספרים חרוטה עם שני מספרים חסרים. מלאו אותם — הקוד שתקבלו פותח את השלב הבא.',
      hints: [
        'האבן קרובה לעץ הגדול ביותר בגינה.',
        'הסדרה פועלת לפי חוק קבוע — בדקו את היחס בין כל שני מספרים עוקבים.',
        'כל מספר כפול בשניים. 2, 4, 8, ?, 32, ? — מלאו את שני החסרים.',
      ],
      answer: '16 64',
      challenge: {
        type: 'pattern',
        items: [2, 4, 8, null, 32, null],
        blankCount: 2,
        patternHint: 'כל מספר כפול בשניים',
        solution: '16 64',
      } satisfies ChallengeData,
    },
    {
      id: 2,
      triggerType: 'code',
      triggerValue: '3',
      navigationHint: 'כנסו לבניין הראשי. הקוד על השלט ליד השעון הגדול בלובי.',
      narrative: 'מדהים! שני רמזים בידיכם. האסטרונום הסתיר את המפתח האחרון — המפתח לפתרון כל המסתורין — דווקא במקום הכי גלוי שיש.',
      task: 'מי מהגופים האלה אינו כוכב לכת? בחרו נכון — הספרה שתקבלו היא המפתח האחרון.',
      hints: [
        'כוכבי לכת הם גופים שמקיפים את השמש — לא כוכבים ולא ירחים.',
        'מאדים, נוגה, שבתאי, צדק — כולם כוכבי לכת. מה בנוגע לשמש ולירח?',
        'הירח הוא לוויין של כדור הארץ, לא כוכב לכת. בחרו "ירח" — הספרה שלו היא 3.',
      ],
      answer: '3',
      challenge: {
        type: 'oddoneout',
        groupLabel: 'מי לא שייך לקבוצה?',
        items: [
          { id: 'a', label: 'מאדים', isOdd: false },
          { id: 'b', label: 'נוגה', isOdd: false },
          { id: 'c', label: 'ירח', isOdd: true, digitContribution: '3' },
          { id: 'd', label: 'שבתאי', isOdd: false },
          { id: 'e', label: 'צדק', isOdd: false },
          { id: 'f', label: 'שמש', isOdd: false },
        ],
        oddCount: 1,
        solution: '3',
      } satisfies ChallengeData,
    }
  ]
};
