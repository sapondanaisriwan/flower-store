# ==============================================================================
# Stage 1: Build Application (Composer + Wayfinder + Vite Frontend)
# ==============================================================================
FROM php:8.4-cli-alpine AS builder

WORKDIR /var/www/html

# ติดตั้ง dependencies ของระบบ + Node.js + PHP extensions ที่จำเป็นตอน build
RUN apk add --no-cache \
    git \
    unzip \
    curl \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    nodejs \
    npm \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    intl \
    zip \
    bcmath

# ดึง Composer จาก official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 1. ติดตั้ง PHP dependencies ก่อน
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

# 2. ติดตั้ง Node.js dependencies
COPY package.json package-lock.json ./
RUN npm ci

# 3. คัดลอกโค้ดทั้งหมดเข้ามาเพื่อรัน Wayfinder และ Build Frontend
COPY . .

# สร้างโครงสร้างพื้นฐานเพื่อให้ artisan ทำงานได้ตอน build
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && cp .env.example .env \
    && composer dump-autoload --optimize --no-dev \
    && php artisan wayfinder:generate \
    && npm run build \
    && rm -rf node_modules .env public/hot

# ==============================================================================
# Stage 2: Production Runtime (Nginx + PHP 8.4-FPM + Supervisor)
# ==============================================================================
FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

# ติดตั้ง Nginx, Supervisor และ PHP Extensions สำหรับรันจริง
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libwebp-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    intl \
    zip \
    opcache \
    && rm -rf /var/cache/apk/*

# ตั้งค่า PHP สำหรับ Production (เพิ่มขนาดอัปโหลดไฟล์เป็น 15MB)
RUN { \
    echo "upload_max_filesize = 15M"; \
    echo "post_max_size = 15M"; \
    echo "memory_limit = 256M"; \
    echo "expose_php = Off"; \
    } > /usr/local/etc/php/conf.d/99-production.ini

# คัดลอกไฟล์ตั้งค่า Nginx, Supervisor และ Entrypoint
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p /var/lib/nginx/tmp/client_body \
    && chown -R www-data:www-data /var/lib/nginx /var/log/nginx /run/nginx

# คัดลอกโค้ดแอปพลิเคชันและไฟล์ที่ build เสร็จแล้วจาก Stage 1
COPY --from=builder --chown=www-data:www-data /var/www/html /var/www/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://127.0.0.1/up || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

