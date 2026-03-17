import { useEffect, useState } from 'react';
import { getCourse, type CourseDetail } from '../api';

interface Props {
  courseId: number;
  onBack: () => void;
  onStartFlashcards: (moduleId: number) => void;
  onStartQuiz: (moduleId: number) => void;
  onStartFinalQuiz: (courseId: number) => void;
}

export const CourseView = ({ courseId, onBack, onStartFlashcards, onStartQuiz, onStartFinalQuiz }: Props) => {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCourse(courseId)
      .then(setCourse)
      .catch(() => setError('Не удалось загрузить курс'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !course) {
    return <div className="text-center text-red-500 py-20">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in text-white">
      <button 
        onClick={onBack}
        className="text-gray-400 hover:text-white mb-6 flex items-center transition-colors"
      >
        ← Вернуться к списку
      </button>

      <div className="bg-gray-800/80 p-8 rounded-3xl border border-gray-700/50 mb-8 shadow-xl backdrop-blur-md">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text mb-4">
          {course.title}
        </h2>
        {course.source_text && (
          <p className="text-gray-300 mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 text-sm leading-relaxed max-h-32 overflow-y-auto">
            {course.source_text}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
            Модулей: {course.modules.length}
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
            Статус: {course.status}
          </span>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-blue-400">#</span> Учебные модули
      </h3>

      <div className="space-y-6">
        {course.modules.map((mod) => (
          <div key={mod.id} className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 transition-colors">
            <h4 className="text-xl font-semibold mb-2">{mod.order}. {mod.title}</h4>
            <p className="text-gray-400 text-sm mb-4">{mod.summary}</p>
            
            <div className="mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Ключевые тезисы:</h5>
              <ul className="list-disc list-inside space-y-1">
                {mod.key_points.map((kp, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">{kp}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => onStartFlashcards(mod.id)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
              >
                🗂 Карточки (Учить)
              </button>
              <button 
                onClick={() => onStartQuiz(mod.id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95"
              >
                📝 Квиз (Проверить)
              </button>
            </div>
          </div>
        ))}
      </div>

      {course.modules.length > 0 && (
        <div className="mt-12 text-center">
          <button 
            onClick={() => onStartFinalQuiz(course.id)}
            className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-purple-500/25 transition-all text-lg active:scale-95"
          >
            🚀 Пройти Final Boss Тест
          </button>
        </div>
      )}
    </div>
  );
};
