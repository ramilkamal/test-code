import React, { useState, useCallback, useRef } from 'react';
import './App.css';

//Изменения и улучшения:

//Добавлен тип для address в User.
//Использование React.memo для Button для оптимизации рендеринга.
//Добавлен кастомный хук useThrottle для предотвращения частого вызова функции.
//Перехват возможных исключений при запросе пользователя.
//Кэширование полученных пользователей для предотвращения повторных запросов.
//Обернул функции в useCallback для предотвращения ненужных рендеров.

const URL = "https://jsonplaceholder.typicode.com/users";

type Company = {
  bs: string;
  catchPhrase: string;
  name: string;
};

type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  username: string;
  website: string;
  company: Company;
  address: any; // Рекомендуется уточнить тип
};

interface IButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const Button: React.FC<IButtonProps> = React.memo(({ onClick }) => {
  return (
    <button type="button" onClick={onClick}>
      get random user
    </button>
  );
});

interface IUserInfoProps {
  user: User | null;
}

const UserInfo: React.FC<IUserInfoProps> = ({ user }) => {
  if (!user) {
    return null;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Phone number</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{user.name}</td>
          <td>{user.phone}</td>
        </tr>
      </tbody>
    </table>
  );
};

const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  const lastCall = useRef<number>(0);

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        callback(...args);
        lastCall.current = now;
      }
    },
    [callback, delay]
  );
};

const fetchUser = async (id: number): Promise<User> => {
  const response = await fetch(`${URL}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  const user = (await response.json()) as User;
  return user;
};

const App: React.FC = () => {
  const [item, setItem] = useState<User | null>(null);
  const [cache, setCache] = useState<Record<number, User>>({});

  const receiveRandomUser = useCallback(async () => {
    const id = Math.floor(Math.random() * 10) + 1;
    if (cache[id]) {
      setItem(cache[id]);
    } else {
      try {
        const user = await fetchUser(id);
        setCache((prevCache) => ({ ...prevCache, [id]: user }));
        setItem(user);
      } catch (error) {
        console.error(error);
      }
    }
  }, [cache]);

  const handleButtonClick = useThrottle(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      receiveRandomUser();
    },
    1000
  );

  return (
    <div>
      <header>Get a random user</header>
      <Button onClick={handleButtonClick} />
      <UserInfo user={item} />
    </div>
  );
};

export default App;
