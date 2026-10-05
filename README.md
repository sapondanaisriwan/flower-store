## 1. Clone repository

```bash
git clone https://github.com/sapondanaisriwan/flower-store.git
cd flower-store

```

## 1.1 กำหนดชื่อและอีเมล Git สำหรับ Commit ขึ้น GitHub
```
git config --global user.name "Your Name"

# ใช้ email ที่ลงชื่อเข้าใช้ github
git config --global user.email "your_email@example.com" 
```

## 2. ติดตั้ง Composer Dependencies ชั่วคราว

รัน Composer ผ่าน Docker เพื่อดึง Sail และ dependencies เข้ามาก่อนเริ่มรัน container:

```bash
cd flower-store

docker run --rm -u "$(id -u):$(id -g)" \
  -v "$(pwd):/var/www/html" -w /var/www/html \
  laravelsail/php84-composer:latest \
  composer install --ignore-platform-reqs

```

## 3. สร้างไฟล์ .env

คัดลอกข้อความด้านล่างไปวางในไฟล์ `.env`:

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:xKP4LTbfR8wekg8uJFikxn4F6h69dZIhzZGbYuFZBww=
APP_DEBUG=true
APP_URL=http://localhost

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

## 4. การตั้งค่าคำสั่ง sail ให้สั้นลง (ทำครั้งเดียว)

หากใช้ **Bash** (Linux / WSL):

```bash
echo "alias sail='[ -f sail ] && sh sail || ./vendor/bin/sail'" >> ~/.bashrc
source ~/.bashrc

```

หากใช้ **macOS** (Zsh):

```bash
echo "alias sail='[ -f sail ] && sh sail || ./vendor/bin/sail'" >> ~/.zshrc
source ~/.zshrc

```

## 5. รันระบบ Sail และ Migrate Database

```bash
sail up -d
sail artisan migrate

```

## 6. ติดตั้ง Node Packages และเปิดหน้าเว็บ

```bash
sail npm install
sail npm run dev

```

เข้าใช้งานเว็บไซต์ผ่านเบราว์เซอร์ได้ที่: [http://localhost](http://localhost)

## 7. การเชื่อม DBeaver

- Port ใช้ `3333`
- Username ใช้ `admin`
- Password ใช้ `admin`

<img width="783" height="525" alt="05-10-2026-14-15-39" src="https://github.com/user-attachments/assets/7c8af968-fc85-4e87-8759-133d4b0b24ed" />

