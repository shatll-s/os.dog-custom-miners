# Заметки по адаптации майнеров

## Структура майнера

```
имя-майнера/
├── src/
│   ├── miner          # скрипт запуска
│   ├── stats          # скрипт статистики
│   ├── utils.sh       # утилиты (парсинг аргументов)
│   └── исполняемый файл майнера
└── имя-майнера-X.X.tar.gz  # архивы версий
```

## Сборка новой версии

```bash
cd имя-майнера/src
rm -f files.md5 miner.tar.gz
find . -type f ! -name "files.md5" -exec md5sum {} \; > files.md5
tar -zcf miner.tar.gz *
rm -f files.md5
mv miner.tar.gz ../имя-майнера-X.X.tar.gz
```

## Адаптация нового майнера

1. Скопировать `utils.sh` из goldenminer/src/
2. В `miner`:
   - Подключить utils.sh: `. ./utils.sh`
   - Парсить нужные аргументы: `parse_args "$ADDITION" devices threadsPerCard ...`
   - Логика GPU: если `--devices` передан - использовать, иначе авто-определение
3. В `stats`:
   - Парсить лог майнера (grep/awk)
   - Конвертировать единицы в h/s
   - Формировать JSON с полями: miner, algo, total_hr, hr[], busid[], online, ver

## Формат коммитов

```
имя_майнера: версия (опционально: описание)
```

Примеры:
- `xnt-drpool: 0.2`
- `goldenminer: 0.1.7+1`
- `dogminer: 0.1 (initial commit)`
- `xnt-drpool: 0.2 (stats added)`