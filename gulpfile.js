let source_folder = 'src',                                                 // Название папки с исходниками
    projact_folder = 'dist';                                               // Название с готовым проектом

let {src, dest} = require('gulp'),                                         // Деструкторизация, src поток для чтения, dest для записи
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),                        // Плагин для синхронизации кода и создание экземпляра
    del = require('del'),                                                  // Плагин для удаления папки
    scss = require('gulp-sass'),                                           // Плагин для обработки scss
    pug = require('gulp-pug'),                                             // Плагин для обработки pug                 
    autoprefixer = require('gulp-autoprefixer');                           // Плагин добавления префиксов               

let path = {                                                               // Пути к папкам
  src: {                                                                   // Путь к исходникам
    pug: [source_folder + '/*.pug', '!' + source_folder + '/_*.pug'],      // Исходник pug, все файлы с расширением .pug кроме тех которые начинаются на _
    scss: source_folder + '/scss/style.scss',                              // Исходники scss
    js: source_folder + '/script/script.js',                               // Исходники js
    img: source_folder + '/img/**/*.{jpg, png, svg}',                      // Исходники картинок
    fonts: source_folder + '/fonts/*.ttf',                                 // Исходник шрифтов
  },
  build: {                                                                 // Путь к проекту
    html: projact_folder + '/',                                            // Место куда сохраняются HTML после обработки pug
    css: projact_folder + '/style/',                                       // Куда сохраняются CSS после обработки scss
    js: project_folder + '/script/',                                       // Куда сохраняются скрипты
    img: project_folder + '/img/',                                         // Куда сохраняются картинки
    fonts: project_folder + '/fonts/',                                     // Куда сохраняются шрифты
  },
  watch: {                                                                 // Файлы прослушивания  
    pug: source_folder + '/**/*.pug',
    scss: source_folder + '/scss/**/*.scss',
    js: source_folder + '/script/**/*.js',
    img: source_folder + '/img/**/*.{jpg,png,svg}',
  },
  clean: './' + projact_folder + '/',                                      // Путь который нужно очищать
}

function browserSync(){                                                    // Настройка и инициализация browser-sync
  browsersync.init({                                                        
    server:{
      baseDir: './' + projact_folder + '/'                                 // Стандартная папка
    },
    port: 3000,                                                            // Порт на котором работает BS
  })
}

function pugForHtml(){                                                     // Обработка pug в html
  return src(path.src.pug)                                                 // Открываем исходный файл pug
          .pipe(pug({                                                      // Обрабатываем его плагином gulp-pug
            pretty: true,                                                  // Отключаем минификацию готового HTML
          }))
          .pipe(dest(path.build.html))                                     // Сохраняем файл
          .pipe(browsersync.stream())                                      // Вызов метода преобразования потока
}

function scssToCss(){                                                      // Обработка pug в html
  return src(path.src.scss)                                                // Открываем исходный файл scss
          .pipe(
            scss({
              outputStyle: 'expanded'                                       // Обработка scss, настройкая - отменяет минификацию файла
            })
          )
          .pipe(group_media())
          .pipe(
            autoprefixer({                                                  // Настройки авто префиксера
              overrideBrowserslist: ['last 5 versions'],                    // Настройки - последние 5 версий
              cascade: true                                                 //
            })
          )
          .pipe(dest(path.build.css))
          .pipe(
            clean_css()
          )
          .pipe(
            rename({
              extname: '.min.css'
            })
          )
          .pipe(dest(path.build.css))                                      // Сохраняем файл
          .pipe(browsersync.stream())                                      // Вызов метода преобразования потока
}

function watchFiles(){
  gulp.watch([path.watch.pug], pugForHtml);                                // Прослушивание файла и что выполнять при изменении
  gulp.watch([path.watch.scss], scssToCss);                                
}

function clean(){                                                          // Удаление папки
  return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(pugForHtml, scssToCss));                     // series - поочередное выполнение задач
let watch = gulp.parallel(build, watchFiles, browserSync);                 // parallel - выполнение задач одновременно

exports.watch = watch;
exports.default = watch;                                                   // Экспорт общедоступной, стандартной функции