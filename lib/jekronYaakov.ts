import { Game } from '@/types/game';
import { ChallengeData } from '@/types/challenge';

export const jekronYaakov: Game = {
  id: 'jekron-yaakov-tour',
  title: 'סיירת דיכרון יעקב — רחוב זיכרון',
  story: 'סיור היסטורי במדרחוב הירושלמי, מעקבות אחרי דיכרונות של הרחוב הקדום, סימנים וחתימות על קירות העתיקים, וחידות היסטוריות הקשורות למקום.',
  imageUrl: 'https://images.unsplash.com/photo-1570719030706-fff4b0b55313?w=400&h=500&fit=crop',
  duration: '45 דקות',
  difficulty: 'בינוני',
  character: {
    name: 'מדריך דיכרון',
    tone: 'מכבד, יהודי וקונסרבטיבי, מספר סיפורים היסטוריים בחוכמה, מעודד, לא חושף יותר מדי. מתחבר לסיפורים ולהיסטוריה.',
    avatarUrl: undefined,
  },
  stations: [
    {
      id: 0,
      triggerType: 'code',
      triggerValue: '1',
      navigationHint: 'בדקו בעיון את הדלת לפניכם.',
      narrative: 'בלב המדרחוב העתיק עומדת דלת מעוטרת, המוכרת לכל תושבי הרחוב כ"דלת דרקון". סימן זה הוא אחד מהסימנים הקדומים של הרחוב, אמור להגן על הבית מכל רע. הדרקונים החרוטים בדלת הם מלאכת ידי נוסך מקצועי.',
      narrativeMedia: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop',
        caption: 'דלת עתיקה בירושלים עם עיטורים מסורתיים',
      },
      task: 'בדקו בעיון את הדלת לפניכם. כמה דרקונים מעוצבים תוכלו לספור בעיטור? הספרה שתמצאו היא החלק הראשון של קוד הפתיחה.',
      hints: [
        'דרקונים קטנים מעוטים בצורות שונות — חלקם מלאים וחלקם מתוארים בקו דק.',
        'בדקו את הזוויות העליונות של הדלת — שם מרוכזת עבודת הנוסך.',
        'בדקו בעיון את הפינה השמאלית העליונה — שם יש 3 דרקונים. בפינה הימנית העליונה יש 2 דרקונים. סה"כ 5 דרקונים.',
      ],
      answer: '5',
      challenge: {
        type: 'trivia',
        question: 'כמה דרקונים מעוטרים את הדלת לפניכם?',
        options: [
          { id: '1', text: '3 דרקונים', isCorrect: false },
          { id: '2', text: '5 דרקונים', isCorrect: true },
          { id: '3', text: '7 דרקונים', isCorrect: false },
          { id: '4', text: '9 דרקונים', isCorrect: false },
        ],
        solution: '5',
      } satisfies ChallengeData,
    },
    {
      id: 1,
      triggerType: 'code',
      triggerValue: '2',
      navigationHint: 'פנו לאבן בדופן הבניין.',
      narrative: 'האבן בדופן של הבניין הישן הזה חקוקה בכתב עברי ישן. יהודים רבים בדרך עצרו כאן לתפילה בדיוק לפני מאות שנים. השם שחקוק בו הוא של דרבן מפורסם שהדריך את הקהילה בחוכמה ובהגיון.',
      narrativeMedia: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1599002918176-5610f920f3cc?w=400&h=300&fit=crop',
        caption: 'כתב עברי חקוק בקיר עתיק',
      },
      task: 'קראו את השם החקוק על האבן. השם מכיל מספר אותיות. ספרו אותן בעיון. כמה אותיות יש בשם?',
      hints: [
        'פנו לאבן בדופן שמאל של דלת הכניסה.',
        'השם חקוק בקו עמוק וברור — הוא מכיל שמו של הדרבן.',
        'בשם "אדם יוסף" לדוגמה יש 7 אותיות. אם השם הוא "יוחנן בן דוד" יש 10 אותיות.',
      ],
      answer: '8',
      challenge: {
        type: 'pattern',
        items: [1, 1, 2, 3, 5, null, 13],
        blankCount: 1,
        patternHint: 'כל מספר הוא סכום של שני המספרים הקודמים (סדרת פיבונאצ\'י)',
        solution: '8',
      } satisfies ChallengeData,
    },
    {
      id: 2,
      triggerType: 'code',
      triggerValue: '3',
      navigationHint: 'כנסו לבניין וחפשו לוח הקדשה.',
      narrative: 'בבית הזה התגורר ח"י כהן, חוקר היהדות המפורסם. כאן כתב את רוב ספריו, וכאן קיבל את תלמידיו ומלומדים ממקומות רחוקים. בית קדום משנת 1900, עם סימנים היסטוריים על קירותיו.',
      narrativeMedia: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1516811591004-38bdf84e5888?w=400&h=300&fit=crop',
        caption: 'בית היסטורי ירושלמי משנת 1900',
      },
      task: 'בבית זה התגורר דמות היסטורית חשובה. קראו בעיון את לוח ההקדשה שמעל הדלת. בחרו מהרשימה הבאה — מי מהפילוסופים שלא היה בעל הבית — החוקר?',
      hints: [
        'ח"י כהן (חיים כהן) הוא חוקר ישראלי. שמו חקוק על הלוח מעל הדלת.',
        'בחרו במישהו שלא היה חוקר יהדות או עוברי דור של הבית הזה.',
        'מרטין היידגר היה פילוסוף גרמני — הוא לא התגורר או עבד בבית דיכרון יעקב.',
      ],
      answer: '4',
      challenge: {
        type: 'oddoneout',
        groupLabel: 'מי לא שייך לקבוצה של חוקרי היהדות שעבדו בבית זה בירושלים?',
        items: [
          { id: '1', label: 'חיים כהן', isOdd: false },
          { id: '2', label: 'יהודה ליאון', isOdd: false },
          { id: '3', label: 'ישראל מלמד', isOdd: false },
          { id: '4', label: 'מרטין היידגר', isOdd: true, digitContribution: '4' },
          { id: '5', label: 'דוד בלבו', isOdd: false },
        ],
        oddCount: 1,
        solution: '4',
      } satisfies ChallengeData,
    },
  ],
};
