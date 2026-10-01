2. ติดตั้ง Composer Dependencies ชั่วคราว:
   docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd):/var/www/html" -w /var/www/html laravelsail/php84-composer:latest composer install --ignore-platform-reqs

3. รันระบบ Sail และ Migrate Database:
   ./vendor/bin/sail up -d
   ./vendor/bin/sail artisan key:generate
   ./vendor/bin/sail artisan migrate

4. ติดตั้ง Node Packages และเปิดหน้าเว็บ:
   ./vendor/bin/sail npm install
   ./vendor/bin/sail npm run dev