# Web-larek-express

Используйте docker-compose для запуска приложения Web-larek-express

## Предварительные шаги
Как развернуть это приложение на вашей машине

## Установка

1. Клонируйте репозиторий

   ```bash
   git clone https://github.com/productmap/web-larek-express.git
   ```

2. Перейдите в директорию проекта

   ```bash
   cd web-larek-express
   ```

3. Скопируйте файлы .env.example из директорий frontend и backend в файлы .env

   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

4. Соберите и запустите приложение

   ```bash
   docker-compose up
   ```

   Это соберет образы Docker для фронтенда, бэкенда и базы данных и запустит контейнеры

## Доступ к приложению

Вы можете получить доступ к приложению по адресу `http://localhost`.

## Остановка приложения

Чтобы остановить приложение, вы можете использовать следующую команду:

```bash
docker-compose down
```

## Устранение неполадок

Если у вас возникнут какие-либо проблемы, проверьте журналы контейнеров с помощью следующей команды:

```bash
docker-compose logs
```
