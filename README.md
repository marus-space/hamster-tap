# Hamster Kombat Game Tap Utility

## Описание

Эта утилита предназначена для автоматизации процесса покупки карточек и управления тапами в игре Hamster Kombat. Утилита взаимодействует с API игры для выполнения операций по добавлению тапов, покупке карточек и планированию следующих действий. 

## Функционал

- Автоматическое добавление тапов
- Выбор наиболее выгодных карточек для покупки
- Разгадывание ежедневного шифра
- Периодическое выполнение задач

## Предварительная подготовка к установке

Для успешной установки и запуска проекта, вам нужно установить Git и Node.js на вашем компьютере. Ниже приведены инструкции по установке этих инструментов.

<details>
  <summary><b>Установка Git</b></summary>

  Git — это система контроля версий, которая позволяет отслеживать изменения в коде и работать совместно с другими разработчиками.

  ##### Установка Git на Windows

  1. Зайдите на [официальный сайт Git](https://git-scm.com/).
  2. Нажмите на кнопку "Download" и скачайте установочный файл для Windows.
  3. Запустите скачанный файл и следуйте инструкциям установщика. На этапе выбора компонентов рекомендуем оставить все по умолчанию.

  ##### Установка Git на macOS

  1. Откройте терминал.
  2. Введите следующую команду и нажмите Enter:
      ```sh
      brew install git
      ```
      Если у вас не установлен Homebrew, следуйте инструкциям на [официальном сайте Homebrew](https://brew.sh/) для его установки.

  ##### Установка Git на Linux

  Для Ubuntu/Debian:
  1. Откройте терминал.
  2. Введите следующую команду и нажмите Enter:
      ```sh
      sudo apt update
      sudo apt install git
      ```
</details>

<details>
  <summary><b>Установка Node.js</b></summary>

  Node.js — это JavaScript-окружение для серверного программирования, которое позволяет запускать JavaScript вне браузера. 

  ##### Установка Node.js на Windows и macOS

  1. Зайдите на [официальный сайт Node.js](https://nodejs.org/).
  2. Нажмите на кнопку "Download" и скачайте LTS-версию (рекомендуемая для большинства пользователей).
  3. Запустите скачанный файл и следуйте инструкциям установщика.

  ##### Установка Node.js на Linux

  Для Ubuntu/Debian:
  1. Откройте терминал.
  2. Введите следующие команды и нажмите Enter:
      ```sh
      curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
      sudo apt-get install -y nodejs
      ```
</details>

<details>
  <summary><b>Проверка установок</b></summary>

  После установки Git и Node.js, откройте терминал (или командную строку на Windows) и выполните следующие команды, чтобы убедиться, что всё установлено правильно:

  ```sh
  git --version
  node --version
  npm --version
  ```

  Команды должны вывести версии установленных программ. Если это произошло, значит, установка прошла успешно.

  Теперь вы готовы к дальнейшей установке и настройке проекта.
</details>

## Установка

#### 1. Клонируйте репозиторий:

```bash
git clone https://github.com/marus-space/hamster-tap
cd hamster-tap
```

#### 2. Установите зависимости:

```bash
npm install
```

#### Установите утилиту глобально:

Установите утилиту глобально, чтобы запускать ее по имени `hamster-tap`:

```bash
npm install -g
```

Вы сможете отменить это действие в будущем следующей командой:

```bash
npm uninstall -g hamster-tap
```

#### 3. Создайте файл конфигурации:

Создайте файл `config/config.json` на основе предоставленного примера `config/example-config.json`. Внесите необходимые изменения в конфигурацию.

Файл конфигурации `config/config.json` должен содержать следующие параметры:

```json
{
  "authorizationHeader": "Bearer <ВАШ_ТОКЕН>",
  "autoBuySettings": {
    "maxPriceCoefficient": 0.5,
    "cardsCount": 5,
    "quantityPriority": false,
    "showUnavailableCards": false
  }
}
```

- `authorizationHeader`: Ваш токен авторизации для API.
- `autoBuySettings`:
  - `maxPriceCoefficient`: Коэффициент, на который будет умножаться текущий баланс для расчета максимально доступной стоимости карточки.
  - `cardsCount`: Максимальное количество карточек для автоматической покупки.
  - `quantityPriority`: Если `true`, будут куплены cardsCount карточек, даже если есть более выгодные карточки дороже максимального порога (не будем копить на самые выгодные карточки, купим то, на что хватает денег). Если `false`, может быть куплено карточек меньше, чем cardsCount, если часть наиболее выгодных карточек дороже максимального порога (будем ждать и копить на самые выгодные карточки).
  - `showUnavailableCards`: Если true, будет выведен список недоступных карточек и условия для их открытия.

## Использование

Чтобы запустить утилиту, используйте следующую команду:

```bash
hamster-tap --file config/config.json
```

где `config/config.json` — путь к вашему конфигурационному файлу.

Если Вы не устанавливали утилиту глобально, используйте следующую команду:

```bash
node index.js --file config/config.json
```

## Примеры команд

#### Запуск с заданием конфигурационного файла

```bash
hamster-tap --file path/to/your/config.json
```

#### Просмотр доступных команд

Для получения списка доступных команд и опций запустите:

```bash
hamster-tap --help
```

## Возможные проблемы

- Ошибка чтения файла конфигурации: Убедитесь, что путь к файлу конфигурации указан правильно и файл содержит корректный JSON.

- Ошибка авторизации: Проверьте правильность вашего токена в authorizationHeader.