/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 1.0.0
 * ***************************************************/
/*global window, $, jQuery, document */
(function ($) {
    "use strict";
    var totalBytesUploaded, totalBytes, queue, config, point, fileQueue;
    //Если такое свойство не определено то добавляем его
    if (Array.in_array === undefined) {
        Array.prototype.in_array = function (str) {
            var _arrayLenght = this.length,
                    i;

            for (i = _arrayLenght; i--; ) {
                if (this[i] === str) {
                    return true;
                }
            }
            return false;
        };
    }

    function miniUplode (el, def) {
        point = el;
        config = def;
        //Проверка на поддержку API
        if (window.File && window.FileList && window.FileReader) {
            this.html5Init();
        }
        else {
            this.normalInit();
        }
    }
    ;
    //Скрываем поле input и рисуем кнопку
    miniUplode.prototype.buildUI = function () {
        $(point).prop('accept', config.fileType).css({
            'position': 'absolute',
            'z-index': 2,
            'width': 600,
            'opacity': 0,
            'font-size': '150px',
            'top': 0,
            'left': -20,
            'padding': 0,
            'margin': 0,
            'cursor': 'pointer',
            '-moz-opacity': 0,
            'filter': 'alpha(opacity=0)'
        });

        $(config.contenerID).css({
            'position': 'relative',
            'overflow': 'hidden',
            'width': config.width,
            'padding': config.padding,
            'cursor': 'pointer',
            'text-align': 'center'
        }).append(config.buttonTitle);


    };
    //Загрузка файлов при помощи HTML5 API
    miniUplode.prototype.html5Init = function () {
        var up = this, parent;
        this.buildUI();
        //Вешаем обработчик на изменение в поле выбора фоток
        point.addEventListener('change', function() {
            var fCount = this.files.length, i = 0, j = 0, //кол-во выбранных файлов
                    acceptFiles = config.fileType.split(',');

            queue = 0, totalBytes = 0, totalBytesUploaded = 0, fileQueue = [];

            //Строим очередь куда попадут файлы только с нужным типом
            for (; i < fCount; i++) {
                if (acceptFiles.in_array(this.files[i].type)) {
                    fileQueue[j] = this.files[i];
                    totalBytes += this.files[i].size;
                    j++;
                }
            }
            //запускаем загрузку
            uplode(fileQueue);
        }, false);
    };

    function progressHandlingFunction (e, file) {

        if (e.lengthComputable) {
            var lapsedBytes = 0;
            if (e.total === e.loaded) {
                totalBytesUploaded += e.loaded;

                lapsedBytes = e.loaded - file.size;

                totalBytesUploaded = totalBytesUploaded - lapsedBytes;

                config.uploadProgress(totalBytesUploaded, totalBytes, lapsedBytes);
            }
        }
    }

    //Загрузка файла на сервер
    function uplode (files) {
        var ln = files.length;

        //console.log(ln);

        var _uplode = function(files, ln, i) {//рекурсивная ф-я для загрузки файлов

            if (i === undefined) {
                i = 0;
            }

            if (i < ln) {
                var form = new FormData(), o = 0;
                form.append('file', files[i]);
                for (o in config.formData) {
                    form.append(o, config.formData[o]);
                }

                $.ajax({
                    url: config.uploadURL,
                    type: 'POST',
                    xhr: function() {
                        var myXhr = $.ajaxSettings.xhr();
                        if (myXhr.upload) { // проверка что осуществляется upload
                            myXhr.upload.addEventListener('progress', function(e) {
                                var e = e || e.window;
                                progressHandlingFunction(e, files[i]);
                            }, false); //передача в функцию значений
                        }
                        myXhr.onreadystatechange = function() {
                            if (this.readyState === 4) {
                                if (this.status === 200) {

                                } else {
                                    throw ('Файл ' + files[i].name + ' не загружен!!!');
                                }
                            }
                        };
                        return myXhr;
                    },
                    data: form,
                    dataType: config.type,
                    cache: false,
                    contentType: false,
                    processData: false,
                    beforeSend: function() {
                        //Выполняется перед загрузкой файла
                        config.beforeFileUplode(files[i], ln, i);
                    },
                    success: function(data) {
                        //Выполняется после загрузки файла
                        config.fileUploded(files[i], data);
                        _uplode(files, ln, ++i);
                    }
                });
            }
            else {
                //Вызывается после загрузки всех файлов
                config.allFilesUploded(files, ln);
            }
        };
        //console.log(ln);
        _uplode(files, ln);
    };

    miniUplode.prototype.normalInit = function () {
        this.buildUI();
        console.log('normal');
    };

    $.fn.miniUpload = function(options) {
        var def = {
            'beforeFileUplode': function (file) {

            },
            'fileUploded': function (file, data) {

            },
            'uploadProgress': function (totalBytesUploaded, totalBytes) {
                //console.log(lapsedBytes);
                var progress = ((totalBytesUploaded / totalBytes) * 100) + '%';
                $(def.progressIdBlock).animate({
                    'width': progress
                }, 50);
            },
            'allFilesUploded': function (files, ln) {

            },
            'fileType': 'image/png,image/jpeg,image/gif',
            'uploadURL': 'upload.php',
            'formData': {'test':1},
            'dataType': 'html',
            'buttonTitle': 'Загрузить файлы',
            'width': 200,
            'contenerID': '#uplodeBlock',
            'padding': '10px',
            'progressIdBlock': '#pr_bar'
        }, uplode;

        $.extend(def, options);

        return this.each(function() {
            uplode = new miniUplode(this, def);
        });
    };
})(jQuery);