import axios from 'axios';

// Описываем структуру товара (согласно твоей БД)
export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
}

// Создаем инстанс, который будет работать через Vite Proxy
const api = axios.create({
  baseURL: '/api', 
});

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>('/products/');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    throw error;
  }
};

// Функция для Gemini (отправляем запрос на наш Django)
export const askGemini = async (message: string): Promise<{ reply: string }> => {
  const response = await api.post('/gemini/ask/', { message });
  return response.data;
};