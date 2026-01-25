#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from pathlib import Path

module_icons = {
    "module-1": "🎓", "module-2": "📊", "module-3": "🎯",
    "module-4": "💰", "module-5": "🧠", "module-6": "📰", "module-7": "✅"
}

def estimate_duration(text):
    word_count = len(text.split())
    if word_count < 200: return "8 мин"
    elif word_count < 400: return "10 мин"
    elif word_count < 600: return "12 мин"
    elif word_count < 800: return "15 мин"
    else: return "20 мин"

def escape_template(str):
    return str.replace('`', '\\`').replace('${', '\\${')

def convert_module(base_path, module_num):
    content_file = os.path.join(base_path, f'module_{module_num}_content.json')
    test_file = os.path.join(base_path, f'module_{module_num}_test.json')
    
    with open(content_file, 'r', encoding='utf-8') as f:
        content_data = json.load(f)
    
    with open(test_file, 'r', encoding='utf-8') as f:
        test_data = json.load(f)
    
    lessons_count = len(content_data['lessons'])
    questions = test_data.get('questions', [])
    questions_per_lesson = len(questions) // lessons_count if lessons_count > 0 else 0
    
    lessons = []
    question_idx = 0
    
    for lesson_idx, lesson_data in enumerate(content_data['lessons']):
        lesson_id = f"lesson-{module_num}-{lesson_idx + 1}"
        content_text = lesson_data['content_ru']['text_ru']
        
        quiz_questions = []
        start_q = question_idx
        end_q = question_idx + questions_per_lesson if lesson_idx < lessons_count - 1 else len(questions)
        
        for q_idx, q_data in enumerate(questions[start_q:end_q]):
            options = [a['answer_text_ru'] for a in q_data['answers']]
            correct_idx = next(i for i, a in enumerate(q_data['answers']) if a['is_correct'])
            quiz_questions.append({
                'id': f"q{module_num}-{lesson_idx + 1}-{q_idx + 1}",
                'question': q_data['question_text_ru'],
                'options': options,
                'correctAnswer': correct_idx
            })
        
        question_idx = end_q
        
        if not quiz_questions and 'interactive_elements' in lesson_data:
            for elem in lesson_data['interactive_elements']:
                if elem.get('type') == 'quiz':
                    quiz_questions.append({
                        'id': f"q{module_num}-{lesson_idx + 1}-1",
                        'question': elem['question'],
                        'options': elem['options'],
                        'correctAnswer': elem['correct']
                    })
                    break
        
        lessons.append({
            'id': lesson_id,
            'title': lesson_data['title_ru'],
            'description': lesson_data['title_ru'],
            'duration': estimate_duration(content_text),
            'isLocked': lesson_idx > 0,
            'isCompleted': False,
            'content': content_text,
            'quiz': quiz_questions
        })
    
    return {
        'id': f"module-{module_num}",
        'title': content_data['name_ru'],
        'description': content_data['description_ru'],
        'icon': module_icons[f"module-{module_num}"],
        'lessons': lessons
    }

if __name__ == '__main__':
    script_dir = Path(__file__).parent.absolute()
    base_path = script_dir.parent.parent / 'БОТ ОБУЧ'
    output_path = script_dir / 'src' / 'data' / 'lessons.ts'
    
    if not base_path.exists():
        print(f"Base path not found: {base_path}")
        print("Trying absolute path...")
        base_path = Path(r'e:\7777\БОТ ОБУЧ')
        output_path = Path(r'e:\7777\НОВАЯ АПКА\smart-trader-quest-main\smart-trader-quest-main\src\data\lessons.ts')
    
    if not base_path.exists():
        print(f"ERROR: Base path not found: {base_path}")
        exit(1)
    
    modules = []
    for i in range(1, 8):
        try:
            module = convert_module(str(base_path), i)
            modules.append(module)
            print(f"✓ Модуль {i}: {len(module['lessons'])} уроков, {sum(len(l['quiz']) for l in module['lessons'])} вопросов")
        except Exception as e:
            print(f"✗ Ошибка модуля {i}: {e}")
            import traceback
            traceback.print_exc()
    
    ts_code = 'import { Module } from "@/types/lesson";\n\n'
    ts_code += 'export const modules: Module[] = [\n'
    
    for module in modules:
        ts_code += '  {\n'
        ts_code += f'    id: {json.dumps(module["id"], ensure_ascii=False)},\n'
        ts_code += f'    title: {json.dumps(module["title"], ensure_ascii=False)},\n'
        ts_code += f'    description: {json.dumps(module["description"], ensure_ascii=False)},\n'
        ts_code += f'    icon: {json.dumps(module["icon"], ensure_ascii=False)},\n'
        ts_code += '    lessons: [\n'
        
        for lesson in module['lessons']:
            ts_code += '      {\n'
            ts_code += f'        id: {json.dumps(lesson["id"], ensure_ascii=False)},\n'
            ts_code += f'        title: {json.dumps(lesson["title"], ensure_ascii=False)},\n'
            ts_code += f'        description: {json.dumps(lesson["description"], ensure_ascii=False)},\n'
            ts_code += f'        duration: {json.dumps(lesson["duration"], ensure_ascii=False)},\n'
            ts_code += f'        isLocked: {json.dumps(lesson["isLocked"])},\n'
            ts_code += f'        isCompleted: {json.dumps(lesson["isCompleted"])},\n'
            
            content_escaped = escape_template(lesson['content'])
            ts_code += f'        content: `{content_escaped}`,\n'
            
            ts_code += '        quiz: [\n'
            for q in lesson['quiz']:
                ts_code += '          {\n'
                ts_code += f'            id: {json.dumps(q["id"], ensure_ascii=False)},\n'
                ts_code += f'            question: {json.dumps(q["question"], ensure_ascii=False)},\n'
                ts_code += f'            options: {json.dumps(q["options"], ensure_ascii=False)},\n'
                ts_code += f'            correctAnswer: {q["correctAnswer"]}\n'
                ts_code += '          },\n'
            ts_code += '        ]\n'
            ts_code += '      },\n'
        
        ts_code += '    ]\n'
        ts_code += '  },\n'
    
    ts_code += '];\n'
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_code)
    
    print(f"\n✓ Сохранено: {output_path}")
    print(f"✓ Модулей: {len(modules)}")
    total_lessons = sum(len(m['lessons']) for m in modules)
    total_questions = sum(sum(len(l['quiz']) for l in m['lessons']) for m in modules)
    print(f"✓ Уроков: {total_lessons}")
    print(f"✓ Вопросов: {total_questions}")








