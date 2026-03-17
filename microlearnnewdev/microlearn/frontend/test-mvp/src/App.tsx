import { useState } from 'react';
import { CourseList } from './components/CourseList';
import { CourseView } from './components/CourseView';
import { FlashcardsPlayer } from './components/FlashcardsPlayer';
import { QuizPlayer } from './components/QuizPlayer';

function App() {
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [activeFlashcardModuleId, setActiveFlashcardModuleId] = useState<number | null>(null);
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<number | null>(null);
  const [activeFinalQuizCourseId, setActiveFinalQuizCourseId] = useState<number | null>(null);

  const resetPlayers = () => {
    setActiveFlashcardModuleId(null);
    setActiveQuizModuleId(null);
    setActiveFinalQuizCourseId(null);
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans selection:bg-blue-500/30">
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flexItems-center space-x-3 cursor-pointer" onClick={() => setActiveCourseId(null)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              M
            </div>
            <h1 className="text-xl font-bold tracking-wide">
              MicroLearn<span className="text-blue-500">.ai</span>
            </h1>
          </div>
          <nav className="text-sm font-medium text-gray-400">
            {/* Future auth/user menu could go here */}
            MVP Mode
          </nav>
        </div>
      </header>
      
      <main className="pb-20 relative">
        {/* Decorative Background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        {!activeCourseId ? (
          <CourseList onSelectCourse={setActiveCourseId} />
        ) : (
          <CourseView 
            courseId={activeCourseId} 
            onBack={() => setActiveCourseId(null)}
            onStartFlashcards={setActiveFlashcardModuleId}
            onStartQuiz={setActiveQuizModuleId}
            onStartFinalQuiz={setActiveFinalQuizCourseId}
          />
        )}
      </main>

      {/* Players Rendering */}
      {activeFlashcardModuleId && (
        <FlashcardsPlayer 
          moduleId={activeFlashcardModuleId} 
          onClose={resetPlayers} 
        />
      )}
      
      {activeQuizModuleId && (
        <QuizPlayer 
          moduleId={activeQuizModuleId} 
          onClose={resetPlayers} 
        />
      )}

      {activeFinalQuizCourseId && (
        <QuizPlayer 
          courseId={activeFinalQuizCourseId} 
          isFinal={true}
          onClose={resetPlayers} 
        />
      )}
    </div>
  );
}

export default App;