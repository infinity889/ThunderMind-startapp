from rest_framework import serializers
from .models import Course, Module, Flashcard, QuizQuestion


# ─────────────────── Flashcard ───────────────────

class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = ['id', 'question', 'answer', 'order']


# ─────────────────── QuizQuestion ───────────────────

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question', 'choices', 'correct_answer', 'order', 'is_final']


# ─────────────────── Module ───────────────────

class ModuleListSerializer(serializers.ModelSerializer):
    """Краткий сериализатор модуля (для списка)."""
    flashcard_count = serializers.IntegerField(source='flashcards.count', read_only=True)
    quiz_count = serializers.IntegerField(source='quiz_questions.count', read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'summary', 'key_points', 'order',
                  'flashcard_count', 'quiz_count']


class ModuleDetailSerializer(serializers.ModelSerializer):
    """Полный сериализатор модуля (с карточками и квизом)."""
    flashcards = FlashcardSerializer(many=True, read_only=True)
    quiz_questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'summary', 'key_points', 'order',
                  'flashcards', 'quiz_questions']


# ─────────────────── Course ───────────────────

class CourseListSerializer(serializers.ModelSerializer):
    """Краткий сериализатор курса (для списка)."""
    module_count = serializers.IntegerField(source='modules.count', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'source_url', 'status', 'created_at',
                  'updated_at', 'module_count']


class CourseDetailSerializer(serializers.ModelSerializer):
    """Полный сериализатор курса (со всеми модулями)."""
    modules = ModuleDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'source_url', 'source_text', 'status',
                  'created_at', 'updated_at', 'modules']


class CourseCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания курса (ввод: URL или текст)."""

    class Meta:
        model = Course
        fields = ['title', 'source_url', 'source_text']

    def validate(self, data):
        if not data.get('source_url') and not data.get('source_text'):
            raise serializers.ValidationError(
                'Укажите source_url или source_text (или оба).'
            )
        return data
