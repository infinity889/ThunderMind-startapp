import { useState, useEffect } from 'react';
import { getModuleQuiz, getFinalQuiz, type QuizQuestion } from '../api';

interface Props {
  moduleId?: number;
  courseId?: number;
  isFinal?: boolean;
  onClose: () => void;
}

export const QuizPlayer = ({ moduleId, courseId, isFinal, onClose }: Props) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const fetchQuiz = isFinal && courseId 
      ? getFinalQuiz(courseId)
      : moduleId 
        ? getModuleQuiz(moduleId) 
        : Promise.resolve([]);

    fetchQuiz
      .then(setQuestions)
      .finally(() => setLoading(false));
  }, [moduleId, courseId, isFinal]);

  if (loading) return <div className="text-center py-20 text-white">Загрузка квиза...</div>;
  if (questions.length === 0) return <div className="text-center py-20 text-gray-400">Вопросов нет.</div>;

  const currentQ = questions[currentIndex];

  const handleSelect = (choice: string) => {
    if (selectedChoice) return; // Prevent changing answer
    setSelectedChoice(choice);
    setShowResult(true);
    
    if (choice === currentQ.correct_answer) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedChoice(null);
    setShowResult(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setQuizFinished(true);
    }
  };

  if (quizFinished) {
    const score = Math.round((correctAnswers / questions.length) * 100);
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-3xl max-w-sm w-full border border-gray-700/50 shadow-2xl text-center">
          <div className="text-6xl mb-4 text-center">
            {score >= 80 ? '🏆' : score >= 50 ? '👍' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Quiz Завершен!</h2>
          <p className="text-gray-400 mb-6">Ваш результат: <span className="font-bold text-blue-400">{correctAnswers} / {questions.length}</span></p>
          
          <div className="w-full bg-gray-700 rounded-full h-4 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-4 rounded-full transition-all duration-1000 delay-300" style={{ width: `${score}%` }} />
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
          >
            Вернуться
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="absolute top-6 w-full max-w-xl px-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <span className="bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">Вопрос {currentIndex + 1} из {questions.length}</span>
          {isFinal && <span className="bg-purple-500/20 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Final Boss</span>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 px-4 py-2 rounded-full font-medium transition-colors">Выйти</button>
      </div>

      <div className="w-full max-w-xl bg-gray-800/80 p-8 md:p-10 rounded-3xl border border-gray-700/50 shadow-2xl backdrop-blur-md">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-snug">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.choices.map((choice, idx) => {
            const isSelected = selectedChoice === choice;
            const isCorrect = choice === currentQ.correct_answer;
            
            let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-[15px] ";
            
            if (!showResult) {
              btnClass += "border-gray-700 bg-gray-800/50 text-gray-200 hover:border-blue-500 hover:bg-gray-800";
            } else {
              if (isCorrect) {
                 btnClass += "border-emerald-500 bg-emerald-500/10 text-emerald-300";
              } else if (isSelected) {
                 btnClass += "border-red-500 bg-red-500/10 text-red-300";
              } else {
                 btnClass += "border-gray-700/50 bg-gray-800/20 text-gray-500 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={showResult}
                onClick={() => handleSelect(choice)}
                className={btnClass}
              >
                <div className="flex justify-between items-center">
                  <span>{choice}</span>
                  {showResult && isCorrect && <span className="text-emerald-500">✓</span>}
                  {showResult && isSelected && !isCorrect && <span className="text-red-500">✗</span>}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <button
            onClick={nextQuestion}
            className="mt-8 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all animate-fade-in active:scale-95"
          >
            {currentIndex < questions.length - 1 ? 'Следующий вопрос ➔' : 'Завершить Quiz ✨'}
          </button>
        )}
      </div>
    </div>
  );
};
