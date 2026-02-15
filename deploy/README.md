# Деплой ownitui на VPS (Docker)

Домен: **ownitui.3utilities.com**

Один контейнер с nginx и статикой. На сервере нужны Docker и Docker Compose.

---

## Локально

```bash
npm run build
```

Собрать образ (из корня проекта):

```bash
docker build -f deploy/Dockerfile -t ownitui .
```

---

## Обновление

Заново собрать локально, пуш на сервер и перезапуск:

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

---
