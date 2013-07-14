/*global window, $, jQuery, document */
(function($) {
    "use strict";
    var totalBytesUploaded, totalBytes, queue = 0;

    Array.prototype.in_array = function(str) {
        var _arrayLenght = this.length,
                i;

        for (i = _arrayLenght; i--; ) {
            if (this[i] === str) {
                return true;
            }
        }
        return false;
    };

    function miniUplode(el, def) {
        this.el = el;
        this.def = def;
        //Проверка на поддержку API
        if (window.File && window.FileList && window.FileReader) {
            this.html5Init();
        }
        else {
            this.normalInit();
        }
    }
    miniUplode.prototype.buildUI = function() {
        var def = this.def;
        //Ставим нашему инпуту параметр accept для конкретных типов файлов
        $(this.el).prop('accept', def.fileType).css({
            'opacity': 0,
            'width': def.width,
            'cursor': 'pointer',
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'padding': def.padding
        });
        parent = $(this.el).wrap("<div id=" + def.butId + "></div>").parent();
        parent.css({'width': def.width,
            'position': 'relative',
            'text-align': 'center',
            'padding': def.padding,
            'cursor': 'poiter'
        }
        ).append(def.buttonTitle);
    };
    //Кроссбраузерное создание запроса
    miniUplode.prototype.getXmlHttp = function() {
        var xhr;
        try {
            xhr = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                xhr = false;
            }
        }
        if (!xhr && typeof XMLHttpRequest !== 'undefined') {
            xhr = new XMLHttpRequest();
        }
        return xhr;
    };
    //Загрузка файлов при помощи HTML5 API
    miniUplode.prototype.html5Init = function() {
        var def = this.def, up = this, parent;
        this.buildUI();
        //Вешаем обработчик на изменение в поле выбора фоток
        this.el.addEventListener('change', function() {
            var fCount = this.files.length, queue = 0, i = 0, j = 0, //кол-во выбранных файлов
                    acceptFiles = def.fileType.split(',');

            //Строим очередь куда попадут файлы только с нужным типом
            for (; i < fCount; i++) {
                if (acceptFiles.in_array(this.files[i].type)) {
                    queue++;
                }
                else {
                    //Удаляем элементы, которые не прошли проверку
                    delete this.files[i];
                    console.log(this.files);
                }
            }

            for (; j < queue; j++) {
                //Запускаем ф-ю перед загрузкой файла
                def.beforeFileUplode(this.files[j]);
                //загружаем фотки
                up.uplode(this.files[j]);
            }

        }, false);
    };
    //Загрузка файла на сервер
    miniUplode.prototype.uplode = function(file) {
        var xhr = this.getXmlHttp(), def = this.def, form = new FormData();
        form.append('path', '/');
        form.append('file', file);
        //Тут запускаем ф-ю, которая расчитывает прогресс бар
        xhr.upload.addEventListener('progress', function(e) {
            var percent = parseInt(e.loaded / e.total * 100);
            $('#progress').text('Загрузка: ' + percent + '%');
        }, false);
        //Проверяем выполнился ли запрос
        xhr.onreadystatechange = function(e) {
            if (e.target.readyState === 4) {
                if (e.target.status === 200) {
                    def.fileUplode(file);
                }
                else {
                    throw('Файл не был загружен');
                }
            }
        };
        xhr.open('POST', def.uploadURL, true);
        //Заголовки
        xhr.setRequestHeader("X-File-Type", file.type);
        xhr.setRequestHeader("X-File-Name", file.name);
        xhr.send(form);
    };

    miniUplode.prototype.normalInit = function() {
        console.log('normal');
    };

    $.fn.miniUpload = function(options) {
        var def = {
            'beforeFileUplode': function(file) {
            },
            'fileUplode': function(file) {

            },
            'progress': function() {

            },
            'fileType': 'image/png,image/jpeg,image/gif',
            'uploadURL': 'upload.php',
            'dataType': 'html',
            'buttonTitle': 'Загрузить файлы',
            'width': 200,
            'butId': 'fileUplode',
            'padding': '10px'
        }, uplode;

        $.extend(def, options);

        return this.each(function() {
            uplode = new miniUplode(this, def);
        });
    };
})(jQuery);