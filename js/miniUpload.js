/*global window, $, jQuery, document */
(function($) {
    "use strict";
    var totalBytesUploaded, totalBytes;

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

    miniUplode.prototype.html5Init = function() {
        var def = this.def, up = this;
        //Ставим нашему инпуту параметр accept для конкретных типов файлов
        $(this.el).prop('accept', def.fileType);

        //Вешаем обработчик на изменение в поле выбора фоток
        this.el.addEventListener('change', function() {
            var fCount = this.files.length, i = 0, //кол-во выбранных файлов
                    acceptFiles = def.fileType.split(',');
            //Проверяем соответсвуют ли выбранные файлы разрешенным

            for (; i < fCount; i++) {
                if (acceptFiles.in_array(this.files[i].type)) {
                    //Запускаем ф-ю перед загрузкой файла
                    def.beforeFileUplode(this.files[i]);
                    //загружаем фотки
                    up.uplode(this.files[i]);
                }
                else {
                    alert('Недопустимый формат файла!');
                }
            }

        }, false);
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
        if (!xhr && typeof XMLHttpRequest != 'undefined') {
            xhr = new XMLHttpRequest();
        }
        return xhr;
    }

    miniUplode.prototype.uplode = function(file) {
        var xhr = getXmlHttp();

        //xhr
//        var form = new FormData(), def = this.def;
//        form.append('path', '/');
//        form.append('file[]', file);
//
//        $.ajax({
//            xhr: function() {
//                var xhr = new window.XMLHttpRequest();
//                // Upload progress
//                xhr.upload.addEventListener('progress', function(e) {
//                    console.log(e.total);
//                    if (e.lengthComputable) {
//                        def.progress(e.loaded, e.total);
//                    }
//                }, false);
//                return xhr;
//            },
//            type: 'POST',
//            url: def.uploadURL,
//            data: form,
//            cache: false,
//            contentType: false,
//            processData: false,
//            success: function(data) {
//                console.log(data);
//                //self.options.afterUpload(data);
//            },
//            dataType: def.dataType,
//            error: function(jqXHR, textStatus, errorThrown) {
//                //self.options.error(jqXHR, textStatus, errorThrown);
//            }
//        })
    };

    miniUplode.prototype.normalInit = function() {
        console.log('normal');
    };

    $.fn.miniUpload = function(options) {
        var def = {
            'beforeFileUplode': function(file) {
            },
            'progress': function() {

            },
            'fileType': 'image/png,image/jpeg,image/gif',
            'uploadURL': 'upload.php',
            'dataType': 'html'
        }, uplode;

        $.extend(def, options);

        return this.each(function() {
            uplode = new miniUplode(this, def);
        });
    };
})(jQuery);