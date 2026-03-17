import { useEffect, useState } from 'react';
import { getCourses, type CourseSummary } from '../api';

interface Props {
  onSelectCourse: (id: number) => void;
}

export const CourseList = ({ onSelectCourse }: Props) => {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => setError('Не удалось загрузить курсы'))
      .finally(() => setLoading(false));
  }, []);

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
      <h2 className="text-3xl font-bold text-white mb-2">📚 Мои курсы</h2>
      <p className="text-gray-400 mb-8">Выберите курс для прохождения</p>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-gray-400 text-lg">Курсов пока нет</p>
          <p className="text-gray-500 mt-1">Добавьте первый курс через API или админ-панель</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="group text-left bg-gray-800/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50
                         hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-300
                         hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  course.status === 'ready'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : course.status === 'processing'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-600/30 text-gray-400'
                }`}>
                  {course.status === 'ready' ? '✓ Готов' : course.status === 'processing' ? '⏳ Обработка' : '📝 Черновик'}
                </span>
              </div>

              {course.source_url && (
                <p className="text-gray-500 text-sm truncate mb-3">🔗 {course.source_url}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>📦 {course.module_count} модулей</span>
                <span>📅 {new Date(course.created_at).toLocaleDateString('ru-RU')}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
