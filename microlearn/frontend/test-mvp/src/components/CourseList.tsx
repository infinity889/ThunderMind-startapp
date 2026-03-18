import { useEffect, useState, useRef } from 'react';
import { getCourses, createAIAidedCourse, type CourseSummary } from '../api';

interface Props {
  onSelectCourse: (id: number) => void;
}

export const CourseList = ({ onSelectCourse }: Props) => {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Для AI генерации
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const pollingInterval = useRef<number | null>(null);

  const fetchCourses = () => {
    getCourses()
      .then(data => {
        setCourses(data);
        // Если есть курсы в статусе 'processing', опрашиваем сервер каждые 3 секунды
        const isProcessing = data.some(c => c.status === 'processing');
        if (isProcessing) {
          if (!pollingInterval.current) {
            pollingInterval.current = window.setInterval(fetchCourses, 3000);
          }
        } else {
          if (pollingInterval.current) {
            window.clearInterval(pollingInterval.current);
            pollingInterval.current = null;
          }
        }
      })
      .catch(() => setError('Не удалось загрузить курсы'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
    return () => {
      if (pollingInterval.current) window.clearInterval(pollingInterval.current);
    };
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await createAIAidedCourse(prompt.trim());
      setPrompt('');
      fetchCourses(); // Обновляем список, новый курс появится в статусе processing
    } catch (err) {
      alert("Ошибка при запуске генерации ИИ");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-gray-400">Загрузка курсов...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">{error}</p>
        <p className="text-gray-500 mt-2">Убедитесь, что Django сервер запущен на порту 8000</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* ─── AI GENERATOR INPUT ─── */}
      <div className="mb-12 bg-gray-800/80 p-8 rounded-3xl border border-gray-700 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          ✨ Сгенерировать курс c ИИ
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Просто напишите, что вы хотите изучить, и ИИ создаст структуру, карточки и тесты.
        </p>
        
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="Например: Я хочу изучить C# для новичков..."
            className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={isGenerating || !prompt.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            {isGenerating ? 'Запуск...' : 'Создать магию 🚀'}
          </button>
        </form>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">📚 Мои курсы</h2>
      <p className="text-gray-400 mb-8">Выберите курс для прохождения</p>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-gray-400 text-lg">Курсов пока нет</p>
          <p className="text-gray-500 mt-1">Создайте первый курс через поле выше!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => course.status === 'ready' && onSelectCourse(course.id)}
              disabled={course.status !== 'ready'}
              className={`group text-left bg-gray-800/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50
                         transition-all duration-300
                         ${course.status === 'ready' 
                            ? 'hover:border-blue-500/50 hover:bg-gray-800 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer' 
                            : 'opacity-75 cursor-not-allowed'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className={`text-xl font-semibold text-white ${course.status === 'ready' ? 'group-hover:text-blue-400' : ''} transition-colors`}>
                  {course.title}
                </h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  course.status === 'ready'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : course.status === 'processing'
                    ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                    : course.status === 'error'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-600/30 text-gray-400'
                }`}>
                  {course.status === 'ready' ? '✓ Готов' : 
                   course.status === 'processing' ? '⚙️ Нейросеть генерирует...' : 
                   course.status === 'error' ? '❌ Ошибка' : '📝 Черновик'}
                </span>
              </div>

              {course.source_url && (
                <p className="text-gray-500 text-sm truncate mb-3">🔗 {course.source_url}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-400">
                {course.status === 'ready' ? (
                  <span>📦 {course.module_count} модулей</span>
                ) : null}
                <span>📅 {new Date(course.created_at).toLocaleDateString('ru-RU')}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
