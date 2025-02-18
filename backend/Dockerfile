FROM node:22 AS builder

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код приложения
# RUN mkdir -p /app
COPY . .

# Собираем TypeScript код в JavaScript
RUN npm run build

FROM node:22 AS production

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы из этапа builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# Указываем порт, который будет прослушивать приложение
EXPOSE 3082

# Команда для запуска приложения
CMD ["npm", "start"]
