'use client';

import { useState, useRef, useEffect } from 'react';
import { Game, GameSession } from '@/types/game';
import { getHint, sendMessage } from '@/lib/claude';

interface Message {
  role: 'user' | 'character';
  text: string;
}

interface AIHintChatProps {
  game: Game;
  session: GameSession;
  onBack: () => void;
  onHintUsed?: () => void;
}

export default function AIHintChat({ game, session, onBack, onHintUsed }: AIHintChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'character', text: `שלום! אני ${game.character.name}. איך אוכל לעזור לכם?` }
  ]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addResponse = async (userText: string, fetchFn: () => Promise<string>) => {
    if (loading) return;
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    const reply = await fetchFn();
    setMessages(prev => [...prev, { role: 'character', text: reply }]);
    setLoading(false);
  };

  const handleRequestHint = () => {
    if (hintsUsed >= 3) return;
    const level = hintsUsed;
    setHintsUsed(prev => prev + 1);
    onHintUsed?.();
    addResponse(`רמז ${level + 1}`, () => getHint(level, session, game));
  };

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    addResponse(text, () => sendMessage(text, session, game));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 text-2xl leading-none">←</button>
        <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-gray-950 font-bold text-lg">
          {game.character.name[0]}
        </div>
        <div>
          <p className="font-semibold text-sm">{game.character.name}</p>
          <p className="text-gray-500 text-xs">מדריך המשחק</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'character'
                ? 'bg-gray-800 text-white rounded-tl-sm'
                : 'bg-amber-400 text-gray-950 font-medium rounded-tr-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Free text input */}
      <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="כתבו שאלה חופשית..."
          disabled={loading}
          className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-3 placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !inputText.trim()}
          className="bg-amber-400 text-gray-950 font-bold px-4 rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
        >
          שלח
        </button>
      </div>

      {/* Hint counter + button */}
      <div className="p-4 bg-gray-900 space-y-3">
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-8 h-2 rounded-full transition-all ${i < hintsUsed ? 'bg-amber-400' : 'bg-gray-700'}`} />
          ))}
        </div>
        <p className="text-gray-500 text-xs text-center">
          {hintsUsed < 3 ? `נותרו ${3 - hintsUsed} רמזים` : 'השתמשתם בכל הרמזים'}
        </p>
        <button
          onClick={handleRequestHint}
          disabled={hintsUsed >= 3 || loading}
          className="w-full bg-amber-400 text-gray-950 font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-40"
        >
          {hintsUsed >= 3 ? 'אין יותר רמזים' : `רמז ${hintsUsed + 1} מתוך 3`}
        </button>
        <button onClick={onBack} className="w-full text-gray-500 text-sm py-2">
          חזור למשימה
        </button>
      </div>
    </div>
  );
}
