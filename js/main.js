var app = angular.module('app', ['imageUploade']);

app.controller("uploadeController", function ($scope, $imageUploade) {
    var uploader = $scope.uploader = $imageUploade.create({
        url: "uploade.php",
        acceptTypes: ['jpeg','jpg','png','gif'],
        post_params: {test:'lalka'},
        swfUploadOptions: {//Настройки для flash-загрузчика
            flash_url : "js/libs/swfupload/swfupload.swf",
            button_placeholder_id : "uploadButton",
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

