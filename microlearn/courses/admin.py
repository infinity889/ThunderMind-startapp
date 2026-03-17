from django.contrib import admin
from .models import Course, Module, Flashcard, QuizQuestion


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0
    show_change_link = True


class FlashcardInline(admin.TabularInline):
    model = Flashcard
    extra = 0


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'source_url', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title']
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    inlines = [FlashcardInline, QuizQuestionInline]


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ['question', 'module', 'order']
    list_filter = ['module__course']


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ['question', 'module', 'is_final', 'order']
    list_filter = ['is_final', 'module__course']
