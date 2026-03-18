from django.db import models


class Course(models.Model):
    """Курс, созданный из лонгрида или PDF."""

    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('processing', 'Обработка'),
        ('ready', 'Готов'),
        ('error', 'Ошибка'),
    ]

    title = models.CharField('Название курса', max_length=255)
    source_url = models.URLField('Ссылка на источник', blank=True, null=True)
    source_text = models.TextField('Исходный текст', blank=True)
    status = models.CharField(
        'Статус', max_length=20, choices=STATUS_CHOICES, default='draft'
    )
    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Курс'
        verbose_name_plural = 'Курсы'

    def __str__(self):
        return self.title


class Module(models.Model):
    """Учебный модуль (урок) внутри курса."""

    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='modules',
        verbose_name='Курс'
    )
    title = models.CharField('Заголовок модуля', max_length=255)
    summary = models.TextField('Краткое содержание', blank=True)
    key_points = models.JSONField(
        'Ключевые тезисы', default=list, blank=True,
        help_text='Список строк — ключевые мысли модуля'
    )
    order = models.PositiveIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Модуль'
        verbose_name_plural = 'Модули'

    def __str__(self):
        return f'{self.order}. {self.title}'


class Flashcard(models.Model):
    """Карточка «Вопрос — Ответ» для запоминания."""

    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name='flashcards',
        verbose_name='Модуль'
    )
    question = models.TextField('Вопрос')
    answer = models.TextField('Ответ')
    order = models.PositiveIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Флэш-карточка'
        verbose_name_plural = 'Флэш-карточки'

    def __str__(self):
        return self.question[:80]


class QuizQuestion(models.Model):
    """Вопрос теста (multiple choice)."""

    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name='quiz_questions',
        verbose_name='Модуль'
    )
    question = models.TextField('Вопрос')
    choices = models.JSONField(
        'Варианты ответа', default=list,
        help_text='Список строк — варианты ответа'
    )
    correct_answer = models.CharField('Правильный ответ', max_length=255)
    order = models.PositiveIntegerField('Порядок', default=0)
    is_final = models.BooleanField(
        'Итоговый тест', default=False,
        help_text='True = вопрос для Final Boss (итогового теста)'
    )

    class Meta:
        ordering = ['order']
        verbose_name = 'Вопрос квиза'
        verbose_name_plural = 'Вопросы квиза'

    def __str__(self):
        return self.question[:80]
