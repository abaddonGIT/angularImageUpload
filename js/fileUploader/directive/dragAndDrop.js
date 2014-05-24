/**
 * Created by abaddon on 08.04.14.
 * Блок для перетаскивания файлов
 */
upLoader.value("dropElement", null);
upLoader.directive("dropZone", ['$imageUploade' , 'html5', '$timeout', function ($imageUploade, html5, $timeout) {
    return {
        scope: {
            result: "=?",
            settings: "=?"
        },
        link: function (scope, elem, attr) {
            $timeout(function () {
                if (scope.result) {//Если ссылка на уже существующий объек передана, то используем его
                    scope = scope.result.scope;
                } else {//Если нет то создаем новый загрузчик
                    if (scope.settings) {
                        scope.settings.scope = scope;
                    } else {
                        scope.settings = {'scope': scope};
                    }
                    //Создание объекта загрузчика
                    $imageUploade.create(scope.settings);
                }

                elem.bind("drop",function (e) {
                    var dataTransfer = e.dataTransfer ? e.dataTransfer : e.originalEvent.dataTransfer;
                    scope.$emit("add:uplode", dataTransfer.files);
                    elem.removeClass("active");
                    e.stopPropagation();
                    e.preventDefault();
                }).bind("dragover",function (e) {
                    var dataTransfer = e.dataTransfer ? e.dataTransfer : e.originalEvent.dataTransfer;
                    elem.addClass("active");
                    dataTransfer.dropEffect = 'copy';
                    e.stopPropagation();
                    e.preventDefault();
                }).bind("dragleave", function (e) {
                    elem.removeClass("active");
                    e.stopPropagation();
                    e.preventDefault();
                });
            }, 0);
        }
    };
}]);

upLoader.directive("dragSort", ['$imageUploade' , 'html5', 'dropElement', function ($imageUploade, html5, dropElement) {
    return {
        link: function (scope, elem, attr) {
            var item = scope.$eval(attr.dragSort);
            elem.prop('draggable', true);
            elem.bind('dragstart',function (e) {
                var dataTransfer = dataTransfer = e.dataTransfer ? e.dataTransfer : e.originalEvent.dataTransfer;
                //Сохраняем перетаскиваемый элемент
                dropElement = this;
                //Уменьшаем прозрачность элемента при перетаскивании
                this.style.opacity = 0.4;
                dataTransfer.effectAllowed = 'move';
                //Сохраняем контент перетаскиваемого элемента
                dataTransfer.setData('Text', this.innerHTML);
            }).bind('selectstart',function (e) {
                this.dragDrop();
                e.preventDefault();
            }).bind('drop',function (e) {
                var dataTransfer = dataTransfer = e.dataTransfer ? e.dataTransfer : e.originalEvent.dataTransfer;

                if (dropElement) {
                    item.scope.$emit('sort:uplode', this.id, dropElement.id);
                    dropElement.style.opacity = 1;
                    angular.element(this).removeClass('over');
                } else {
                    return false;
                }
                //Останавливаем всплытие события
                e.stopPropagation();
            }).bind("dragover",function (e) {
                var dataTransfer = dataTransfer = e.dataTransfer ? e.dataTransfer : e.originalEvent.dataTransfer;
                dataTransfer.dropEffect = "move";
                angular.element(this).addClass('over');
                e.preventDefault();
                e.stopPropagation();
            }).bind("dragleave",function (e) {
                angular.element(this).removeClass('over');
                e.preventDefault();
                e.stopPropagation();
            }).bind('dragend', function (e) {
                this.style.opacity = 1;
                e.preventDefault();
            });
        }
    };
}]);
