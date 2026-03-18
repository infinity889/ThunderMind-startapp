"""
Скрипт для наполнения БД тестовыми данными.
Запуск: python manage.py shell < seed_data.py
"""

from courses.models import Course, Module, Flashcard, QuizQuestion


# ─── Удаляем старые данные ───
Course.objects.all().delete()

# ─── Курс 1 ───
course = Course.objects.create(
    title='Основы машинного обучения',
    source_url='https://example.com/ml-article',
    source_text='Длинная статья о машинном обучении...',
    status='ready',
)

# Модуль 1
m1 = Module.objects.create(
    course=course,
    title='Что такое машинное обучение?',
    summary='Введение в ML: определения и история.',
    key_points=[
        'ML — подраздел ИИ, позволяющий компьютерам учиться на данных.',
        'Существуют три типа: supervised, unsupervised, reinforcement.',
        'ML используется в медицине, финансах, рекламе и др.',
    ],
    order=1,
)

Flashcard.objects.create(module=m1, question='Что такое supervised learning?', answer='Обучение с учителем — когда модель учится на размеченных данных.', order=1)
Flashcard.objects.create(module=m1, question='Назовите 3 области применения ML', answer='Медицина, финансы, реклама.', order=2)

QuizQuestion.objects.create(
    module=m1,
    question='Какой тип обучения использует размеченные данные?',
    choices=['Supervised', 'Unsupervised', 'Reinforcement', 'Transfer'],
    correct_answer='Supervised',
    order=1,
)
QuizQuestion.objects.create(
    module=m1,
    question='ML — это подраздел чего?',
    choices=['Математики', 'ИИ', 'Статистики', 'Физики'],
    correct_answer='ИИ',
    order=2,
)

# Модуль 2
m2 = Module.objects.create(
    course=course,
    title='Линейная регрессия',
    summary='Простейший алгоритм ML для предсказания числовых значений.',
    key_points=[
        'Линейная регрессия ищет линейную зависимость y = wx + b.',
        'Функция потерь (MSE) измеряет ошибку предсказаний.',
        'Градиентный спуск оптимизирует веса модели.',
    ],
    order=2,
)

Flashcard.objects.create(module=m2, question='Что такое MSE?', answer='Mean Squared Error — средняя квадратичная ошибка.', order=1)
Flashcard.objects.create(module=m2, question='Что оптимизирует градиентный спуск?', answer='Веса (параметры) модели для минимизации функции потерь.', order=2)

QuizQuestion.objects.create(
    module=m2,
    question='Формула линейной регрессии?',
    choices=['y = wx + b', 'y = wx²', 'y = log(x)', 'y = e^x'],
    correct_answer='y = wx + b',
    order=1,
)

# Модуль 3
m3 = Module.objects.create(
    course=course,
    title='Оценка модели',
    summary='Как понять, хорошо ли работает модель.',
    key_points=[
        'Train/Test split — разделение данных на обучающую и тестовую выборки.',
        'Accuracy, Precision, Recall — метрики классификации.',
        'Overfitting — переобучение, когда модель запоминает вместо обобщения.',
    ],
    order=3,
)

Flashcard.objects.create(module=m3, question='Что такое overfitting?', answer='Переобучение — модель слишком хорошо запомнила тренировочные данные и плохо работает на новых.', order=1)

QuizQuestion.objects.create(
    module=m3,
    question='Как называется разделение данных на обучающие и тестовые?',
    choices=['Cross-validation', 'Train/Test split', 'Bootstrapping', 'Bagging'],
    correct_answer='Train/Test split',
    order=1,
)

# ─── Final Boss вопросы ───
QuizQuestion.objects.create(
    module=m1,
    question='[ИТОГОВЫЙ] ML принадлежит к области...',
    choices=['ИИ', 'Робототехники', 'Квантовых вычислений', 'Блокчейна'],
    correct_answer='ИИ',
    order=10,
    is_final=True,
)
QuizQuestion.objects.create(
    module=m2,
    question='[ИТОГОВЫЙ] Градиентный спуск минимизирует...',
    choices=['Данные', 'Модель', 'Функцию потерь', 'Время обучения'],
    correct_answer='Функцию потерь',
    order=11,
    is_final=True,
)
QuizQuestion.objects.create(
    module=m3,
    question='[ИТОГОВЫЙ] Overfitting — это когда модель...',
    choices=[
        'Плохо учится',
        'Запоминает данные',
        'Работает медленно',
        'Использует мало данных',
    ],
    correct_answer='Запоминает данные',
    order=12,
    is_final=True,
)

print(f'✅ Создан курс: "{course.title}"')
print(f'   Модулей: {course.modules.count()}')
print(f'   Карточек: {Flashcard.objects.count()}')
print(f'   Вопросов квиза: {QuizQuestion.objects.count()}')
