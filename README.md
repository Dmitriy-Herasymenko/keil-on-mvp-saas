# KeilOn Voice Assistant

Голосовий асистент з підтримкою української мови, створений на базі Next.js та Groq AI.

## Архітектура

### Frontend
- **Next.js 16** — React фреймворк з App Router
- **TypeScript** — типізація
- **Tailwind CSS** — стилізація
- **Framer Motion** — анімації

### Backend
- **Next.js API Routes** — серверні ендпоінти
- **NextAuth v5** — аутентифікація (Credentials + JWT)
- **Drizzle ORM** — робота з базою даних

### AI та Voice
- **Groq SDK** — AI модель `llama-3.3-70b-versatile`
- **Web Speech API** — SpeechRecognition (STT) та SpeechSynthesis (TTS)
- **Українська мова** — uk-UA locale

### Database
- **PostgreSQL** — реляційна база даних
- **Neon** — хмарний PostgreSQL
- **Drizzle ORM** — типобезпечний ORM

### Schema
```
users (id, email, password, name, avatar)
chats (id, userId, title, slug, isActive, lastMessageAt)
messages (id, chatId, content, role, isVoice, audioUrl)
```

## Основні функції

### 1. Голосовий режим
- Мікрофон кнопка для запису
- Автоматичне розпізнавання мови
- Голосова відповідь асистента
- Анімація під час запису/відтворення

### 2. Текстовий режим
- Чат-інтерфейс з історією
- Текстові повідомлення
- Тільки текстові відповіді (без голосу)

### 3. Чат-історія
- Збереження всіх розмов
- Slug-based URL (`/chat/my-chat-title`)
- Список чатів в sidebar
- Видалення чатів

## Залежності

```json
{
  "next": "16.2.1",
  "next-auth": "^5.0.0-beta.30",
  "drizzle-orm": "^0.45.1",
  "groq-sdk": "^1.1.1",
  "framer-motion": "^12.38.0",
  "lucide-react": "^1.6.0",
  "bcryptjs": "^3.0.3",
  "pg": "^8.20.0"
}
```

## Запуск

```bash
# Встановлення
npm install

# Розробка
npm run dev

# Білд
npm run build

# Деплой
npm run deploy
```

## Змінні середовища

```env
GROQ_API_KEY=gsk_...
DB_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=https://...
```

## Особливості реалізації

### Slug-based routing
Замість UUID в URL використовуються читабельні slug:
- Було: `/chat/550e8400-e29b-41d4-a716-446655440000`
- Стало: `/chat/pryvit-yak-spravy-xyz9`


