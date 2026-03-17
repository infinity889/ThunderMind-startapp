import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
}

const App = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Используем относительный путь благодаря прокси
    fetch('/api/users/')
      .then((res) => res.json())
      .then((data: User[]) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Пользователи из Django:</h1>
      <ul>
        {users.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  );
};

export default App;