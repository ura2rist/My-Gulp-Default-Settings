let source_folder = 'src',                                                 // Название папки с исходниками
    project_folder = 'dist';                                               // Название с готовым проектом

let {src, dest} = require('gulp'),                                         // Деструкторизация, src поток для чтения, dest для записи
    fs = require('fs'),                                                    // 
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),                        // Плагин для синхронизации кода и создание экземпляра
    del = require('del'),                                                  // Плагин для удаления папки
    scss = require('gulp-sass')(require('sass')),                          // Плагин для обработки scss
    pug = require('gulp-pug'),                                             // Плагин для обработки pug  
    group_media = require('gulp-group-css-media-queries'),                 // Плагин для группировки медиа запросов
    clean_css = require('gulp-clean-css'),                                 // Плагин для минификации css
    rename = require('gulp-rename'),                                       // Плагин для переименования
    fileinclude = require('gulp-file-include'),                            // Плагин для подключения файлов
    uglify = require('gulp-uglify-es').default,                            // Плагин для сжатия js
    imagemin = require('gulp-imagemin'),                                   // Плагин для сжатия картинок
    ttf2woff = require('gulp-ttf2woff'),                                   // Плагин для преобразования шрифта
    ttf2woff2 = require('gulp-ttf2woff2'),                                 // Плагин для преобразования шрифта
    autoprefixer = require('gulp-autoprefixer');                           // Плагин добавления префиксов               

let path = {                                                               // Пути к папкам
  src: {                                                                   // Путь к исходникам
    pug: [source_folder + '/*.pug', '!' + source_folder + '/_*.pug'],      // Исходник pug, все файлы с расширением .pug кроме тех которые начинаются на _
    scss: source_folder + '/scss/style.scss',                              // Исходники scss
    js: source_folder + '/script/script.js',                               // Исходники js
    img: source_folder + '/img/**/*',                                      // Исходники картинок
    fonts: source_folder + '/fonts/*.ttf',                                 // Исходник шрифтов
    addition_css: source_folder + '/scss/addition_css',                    // Дополнительные файлы CSS                       
  },
  build: {                                                                 // Путь к проекту
    html: project_folder + '/',                                            // Место куда сохраняются HTML после обработки pug
    css: project_folder + '/style/',                                       // Куда сохраняются CSS после обработки scss
    js: project_folder + '/script/',                                       // Куда сохраняются скрипты
    img: project_folder + '/img/',                                         // Куда сохраняются картинки
    fonts: project_folder + '/fonts/',                                     // Куда сохраняются шрифты
  },
  watch: {                                                                 // Файлы прослушивания  
    pug: source_folder + '/**/*.pug',
    scss: source_folder + '/scss/**/*.scss',
    js: source_folder + '/script/**/*.js',
    img: source_folder + '/img/**/*.{jpg, jpeg, png, svg}',
    addition_css: source_folder + '/scss/addition_css/*', 
  },
  clean: './' + project_folder + '/',                                      // Путь который нужно очищать
}

function browserSync(){                                                    // Настройка и инициализация browser-sync
  browsersync.init({                                                        
    server:{
      baseDir: './' + project_folder + '/'                                 // Стандартная папка
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
};

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
              cascade: true                                                 // Выравнивание вендерных префиксов
            })
          )
          .pipe(dest(path.build.css))                                       // Сохраняем файл
          .pipe(
            clean_css()                                                     // Сжатие css
          )
          .pipe(
            rename({                                                       // Переименовываем сжатый файл
              extname: '.min.css'
            })
          )
          .pipe(dest(path.build.css))                                      // Сохраняем файл
          .pipe(browsersync.stream())                                      // Вызов метода преобразования потока
};

function additionCss(){
  return src(path.src.addition_css)
          .pipe(dest(path.build.css))
}

function js(){                                                             // Обработка js
  return src(path.src.js)                                                  // Исходный файл js
          .pipe(fileinclude())                                             // Собираем подключаемые файлы
          .pipe(dest(path.build.js))                                       // Сохраняем файл
          .pipe(uglify())                                                  // Сжатие файла
          .pipe(
            rename({                                                       // Переименовываем сжатый файл
              extname: '.min.js'
            })
          )
          .pipe(dest(path.build.js))                                       // Повторно сохраняем
          .pipe(browsersync.stream())                                      // Вызов метода преобразования потока
};

function watchFiles(){
  gulp.watch([path.watch.pug], pugForHtml);                                // Прослушивание файла и что выполнять при изменении
  gulp.watch([path.watch.scss], scssToCss); 
  gulp.watch([path.watch.js], js);     
  gulp.watch([path.watch.img], images);       
  gulp.watch([path.watch.img], additionCss);                    
};


function images(){
  return src(path.src.img)
          .pipe(
            imagemin({
              progressive: true,
              svgoPlugins: [{ removeViewBox: false }],
              interlaced: true,                                         // Работа с другими форматами
              optimizationLevel: 4                                      // Оптимизация изображения
            })
          )
          .pipe(dest(path.build.img))
          .pipe(browsersync.stream())                                    // Вызов метода преобразования потока
};

function fonts(){
  src(path.src.fonts)
      .pipe(ttf2woff())
      .pipe(dest(path.build.fonts))
  return src(path.src.fonts)
            .pipe(ttf2woff2())
            .pipe(dest(path.build.fonts))    
}

function fontsStyle() {
  let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
  if (file_content == '') {
    fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}
  
function cb(){
  
}

function clean(){                                                          // Удаление папки
  return del(path.clean)
};

let build = gulp.series(clean, gulp.parallel(pugForHtml, images, scssToCss, additionCss, js, fonts), fontsStyle);      // series - поочередное выполнение задач
let watch = gulp.parallel(build, watchFiles, browserSync);                 // parallel - выполнение задач одновременно

exports.watch = watch;
exports.default = watch;                                                   // Экспорт общедоступной, стандартной функции