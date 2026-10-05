## 1. Clone repository
```bash
git clone https://github.com/sapondanaisriwan/flower-store.git
```

## 2. ติดตั้ง Composer Dependencies ชั่วคราว:
```bash
cd flower-store
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd):/var/www/html" -w /var/www/html laravelsail/php84-composer:latest composer install --ignore-platform-reqs
```

## 3. สร้าง ไฟล์ .env และ copy ข้อความด้านล่างวางในไฟล์ .env
```bash
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:xKP4LTbfR8wekg8uJFikxn4F6h69dZIhzZGbYuFZBww=
APP_DEBUG=true
APP_URL=http://localhost:8000

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database

PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=flower_shop
DB_USERNAME=admin
DB_PASSWORD=admin

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
# CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
```

## 5. รันระบบ Sail และ Migrate Database:
```bash
   ./vendor/bin/sail up -d
   ./vendor/bin/sail artisan migrate
```

6. ติดตั้ง Node Packages และเปิดหน้าเว็บ:
```bash
   ./vendor/bin/sail npm install
   ./vendor/bin/sail npm run dev
```
