import json
import requests
from .models import Course, Module, Flashcard, QuizQuestion

# --- ВСТАВЬ СВОЙ КЛЮЧ ОТ OPENROUTER СЮДА ---
OPENROUTER_API_KEY = "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"

def generate_course_task(course_id, prompt):
    try:
        # 1. Получаем курс и ставим статус
        course = Course.objects.get(id=course_id)
        course.status = 'processing'
        course.save()

        prompt_text = f"""Create a micro-learning course about: '{prompt}'.
Return ONLY a valid JSON object in the following format (do not include markdown code block wrappers such as ```json, just raw JSON).
Make sure to generate 3 educational modules, each with 3 key points, 2 flashcards and 2 quiz questions.
Also generate 3 final quiz questions.

{{
  "title": "A short, catchy title for the course based on the topic",
  "modules": [
    {{
      "title": "Module Title",
      "summary": "Short module summary",
      "key_points": ["Point 1", "Point 2", "Point 3"],
      "flashcards": [
        {{"question": "Q1", "answer": "A1"}}
      ],
      "quiz_questions": [
        {{"question": "Test Q1", "choices": ["A", "B", "C", "D"], "correct_answer": "A"}}
      ]
    }}
  ],
  "final_quiz": [
    {{"question": "Final Q1", "choices": ["A", "B", "C", "D"], "correct_answer": "A"}}
  ]
}}"""

        # 2. Отправляем запрос в OpenRouter
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "http://localhost:5173", # Опционально для аналитики на openrouter.ai
                "X-OpenRouter-Title": "MicroLearn AI",   # Опционально для аналитики на openrouter.ai
                "Content-Type": "application/json"
            },
            data=json.dumps({
                # Можно поменять на любую другую модель, например 'google/gemini-1.5-flash' или 'anthropic/claude-3-haiku'
                "model": "openai/gpt-4o-mini", 
                "messages": [
                    {
                        "role": "user",
                        "content": prompt_text
                    }
                ],
                # Этот параметр заставит модель (если она поддерживает) вернуть чистый JSON
                "response_format": {"type": "json_object"} 
            })
        )
        
        # Выбросит исключение, если есть ошибка в запросе (например, неверный ключ)
        response.raise_for_status() 
        data = response.json()
        
        # 3. Извлекаем текст ответа
        text = data.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        if not text:
            print("Empty response from AI")
            course.status = 'error'
            course.save()
            return
            
        print("Raw AI output:", text) # для дебага
        
        # 4. Очищаем текст от возможных маркдаун-блоков "```json ... ```"
        text = text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        text = text.strip()
            
        course_data = json.loads(text)
        
        # 5. Сохраняем результат в базу данных
        course.title = course_data.get('title', course.title)
        course.status = 'ready'
        course.save()
        
        # Создаем Модули
        for i, mod_data in enumerate(course_data.get('modules', [])):
            module = Module.objects.create(
                course=course,
                title=mod_data.get('title', f"Модуль {i+1}"),
                summary=mod_data.get('summary', ''),
                key_points=mod_data.get('key_points', []),
                order=i+1
            )
            
            # Карточки
            for j, fc_data in enumerate(mod_data.get('flashcards', [])):
                Flashcard.objects.create(
                    module=module,
                    question=fc_data.get('question', ''),
                    answer=fc_data.get('answer', ''),
                    order=j+1
                )
                
            # Квиз
            for j, q_data in enumerate(mod_data.get('quiz_questions', [])):
                QuizQuestion.objects.create(
                    module=module,
                    question=q_data.get('question', ''),
                    choices=q_data.get('choices', []),
                    correct_answer=q_data.get('correct_answer', ''),
                    order=j+1,
                    is_final=False
                )
                
        # Final Boss
        if course_data.get('final_quiz'):
            # Привяжем к последнему модулю
            last_module = course.modules.last()
            if not last_module:
                last_module = Module.objects.create(course=course, title="Итоговый тест", order=999)
                
            for j, q_data in enumerate(course_data.get('final_quiz', [])):
                QuizQuestion.objects.create(
                    module=last_module,
                    question=q_data.get('question', ''),
                    choices=q_data.get('choices', []),
                    correct_answer=q_data.get('correct_answer', ''),
                    order=j+1,
                    is_final=True
                )
                
    except Exception as e:
        print(f"Error generating course: {e}")
        course = Course.objects.get(id=course_id)
        course.status = 'error'
        course.save()
