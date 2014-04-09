/**
 * Created by netBeans.
 * User: abaddon
 * Date: 07.03.14
 * Time: 13:10
 * Description: Подгрузка файлов
 */
var upLoader = angular.module("imageUploade", []);
//Поддердка HTML5
upLoader.constant('html5', !!(window.File && window.FormData));
upLoader.value('errors', {
    100: "Не подходящий формат файла!",
    110: "При загрузке файла произошла ошибка!",
    120: "Привышен лимит на загрузку фалов!"
});

//Директива для элемента кагрузки
upLoader.directive('uploadeSource', ['$imageUploade', 'html5', function ($imageUploade, html5) {
    return {
        restrict: 'A',
        link: function (scope, elem, attr) {
            //Если есть поддержка html5
            if (html5) {
                elem.prop("multiple", true);
            } else {
                //Смотрим подключать ли flash-загрузкик или работать через iframe
                if (attr.uploadeSource === 'flash') {
                    //Скрываем стандартный input
                    elem.css('display', 'none');
                    scope.$emit('flash:uplode', elem);
                }
            }

            //Запуск загрузчика
            elem.bind('change', function () {
                //В зависимости от поддержки передаем либо список файлов, либо сам елемент
                scope.$emit('add:uplode', html5 ? this.files : this);
            });
        }
    };
}]);

upLoader.factory('$imageUploade', ['html5', '$rootScope', 'errors', '$compile', function (html5, $rootScope, errors, $compile) {
    //Объект загрузчика
    var Loader = function (options) {
        if (!(this instanceof Loader)) {
            return new Loader(options);
        }

        //объединяем полученные настройки с дефолтовыми
        angular.extend(this, {
            isHtml5: html5,
            scope: $rootScope,
            multiple: true,
            acceptTypes: [],
            file_upload_limit: 0,
            errorQueue: [],
            swfUploadOptions: {},
            allUploded: 0,
            queue: [],
            errors: [],
            timestamp: Date.now()
        }, options);

        //Событие на добавление файлов
        this.scope.$on('add:uplode', function (e, data) {
            e.stopPropagation();
            if (data.outerHTML) {
                data.transport = "iframe";
            } else {
                data.transport = "html5";
            }

            var uplodeQueue = data.length ? data : [data];

            if (this.file_upload_limit === 0) {
                this.addFilesToQueue(data);
            } else {
                if (this.queue.length < this.file_upload_limit && uplodeQueue.length <= this.file_upload_limit && data.length !== 0) {
                    this.addFilesToQueue(data);
                } else {
                    this.errors.push(errors[120]);
                    this.updateScope();
                }
            }
        }.bind(this));

        //Иницыализация flash-загрузчика
        this.scope.$on('flash:uplode', function (e, elem) {
            this.SWFinit(elem);
        }.bind(this));

        //Сокртировка
        this.scope.$on('sort:uplode', function (e, what, whereat) {
            this.reSort(what, whereat);
        }.bind(this));

        var that = this;
    };

    Loader.prototype = {
        //Переставляет элементы местами в массиве
        reSort: function (what, whereat) {
            var ln = this.queue.length,
                whatIndex = null,
                whereatIndex = null,
                newQueue = [], i = 0;

            do {
                var loc = this.queue[i];
                if (loc.unicid === what) {
                    whatIndex = i;
                }

                if (loc.unicid === whereat) {
                    whereatIndex = i;
                }
                i++;
            } while (i < ln);

            i = 0;
            do {
                if (i === whatIndex) {
                    newQueue[i] = this.queue[whereatIndex];
                } else {
                    if (i === whereatIndex) {
                        newQueue[i] = this.queue[whatIndex];
                    } else {
                        newQueue.push(this.queue[i]);
                    }
                }
                i++;
            } while (i < ln);
            this.queue = newQueue;
            //после сортировки
            this.trigger("afterSort", this.queue[whatIndex], this.queue[whereatIndex], this.queue);
            this.updateScope();
        },
        //Делает уникальный маркер
        generateQuickGuid: function () {
            return Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
        },
        //Добавляет файлы в очередь на загрузку
        addFilesToQueue: function (items) {
            var ln = items.length, i = 0,
                uplodeQueue = ln ? items : [items];

            do {
                var item = new Item(uplodeQueue[i], {
                    uplode: this,
                    scope: this.scope,
                    file: uplodeQueue[i]
                }, items.transport);

                //Добавляем файл в очередь
                if (!item.error) {
                    this.queue.push(item);
                } else {
                    this.errorQueue.push(item);
                }
                i++;
            } while (i < ln);
            //Подгружаем выбранные файлы
            this.loadedAll();
            //Обновляем наш скоп
            this.updateScope();
        },
        /*
         * Запускает "Грязную проверку", чтобы подцепить новые данные
         */
        updateScope: function () {
            this.scope.$$phase || this.scope.$digest();
        },
        /*
         * Регистрирует события для конкретного вызова модуля
         */
        bind: function (event, handler) {
            this.scope.$on(this.timestamp + ':' + event, handler.bind(this));
        },
        /*
         * Вызывает событие
         */
        trigger: function (event, params) {
            arguments[ 0 ] = this.timestamp + ':' + event;
            this.scope.$broadcast.apply(this.scope, arguments);
        },
        /*
         * Ф-я загрузки картинок
         */
        loadedAll: function () {
            var ln = this.queue.length;
            var _load = function (i) {
                i = i || 0;
                if (i < ln) {
                    if (!this.queue[i].isUploaded) {
                        switch (this.queue[i].transport) {
                            case 'html5':
                                this.xhrUplode(this.queue[i], function () {
                                    i++;
                                    _load(i);
                                });
                                break;
                            case 'iframe':
                                this.iframeUplode(this.queue[i]);
                                break;
                        }
                    } else {
                        i++;
                        _load(i);
                    }
                }
            }.bind(this);

            _load();

        },
        /*
         * Загрузка по XHR
         */
        xhrUplode: function (item, callback) {
            var xhr = new XMLHttpRequest(),
                form = new FormData(),
                that = this;
            item.xhr = xhr;
            //Перед загрузкой
            that.trigger('beforeUplode', item);

            form.append('Filedata', item.file);
            //Добавляем дополнительные параметры к запросу
            if (this.post_params) {
                angular.forEach(this.post_params, function (i, j) {
                    form.append(j, i);
                });
            }

            //Прогресс загрузки фотографии
            xhr.upload.onprogress = function (event) {
                var progress = event.lengthComputable ? event.loaded * 100 / event.total : 0;
                item.progress = progress;
                that.updateScope();
            };

            xhr.onload = function () {
                if (this.readyState === 4 && this.status === 200) {
                    item.afterUploade(this.response);
                    callback();
                }
            };
            xhr.onabort = function () {
                //тут надо описать обрыв загрузки картинки
            };
            xhr.onerror = function () {
                item.error = errors[110];
                that.errorQueue.push(item);
            };
            xhr.open('POST', this.url, true);
            xhr.send(form);
        },
        /*
         * Загрузка через iFrame
         */
        iframeUplode: function (item) {
            var input = angular.element(item.file.input),
                clone = $compile(input.clone())(this.scope),
                iframe = angular.element('<iframe name="iframeTransport' + Date.now() + '">'),
                form = angular.element('<form style="display: none;" />');

            form.prop({
                enctype: "multipart/form-data",
                target: iframe.prop('name'),
                action: this.url,
                method: 'POST'
            });
            clone.prop("value", null);
            input.prop('name', 'Filedata');
            input.css("display", "none").after(clone).after(form);
            form.append(input).append(iframe);

            //Проверяем надо-ли передавать еще что-либо
            if (this.post_params) {
                angular.forEach(this.post_params, function (i, j) {
                    form.append(angular.element("<input type='hidden' name='" + j + "' value='" + i + "'>"));
                });
            }

            //Отправляем форму
            form[0].submit();
            //После загрузки фрайма
            angular.element(iframe).bind('load', function () {
                item.afterUploade(this.response);
                //Удаляем форму
                form.replaceWith('');
            });
        },
        /*
         * Загрузка через SWFuplode
         */
        SWFinit: function (elem) {
            var that = this;
            //Добавляем элемент в который будет помещена кнопка
            if (SWFUpload) {
                var but_id = this.swfUploadOptions.button_placeholder_id || "flash";

                angular.extend(this.swfUploadOptions, {
                    file_upload_limit: this.file_upload_limit,
                    upload_url: this.url,
                    post_params: this.post_params
                });

                //Разрешенные типы файлов
                var accept = angular.extend([], that.acceptTypes), ln = accept.length;
                while (ln--) {
                    accept[ln] = '*.' + accept[ln] + ';*.' + accept[ln].toUpperCase();
                }
                this.swfUploadOptions.file_types = accept.join(";");
                //Вставляем элемент для инициализации flash - кнопки
                elem.after(angular.element('<div id="' + but_id + '"></div>'));
                //Добавление файла в очередь загрузки
                this.swfUploadOptions.file_queued_handler = function (file) {
                    file.transport = 'flash';
                    that.addFilesToQueue(file);
                };
                //Загрузка файла завершена
                this.swfUploadOptions.upload_success_handler = function (file, serverData) {
                    angular.forEach(that.queue, function (item) {
                        if (item.file.flash.index === file.index) {
                            item.afterUploade(serverData);
                        }
                    });
                };
                //Ошибки
                this.swfUploadOptions.file_queue_error_handler = function (file, code, message) {
                    that.scope.$apply(function () {
                        switch (code) {
                            case -100:
                                that.errors.push(errors[120]);
                                break;
                        }
                    });
                };
                //Начинаем загрузку после выбора файлов
                this.swfUploadOptions.file_dialog_complete_handler = function (numFilesSelected, numFilesQueued) {
                    this.startUpload();
                };
                //инициализация
                this.flash = new SWFUpload(this.swfUploadOptions);
            }
        }
    };

//Объект Картинки
    var Item = function (item, options, type) {
        switch (type) {
            case "iframe"://подправляем объект изображения
                var value = item.value,
                    name = value.slice(value.lastIndexOf('\\') + 1),
                    type = value.slice(value.lastIndexOf('.') + 1).toLowerCase();

                options.file = {
                    lastModifiedDate: new Date(),
                    name: name,
                    size: 0,
                    type: 'image' + '/' + type,
                    input: item
                };
                options.transport = 'iframe';
                break;
            case "flash":
                options.file = {
                    lastModifiedDate: item.modificationdate,
                    name: item.name,
                    size: item.size,
                    type: 'image' + '/' + item.type.slice(item.type.lastIndexOf('.') + 1).toLowerCase(),
                    flash: item
                };
                options.transport = 'flash';
                break;
        }
        //проверка на тип файла
        var type = options.file.type.slice(options.file.type.lastIndexOf('/') + 1);
        if (options.uplode.acceptTypes.indexOf(type) === -1 || !type) {
            options.error = errors[100];
        }
        angular.extend(this, {
            unicid: options.uplode.generateQuickGuid(),
            transport: 'html5',
            isUploaded: false,
            error: false,
            mbSize: (options.file.size / (1000 * 1024)).toFixed(2),
            progress: 0
        }, options);


        return this;
    };

    Item.prototype = {
        afterUploade: function (response) {
            this.isUploaded = true;
            this.uplode.allUploded++;
            this.uplode.trigger('uplodeComplite', this, response);
            this.uplode.updateScope();
        },
        //Удаляет элемент из очереди
        remove: function () {
            var index = this.uplode.queue.indexOf(this);
            this.uplode.queue.splice(index, 1);
            this.uplode.allUploded--;
        }
    };

    return {
        create: function (options) {
            return Loader(options);
        }
    }
}])
;
