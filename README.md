angularImageUpload
==================

Загрузка файлов на angularjs

<h2>Как использовать?</h2>

<ol>
    <li>
        <b>Подключение:</b>
        <pre>var app = angular.module('app', ['imageUploade']);</pre>
    </li>
    <li>
        <b>Настройка:</b>
        <pre>
           app.controller("uploadeController", function ($scope, $imageUploade) {
               var uploader = $scope.uploader = $imageUploade.create({
                   url: "uploade.php",//куда грузить
                   acceptTypes: ['jpeg','jpg','png','gif'],//Разрешенные для загрузки файлы
                   post_params: {test:'lalka'},//Дополнительные параметры, которые будут добавлены к запросу
                   file_upload_limit: 5,//Лимит на загрузку файлов
                   swfUploadOptions: {//Настройки для flash-загрузчика
                       flash_url : "js/libs/swfupload/swfupload.swf",
                       button_placeholder_id : "uploadButton",//Куда будет вставлена флэшка
                       file_size_limit : "2 MB",
                       file_types_description : "Images",
                       button_width : 100,
                       button_height : 30,
                       button_text_left_padding: 15,
                       button_text_top_padding: 2,
                       button_text : "<span class=\"uploadBtn\">Обзор...</span>",
                       button_text_style : ".uploadBtn { font-size: 18px; font-family: Arial; background-color: #FF0000; }"
                   }
               });
               //После подгрузки картинки
               uploader.bind('uplodeComplite', function (event, item, response) {
                   //console.log(response);
               });
               //Перед началом загрузки
               uploader.bind('beforeUplode', function (event, item) {
                   //console.log(item);
               });
               //после сортировки
               uploader.bind('afterSort', function (event, what, whereat, queue) {
                   //console.log(what);
               });
           });
        </pre>
    </li>
    <li>
        <b>Использование:</b>
        <pre>
            <code>
                &lt;input type="file" data-uploade-source="flash"/&gt;
                        &lt;div id="all"&gt;{{uploader.allUploded}}&lt;/div&gt;

                        &lt;div class="uplode_list"&gt;
                            &lt;table&gt;
                                &lt;tr ng-repeat="item in uploader.queue" class="sort" id="{{item.unicid}}" data-drag-sort&gt;
                                    &lt;td class="uplode-item"&gt;
                                        &lt;div ng-show="uploader.isHtml5" data-image-thumb="item.file" class="thumbs" data-width="100"&gt;&lt;/div&gt;
                                        {{item.file.name}}
                                    &lt;/td&gt;
                                    &lt;td ng-show="item.file.size"&gt;{{item.mbSize}} мб.&lt;/td&gt;
                                    &lt;td ng-show="uploader.isHtml5"&gt;
                                        &lt;div class="progress-bar"&gt;
                                            &lt;span style="width: {{item.progress}}%"&gt;&lt;/span&gt;
                                        &lt;/div&gt;
                                    &lt;/td&gt;
                                    &lt;td&gt;
                                        &lt;span class="{{item.isUploaded ? 'good fa fa-check fa-2x' : 'loading'}}"&gt;&lt;/span&gt;
                                    &lt;/td&gt;
                                    &lt;td&gt;
                                        &lt;b ng-click="item.remove()" class="fa fa-times-circle fa-2x pointer close"&gt;&lt;/b&gt;
                                    &lt;/td&gt;
                                &lt;/tr&gt;
                            &lt;/table&gt;
                        &lt;/div&gt;
            </code>
        </pre>
        <b>Drag & Drop блок:</b>
        <pre>
            <code>
                &lt;div data-drop-zone id="dropZone" ng-show="uploader.isHtml5"&gt;
                            &lt;div ng-repeat="item in uploader.queue" class="dropPreview sort" id="{{item.unicid}}" data-drag-sort&gt;
                                &lt;b ng-click="item.remove()" class="fa fa-times-circle fa-2x pointer close"&gt;&lt;/b&gt;
                                &lt;div ng-show="uploader.isHtml5" data-image-thumb="item.file" class="thumbs" data-width="100"&gt;&lt;/div&gt;
                                {{item.file.name}}
                            &lt;/div&gt;
                        &lt;/div&gt;
            </code>
        </pre>
    </li>
</ol>