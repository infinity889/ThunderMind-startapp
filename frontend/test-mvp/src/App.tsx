import { Catalog } from './components/Catalog';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="p-4 border-b border-gray-800 shadow-md bg-gray-800">
        <h1 className="text-2xl font-bold text-center tracking-wider text-blue-500">
          THUNDER MIND STARTAPP
        </h1>
      </header>
      
      <main>
        <Catalog />
      </main>

      <footer className="text-center p-8 text-gray-600 text-sm">
        &copy; 2026 Разработка MVP
      </footer>
    </div>
  );
}

export default App;