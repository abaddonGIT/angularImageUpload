angularImageUpload
==================

Множественная загрузка изображений на angularjs при помощи HTML5. Если браузер не поддержывает HTML5, то загрузка осуществляется через iFrame или при помощи Flash (библиотека SFWuplode).

<h2>Как использовать?</h2>

<ol>
    <li>
        <h3>Подключение:</h3>
        <pre>var app = angular.module('app', ['imageUploade']);</pre>
    </li>
    <li>
        <h3>Настройка:</h3>
        <ul>
            <li>
                <b>В шаблоне:</b>
                <pre>&lt;input type="file" data-uploade-source="flash" settings="uplode1" result="uploader1"/&gt;
</pre>
                Простое поле для выбора файлов. В нем <b>settings</b> - имя объекта scope в который будут переданы настройки,
                <b>result</b> - имя объекта в scope для вывода результатов.
                Директива так же принимает указание какой загрузчик использовать если браузер не поддерживает HTML5. Если директива <b>data-uploade-source</b> вызвана без параметра,
                то при отсутствии поддержки html5 будет использован загрузчик через iFrame, если передан параметр "flash", то будет использована загрузка через flash по средствам библиотеки
                <b>SWFupload</b>
                В связке с полем загрузки фалов также можно использовать поле для Drag and Drop:
                <pre>
&lt;div data-drop-zone result="uploader" id="dropZone" ng-show="uploader.isHtml5"&gt;
    &lt;div ng-repeat="item in uploader.queue" class="dropPreview sort" id="{{item.unicid}}" data-drag-sort="item"&gt;
        &lt;b ng-click="item.remove()" class="fa fa-times-circle fa-2x pointer close"&gt;&lt;/b&gt;
        &lt;div ng-show="uploader.isHtml5" data-image-thumb="item.file" class="thumbs" data-width="100"&gt;&lt;/div&gt;
        {{item.file.name}}
    &lt;/div&gt;
&lt;/div&gt;
</pre>
                Если в аттрибут <b>result</b> будет передан тот же объект, который был создан в начале, то оба поля будут взаимодействовать совместно. Если будет указан
                другой объект, то это будет уже отдельная сущность для загрузки, при этом также будет необходимо указать аттрибут <b>settings</b> для конфигурирования.
            </li>
            <li>
                <b>В контроллере:</b>
                <pre>
app.controller("uploadeController", ['$scope', '$imageUploade', function ($scope, $imageUploade) {
    //Конфиг для первого загрузчика
    $scope.uplode1 = {
        url: "uploade.php",//Куда отправлять картинки на обработку
        acceptTypes: ['jpeg', 'jpg', 'png', 'gif'],//Типы файлов разрешеные для загрузки
        multiple: true,//Мультизагрузка файлов
        post_params: {test: 'lalka'},//Параметры переданные сюда будут добавлены к запросу
        swfUploadOptions: {//Настройки для flash-загрузчика
            flash_url: "js/libs/swfupload/swfupload.swf",//Путь до газрузчика
            button_placeholder_id: "uploadButton",//id контейнера для куда будет установлена кнопка
            button_width: 100,
            button_height: 30,
            button_text_left_padding: 15,
            button_text_top_padding: 2,
            button_text: "<span class=\"uploadBtn\">Обзор...</span>",
            button_text_style: ".uploadBtn { font-size: 18px; font-family: Arial; background-color: #FF0000; }"
        }
    };
    //Конфиг для второго загрузчика
    $scope.uplode2 = {
        url: "uploade.php",
        acceptTypes: ['jpeg', 'jpg', 'png', 'gif']
    };
    //И так сколько угодно
}]);
</pre>
После создания объекта загрузчика можно получить его, для того чтобы прослушывать его события и вмешиваться в процесс его работы.
    <pre>
$imageUploade.getInstance($scope, 'uploader1', function (uplode) {
    //Перед отправкой запроса (например можно добавить какие-нибудь доп. данные к запросу)
    uplode.bind('beforeUplode', function (event, item) {
        uplode.post_params = {name: 'erick'};
    });
    //После сортироки элементов
    uplode.bind('afterSort', function (event, what, whereat, queue) {
        console.log(what);
    });
    //После загрузки файла
    uplode.bind('uplodeItemComplite', function (event, item, response) {
        console.log(response);
    });
    //После удаления элемента из набора
    uplode.bind('uplodeItemRemove', function (event, item) {
        console.log(item);
    });
});
$imageUploade.getInstance($scope, 'uploader2', function (uplode) {
    uplode.bind('beforeUplode', function (event, item) {
        uplode.post_params = {name: 'erick'};
    });
});
</pre>
            </li>
        </ul>
    </li>
    <li>
        <h3>Пример шаблона:</h3>
    <pre>
&lt;div data-drop-zone result="uploader" id="dropZone" ng-show="uploader.isHtml5"&gt;
    &lt;div ng-repeat="item in uploader.queue" class="dropPreview sort" id="{{item.unicid}}" data-drag-sort="item"&gt;
        &lt;b ng-click="item.remove()" class="fa fa-times-circle fa-2x pointer close">&lt;/b&gt;
        &lt;div ng-show="uploader.isHtml5" data-image-thumb="item.file" class="thumbs" data-width="100">&lt;/div>
        {{item.file.name}}
    &lt;/div&gt;
&lt;/div&gt;
&lt;input type="file" data-uploade-source="flash" settings="uplode1" result="uploader"/&gt;
&lt;div id="all">{{uploader.allUploded}}&lt;/div&gt;
&lt;div class="uplode_list"&gt;
    &lt;table&gt;
        &lt;tr ng-repeat="item in uploader.queue" class="sort" id="{{item.unicid}}" data-drag-sort="item"&gt;
            &lt;td class="uplode-item"&gt;
                &lt;div ng-show="uploader.isHtml5" data-image-thumb="item.file" class="thumbs" data-width="100">&lt;/div&gt;
                    {{item.file.name}}
            &lt;/td&gt;
            &lt;td ng-show="item.file.size">{{item.mbSize}} мб.&lt;/td&gt;
            &lt;td ng-show="uploader.isHtml5"&gt;
                &lt;div class="progress-bar"&gt;
                    &lt;span style="width: {{item.progress}}%">&lt;/span&gt;
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
</pre>
    </li>
</ol>
