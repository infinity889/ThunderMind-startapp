import { useState, useEffect } from 'react';
import { getModuleFlashcards, type Flashcard } from '../api';

interface Props {
  moduleId: number;
  onClose: () => void;
}

export const FlashcardsPlayer = ({ moduleId, onClose }: Props) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModuleFlashcards(moduleId)
      .then(setCards)
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <div className="text-center py-20 text-white">Загрузка карточек...</div>;
  if (cards.length === 0) return <div className="text-center py-20 text-gray-400">Упс, карточек пока нет.</div>;

  const currentCard = cards[currentIndex];

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) setCurrentIndex(i => i + 1);
  };

  const prevCard = () => {
    setIsFlipped(false);
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="absolute top-6 w-full max-w-lg px-4 flex justify-between items-center text-white">
        <span className="bg-gray-800 px-3 py-1 rounded-full text-sm font-medium tracking-wide">
          {currentIndex + 1} / {cards.length}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full font-medium">Закрыть</button>
      </div>

      <div className="w-full max-w-md perspective-1000">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full aspect-[4/3] cursor-pointer transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front (Question) */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl backface-hidden border border-white/10">
            <span className="absolute top-4 left-4 text-white/50 text-sm tracking-widest font-semibold uppercase">Вопрос</span>
            <p className="text-2xl md:text-3xl font-bold text-center text-white leading-snug drop-shadow-md">
              {currentCard.question}
            </p>
            <p className="absolute bottom-6 text-white/50 text-sm animate-pulse">Нажмите чтобы перевернуть</p>
          </div>

          {/* Back (Answer) */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl backface-hidden rotate-y-180 border border-white/10">
            <span className="absolute top-4 left-4 text-white/50 text-sm tracking-widest font-semibold uppercase">Ответ</span>
            <p className="text-xl md:text-2xl font-medium text-center text-white leading-relaxed drop-shadow-md">
              {currentCard.answer}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-10 px-4">
          <button 
            onClick={prevCard} 
            disabled={currentIndex === 0}
            className="w-14 h-14 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 disabled:opacity-30 transition-all font-bold text-xl active:scale-95"
          >
            ←
          </button>
          
          <div className="flex gap-1.5">
            {cards.map((_, idx) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-gray-600'}`} />
            ))}
          </div>

          <button 
            onClick={nextCard} 
            disabled={currentIndex === cards.length - 1}
            className="w-14 h-14 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 disabled:opacity-30 transition-all font-bold text-xl active:scale-95"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};
