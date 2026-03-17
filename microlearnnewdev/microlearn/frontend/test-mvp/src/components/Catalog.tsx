import { useEffect, useState } from 'react';
// Поднимаемся на уровень выше из components в src, чтобы найти api.ts
import { getProducts, type Product } from '../api';

export const Catalog = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-white">Загрузка товаров...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">Каталог MVP</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
              <h3 className="text-xl font-semibold text-blue-400">{item.name}</h3>
              <p className="text-gray-400 mt-2">{item.description || 'Нет описания'}</p>
              <div className="mt-4 text-2xl font-bold text-green-400">{item.price} ₽</div>
              <button className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md transition">
                Купить
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Товары не найдены (проверь соединение с Django)</p>
        )}
      </div>
    </div>
  );
};