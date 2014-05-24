var app = angular.module('app', ['imageUploade']);

app.controller("uploadeController", function ($scope, $imageUploade, $timeout) {
    $scope.uplode1 = {
        url: "uploade.php",
        acceptTypes: ['jpeg', 'jpg', 'png', 'gif'],
        post_params: {test: 'lalka'},
        swfUploadOptions: {//Настройки для flash-загрузчика
            flash_url: "js/libs/swfupload/swfupload.swf",
            button_placeholder_id: "uploadButton",
            file_size_limit: "2 MB",
            file_types_description: "Images",
            button_width: 100,
            button_height: 30,
            button_text_left_padding: 15,
            button_text_top_padding: 2,
            button_text: "<span class=\"uploadBtn\">Обзор...</span>",
            button_text_style: ".uploadBtn { font-size: 18px; font-family: Arial; background-color: #FF0000; }"
        }
    };

    $scope.uplode2 = {
        url: "uploade.php",
        acceptTypes: ['jpeg', 'jpg', 'png', 'gif'],
        post_params: {test: 'lalka'},
        swfUploadOptions: {//Настройки для flash-загрузчика
            flash_url: "js/libs/swfupload/swfupload.swf",
            button_placeholder_id: "uploadButton",
            file_size_limit: "2 MB",
            file_types_description: "Images",
            button_width: 100,
            button_height: 30,
            button_text_left_padding: 15,
            button_text_top_padding: 2,
            button_text: "<span class=\"uploadBtn\">Обзор...</span>",
            button_text_style: ".uploadBtn { font-size: 18px; font-family: Arial; background-color: #FF0000; }"
        }
    };

    $scope.uplode3 = {
        url: "uploade.php",
        acceptTypes: ['jpeg', 'jpg', 'png', 'gif']
    };

    $imageUploade.getInstance($scope, 'uploader', function (uplode) {
        //console.log(uplode);
        uplode.bind('beforeUplode', function (event, item) {
            uplode.post_params = {name: 'erick'};
        });

        uplode.bind('afterSort', function (event, what, whereat, queue) {
           // console.log(what);
        });

        uplode.bind('uplodeItemComplite', function (event, item, response) {
           // console.log(response);
        });
    });

    $imageUploade.getInstance($scope, 'uploader1', function (uplode) {
        console.log(uplode);
        uplode.bind('beforeUplode', function (event, item) {
            //console.log(item);
        });

        uplode.bind('afterSort', function (event, what, whereat, queue) {
           // console.log(what);
        });

        uplode.bind('uplodeItemComplite', function (event, item, response) {
           // console.log(response);
        });
    });
});

