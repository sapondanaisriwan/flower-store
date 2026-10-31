#!/bin/sh
set -e

cd /var/www/html

# 1. สร้างโครงสร้างโฟลเดอร์ใน storage กรณีใช้ Docker Volume ว่างๆ ครั้งแรก
mkdir -p \
    storage/app/public/products \
    storage/app/private \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

# 2. ตั้งสิทธิ์ให้ www-data เขียนไฟล์ลง storage, bootstrap/cache และ nginx temp ได้
mkdir -p /var/lib/nginx/tmp/client_body
chown -R www-data:www-data storage bootstrap/cache /var/lib/nginx
chmod -R 775 storage bootstrap/cache

# 3. ลบไฟล์ public/hot หากเผลอติดมา
rm -f public/hot

# 4. สร้าง symbolic link จาก public/storage -> storage/app/public
php artisan storage:link --force || true

# 5. รอให้ฐานข้อมูลพร้อมและรัน Migration อัตโนมัติ (ถ้าตั้ง AUTO_MIGRATE=true)
if [ "${AUTO_MIGRATE:-true}" = "true" ]; then
    echo "Running database migrations..."
    tries=0
    until php artisan migrate --force; do
        tries=$((tries + 1))
        if [ "$tries" -ge 10 ]; then
            echo "Warning: Migration failed after 10 attempts."
            break
        fi
        echo "Waiting for database connection... (attempt $tries/10)"
        sleep 3
    done
fi

# 6. Cache ค่า config, routes และ views เพื่อความเร็วใน Production
if [ "${APP_ENV}" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

exec "$@"

