/**
 * Created by abaddon on 08.04.14.
 * @description Директива для вывода превьюшек загруженных картинок
 */
upLoader.directive('imageThumb', ['$imageUploade', 'html5', function ($imageUploade, html5) {
    return {
        link: function (scope, elem, attr) {
            var file = scope.$eval(attr.imageThumb),
                wantWidth = attr.width || 100,
                wantHeight = attr.height || 100,
                newWidth = 0, newHeight = 0;

            elem[0].style.cssText += "width:" + wantWidth + "px; height: " + wantHeight + "px; overflow: hidden";

            var getImage = function (url) {
                var img = new Image(), width = 0, height = 0;
                img.src = url;

                img.onerror = function () {
                    throw ("Не создать превью картинки!");
                };

                img.onload = function () {
                    width = this.width;
                    height = this.height;

                    if (width < wantWidth && height < wantHeight) {
                        newWidth = width;
                        newHeight = height;
                    }

                    if (width/wantWidth > height/wantHeight) {
                        newWidth = wantWidth;
                        newHeight = Math.round(height * wantWidth / width);
                    } else {
                        newHeight = wantHeight;
                        newWidth = Math.round(width * wantHeight / height);
                    }
                    img.width = newWidth;
                    img.height = newHeight;

                    elem.append(img);
                }
            };

            if (html5) {
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = function (event) {
                    var e = event;
                    getImage(e.target.result);
                }
            }
        }
    };
}]);