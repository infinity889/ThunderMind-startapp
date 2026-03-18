from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
import threading

from .models import Course, Module, Flashcard, QuizQuestion
from .ai_generator import generate_course_task
from .serializers import (
    CourseListSerializer,
    CourseDetailSerializer,
    CourseCreateSerializer,
    ModuleListSerializer,
    ModuleDetailSerializer,
    FlashcardSerializer,
    QuizQuestionSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    """
    CRUD для курсов.

    list   — список курсов (краткий)
    create — создать курс
    retrieve — детали курса (со всеми модулями)
    """
    queryset = Course.objects.prefetch_related(
        'modules__flashcards', 'modules__quiz_questions'
    )

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        if self.action == 'create':
            return CourseCreateSerializer
        return CourseDetailSerializer

    # ── Вложенные модули ──

    @action(detail=True, methods=['get'], url_path='modules')
    def modules(self, request, pk=None):
        """GET /api/courses/{id}/modules/ — список модулей курса."""
        course = self.get_object()
        modules = course.modules.all()
        serializer = ModuleListSerializer(modules, many=True)
        return Response(serializer.data)

    # ── Итоговый тест (Final Boss) ──

    @action(detail=True, methods=['get'], url_path='final-quiz')
    def final_quiz(self, request, pk=None):
        """GET /api/courses/{id}/final-quiz/ — вопросы итогового теста."""
        course = self.get_object()
        questions = QuizQuestion.objects.filter(
            module__course=course, is_final=True
        )
        serializer = QuizQuestionSerializer(questions, many=True)
        return Response(serializer.data)

    # ── AI Генерация ──

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        """POST /api/courses/generate/ — создание курса с помощью ИИ."""
        prompt = request.data.get('prompt')
        if not prompt:
            return Response({'error': 'Поле "prompt" обязательно.'}, status=status.HTTP_400_BAD_REQUEST)

        # Создаём болванку курса в БД
        course = Course.objects.create(
            title=f"Генерация: {prompt[:30]}...",
            source_text=prompt,
            status='processing'
        )

        # Запускаем фоновую задачу (в MVP используем просто тред)
        thread = threading.Thread(target=generate_course_task, args=(course.id, prompt))
        thread.start()

        # Возвращаем краткую инфу (курс в статусе 'processing')
        serializer = CourseListSerializer(course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ModuleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Только чтение модулей (создание — через AI-пайплайн в будущем).
    """
    queryset = Module.objects.prefetch_related('flashcards', 'quiz_questions')

    def get_serializer_class(self):
        if self.action == 'list':
            return ModuleListSerializer
        return ModuleDetailSerializer

    # ── Флэш-карточки модуля ──

    @action(detail=True, methods=['get'], url_path='flashcards')
    def flashcards(self, request, pk=None):
        """GET /api/modules/{id}/flashcards/"""
        module = self.get_object()
        serializer = FlashcardSerializer(module.flashcards.all(), many=True)
        return Response(serializer.data)

    # ── Квиз модуля ──

    @action(detail=True, methods=['get'], url_path='quiz')
    def quiz(self, request, pk=None):
        """GET /api/modules/{id}/quiz/"""
        module = self.get_object()
        questions = module.quiz_questions.filter(is_final=False)
        serializer = QuizQuestionSerializer(questions, many=True)
        return Response(serializer.data)
