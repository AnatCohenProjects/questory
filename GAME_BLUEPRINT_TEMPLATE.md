# Questory Game Blueprint — תבנית ייצור משחקים

## איך להשתמש בתבנית זו

**שלב 1:** מלאו את פרטי המשחק בקטע "Game Meta"
**שלב 2:** תארו כל תחנה בקטע "Station"
**שלב 3:** העבירו להנדסאי AI (Claude/אחר) עם ההוראה:
```
צרו משחק Questory מלא בן 3 תחנות על בסיס Blueprint זה.
החזירו JSON שאני אוכל להזין ל-/api/load-custom-game
```

---

## הגדרות Game Meta

| שדה | סה"כ תווים | דוגמה | הערות |
|-----|-----------|-------|-------|
| **title** | 1-100 | "סיירת דיכרון יעקב" | שם המשחק |
| **story** | 20-500 | "סיור היסטורי במדרחוב..." | הקשר כללי של המשחק |
| **experienceStyle** | — | `story` / `competitive` / `learning` | סוג המשחק — קובע הגדרות אוטו |
| **duration** | — | "45 דקות" | אמד משך המשחק |
| **difficulty** | — | "בינוני" | קל / בינוני / מתקדם |
| **audience** | — | "משפחות" | קהל היעד |
| **character.name** | 1-50 | "מדריך דיכרון" | שם דמות ה-AI המדריך |
| **character.tone** | 50-300 | "מכבד, מספר סיפורים..." | טון ואישיות DM AI |

---

## הגדרות Station (לכל תחנה)

| שדה | סה"כ תווים | דוגמה | סוג | חובה | הערות |
|-----|-----------|-------|------|------|-------|
| **trigger.type** | — | `code` / `qr` / `gps` | סטרינג | ✓ | סוג הכניסה לתחנה |
| **trigger.value** | 1-20 | "1" / "42" | סטרינג | ✓ | הערך בפועל (קוד / ID QR / למ"ס) |
| **navigationHint** | 20-100 | "פנו לקיר השמאלי" | סטרינג | ✓ | הנחיה לשחקנים איך להגיע |
| **narrative** | 50-300 | "בבית זה התגורר..." | טקסט | ✓ | רקע היסטורי / סיפורי |
| **task** | 50-200 | "ספרו כמה דרקונים..." | טקסט | ✓ | ההוראה למה לעשות |
| **hints[0]** | 30-100 | "טיפ ראשון כללי" | סטרינג | ✓ | רמז 1 — כיווני |
| **hints[1]** | 30-100 | "טיפ שני — יותר פרטי" | סטרינג | ✓ | רמז 2 — מפרט יותר |
| **hints[2]** | 30-100 | "טיפ שלישי — כמעט תשובה" | סטרינג | ✓ | רמז 3 — וירטואלי תשובה |
| **answer** | 1-20 | "5" / "16 64" / "4" | סטרינג | ✓ | התשובה הנכונה (קוד למעבר) |
| **challenge.type** | — | `trivia` / `pattern` / `oddoneout` / `cipher` | סוג | — | סוג אתגר אופציונלי |
| **challenge.content** | — | (ראה להלן) | ובייקט | — | תוכן ה-Challenge לפי סוג |

---

## Challenge Types — תוכן לפי סוג

### 1️⃣ **Trivia (שאלת ידע)**
```
challenge:
  type: trivia
  question: "כמה דרקונים מעוטרים את הדלת?"
  options:
    - text: "3 דרקונים"
      isCorrect: false
    - text: "5 דרקונים"
      isCorrect: true  ← זו הנכונה
    - text: "7 דרקונים"
      isCorrect: false
    - text: "9 דרקונים"
      isCorrect: false
  solution: "5"
```

### 2️⃣ **Pattern (המשך סדרה)**
```
challenge:
  type: pattern
  items: [1, 1, 2, 3, 5, null, 13]  ← null = תא ריק
  blankCount: 1
  patternHint: "כל מספר הוא סכום של שני הקודמים"
  solution: "8"
```

### 3️⃣ **OddOneOut (מי לא שייך)**
```
challenge:
  type: oddoneout
  groupLabel: "מי לא שייך לקבוצה?"
  items:
    - label: "חיים כהן"
      isOdd: false
    - label: "יהודה ליאון"
      isOdd: false
    - label: "מרטין היידגר"
      isOdd: true
      digitContribution: "4"  ← הספרה שתורמת לקוד
    - label: "דוד בלבו"
      isOdd: false
  oddCount: 1
  solution: "4"
```

### 4️⃣ **Cipher (צופן)**
```
challenge:
  type: cipher
  key:
    - symbol: "★"
      digit: "7"
    - symbol: "◆"
      digit: "4"
    - symbol: "▲"
      digit: "2"
  encodedMessage: ["★", "◆", "▲"]
  solution: "742"
```

---

## דוגמה מלאה — Blueprint לAI

```yaml
QUESTORY GAME BLUEPRINT
======================

GAME META
---------
Title: סיור בשביל הכוכבים
Story: סיור קוסמי במצפה הכוכבים העתיק. שחקנים עוקבים אחרי מפה כוכבית שמובילה לגילוי של גלקסיה חדשה.
Experience Style: story
Duration: 40 דקות
Difficulty: בינוני
Audience: משפחות + בני נוער
Character Name: אסטרונום רביד
Character Tone: התלהבות מדע, מעודד ללא ספויילר, משתמש בשאלות חוקרות

STATIONS (3)
============

STATION 1
---------
Trigger Type: code
Trigger Value: "1"
Navigation Hint: עלו לגג המצפה. בדקו את הטלסקופ שמד בדרום.

Narrative:
בראש המצפה, בין כלי המדידה הישנים, שוכן הטלסקופ הגדול של המאה ה-19.
דרכו צפויות לא בדיוק אלפיים אסטרונומים על הכוכבים.

Task:
דרך הטלסקופ תוכלו לראות קבוצת כוכבים. כמה כוכבים בעלי ברק חזק יש בקבוצה זו?

Hint 1: כוכבים בעלי ברק חזק בעיקר בפינה השמאלית של השדה.

Hint 2: ספרו רק את הכוכבים שנראים כנוצץ/מוזהר — לא כל הכוכבים.

Hint 3: בפינה השמאלית העליונה יש 3 כוכבים, מימין 2, בתחתית 1. סה"כ 6.

Answer: 6

Challenge Type: trivia
Challenge Content:
  Question: כמה כוכבים בעלי ברק חזק?
  Options:
    - 4 (false)
    - 6 (TRUE)
    - 8 (false)
    - 10 (false)
  Solution: 6

---

STATION 2
---------
Trigger Type: code
Trigger Value: "2"
Navigation Hint: בחדר הערכות. בדקו את המפה הכוכבית על הקיר הדרומי.

Narrative:
בפנים, על קיר הצפון, תלויה מפה כוכבית ענקית מנייר וחלב.
מפה זו נערכה לפני 150 שנה וממנה יוצא חוט עקום המצביע על נקודה מסתורית בשמיים.

Task:
על המפה כתובה סדרה מספרית שמייצגת את קואורדינטות כוכב מסתורי.
השלימו את הסדרה: 2, 4, 7, 11, _, 22 — מה המספר החסר?

Hint 1: כל מספר מוסיפים לו בהדרגתיות גדלות יותר.

Hint 2: יוצא כי מוסיפים 2, אח"כ 3, אח"כ 4, אח"כ 5...

Hint 3: 11 + 5 = 16. המספר החסר הוא 16.

Answer: 16

Challenge Type: pattern
Challenge Content:
  Items: [2, 4, 7, 11, null, 22]
  BlankCount: 1
  PatternHint: כל פעם מוסיפים מספר גדול בהדרגה
  Solution: 16

---

STATION 3
---------
Trigger Type: code
Trigger Value: "3"
Navigation Hint: בחדר התוצאות. בדקו את השיא התיעוד על החומר הגלקטי.

Narrative:
בחדר הסיום, בקרן הזהב של המצפה, מציגים תיעוד של גילוי הגלקסיה החדשה.
כמה ממדענים שעבדו בגילוי — אבל אחד מהם לא היה אסטרונום.

Task:
בדקו את השמות של המדענים שגילו את הגלקסיה החדשה. מי שלא היה אסטרונום?

Hint 1: רובם עבדו בשמיים הלילה — אבל אחד עסק בדבר אחר.

Hint 2: דרו האחרון בתיעוד היה מהנדס בנייה — הוא תכנן את המבנה של המצפה.

Hint 3: בחרו "אריק הנדסון" — הוא המהנדס שתכנן את המצפה, לא אסטרונום.

Answer: 2

Challenge Type: oddoneout
Challenge Content:
  GroupLabel: מי לא שייך לקבוצה?
  Items:
    - label: תומס הי. סימון (אסטרונום)
      isOdd: false
    - label: מרי סומרויל (מתמטיקאית)
      isOdd: false
    - label: אריק הנדסון (מהנדס בנייה)
      isOdd: true
      digitContribution: 2
    - label: ג'ון ערל (פיזיקאי)
      isOdd: false
  OddCount: 1
  Solution: 2
```

---

## הוראות ל-AI (סדר זה לAPIגם)

כשתשלחי את ה-Blueprint הזה ל-Claude או AI אחר:

```
אני חזוקה על Questory — פלטפורמת משחקי חוויה אינטראקטיביים.
בתמונה לעיל – Game Blueprint – תבנית טקסטואלית למשחק בן 3 תחנות.

בואו נשלימו אותו:
1. שמרו על כל הפרמטרים מהתבנית (Trigger, Hints, Challenge Type וכו')
2. הוסיפו תוכן אמיתי מעניין בחרו שלפי הנושא/סיפור שתארתי
3. וודאו שכל אתגר מתאים להוראה ה-task
4. החזירו JSON שמנוסייִה לפורמט של Questory Game

פורמט JSON שחזרה אני אוכל להזין ישירות ל-/api/load-custom-game
```

---

## פורמט JSON שהAI צריך להחזיר

```json
{
  "id": "game-id-unique",
  "title": "שם המשחק",
  "story": "תיאור המשחק",
  "imageUrl": "https://...",
  "duration": "45 דקות",
  "difficulty": "בינוני",
  "character": {
    "name": "שם הדמות",
    "tone": "תיאור אישיות",
    "avatarUrl": null
  },
  "stations": [
    {
      "id": 0,
      "triggerType": "code",
      "triggerValue": "1",
      "navigationHint": "הנחיה",
      "narrative": "סיפור",
      "narrativeMedia": null,
      "task": "משימה",
      "hints": ["רמז1", "רמז2", "רמז3"],
      "answer": "5",
      "challenge": {
        "type": "trivia",
        "question": "שאלה",
        "options": [
          { "id": "a", "text": "אפשרות 1", "isCorrect": false },
          { "id": "b", "text": "אפשרות 2", "isCorrect": true }
        ],
        "solution": "5"
      }
    },
    //... stations 2 & 3
  ]
}
```

---

## מילות מפתח לAI

**בתוך Blueprint כתבו:**
- `[AI CHOOSE]` — בקשה ל-AI לבחור אפשרות
- `[CREATIVE]` — תן לAI לחדש וליצור
- `[HISTORICAL]` — בסיס היסטורי אמיתי
- `[CULTURAL]` — רגישות תרבותית

דוגמה:
```
Narrative: [HISTORICAL] סיפור אמיתי על מקום זה...
Task: [CREATIVE] משימה מעניינת שמשתמשת בסביבה...
```
