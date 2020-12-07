/*
 * @Author: leijin
 * @Date: 2020-11-26 17:40:29
 * @LastEditors: leijin
 * @LastEditTithis: 2020-11-26 18:08:56
 * @Description:
 *      1.拖放文件到编辑区域，转成base64并插入到选区
 *      2.插入粘贴板的图片，转成base64并插入到选区
 *
 *      当全局配置 enableDragUploadBase64 = false 时，拖拽文件开启转 base64；
 *      当全局配置 enablePasteUploadBase64 = false 时，粘贴板的图片开启转 base64；
 *
 */

UE.plugins['autouploadimg2base64'] = function () {
    function sendAndInsertFile (file, editor) {
        var filetype = /image\/\w+/i.test(file.type) ? "image" : "file";
        var maxSize = editor.getOpt(filetype + "MaxSize");
        var allowFiles = editor.getOpt(filetype + "AllowFiles");
        var messageId = "message_" + (+new Date()).toString(36);
        var errorHandler = function(title) {
            editor.fireEvent("showmessage", {
                id: messageId,
                content: title,
                type: "error",
                timeout: 4000
            });
        };

        /* 判断文件大小是否超出限制 */
        if (file.size > maxSize) {
            errorHandler(editor.getLang("autoupload.exceedSizeError"));
            return;
        }
        /* 判断文件格式是否超出允许 */
        var fileext = file.name ? file.name.substr(file.name.lastIndexOf(".")) : "";
        if (
            (fileext && filetype != "image") ||
            (allowFiles &&
            (allowFiles.join("") + ".").indexOf(fileext.toLowerCase() + ".") == -1)
        ) {
            errorHandler(editor.getLang("autoupload.exceedTypeError"));
            return;
        }

        //将文件以Data URL形式读入页面
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            editor.execCommand("insertHtml", '<img src="' + reader.result + '">');
        };
    }

    function getPasteImage(e) {
        return e.clipboardData
            && e.clipboardData.items
            && e.clipboardData.items.length == 1
            && /^image\//.test(e.clipboardData.items[0].type)
            ? e.clipboardData.items
            : null;
    }

    function getDropImage(e) {
        return e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : null;
    }

    this.addListener('ready', function () {
        var me = this;
        if (window.FileReader) {
            var handler = function (e) {
                var hasImg = false;
                //获取粘贴板文件列表或者拖放文件列表
                var items = e.type == "paste" ? getPasteImage(e) : getDropImage(e);
                if (items) {
                    var len = items.length,
                        file;
                    while (len--) {
                        file = items[len];
                        if (file.getAsFile) file = file.getAsFile();
                        if (file && file.size > 0) {
                            sendAndInsertFile(file, me);
                            hasImg = true;
                        }
                    }
                    hasImg && e.preventDefault();
                }
            };

            if (me.getOpt("enablePasteUploadBase64") !== false) {
                domUtils.on(me.body, "paste ", handler);
            }
            if (me.getOpt("enableDragUploadBase64") !== false) {
                domUtils.on(me.body, "drop", handler);
                //取消拖放图片时出现的文字光标位置提示
                domUtils.on(me.body, "dragover", function (e) {
                    if (e.dataTransfer.types[0] == "Files") {
                        e.preventDefault();
                    }
                });
            } else {
                if (browser.gecko) {
                    domUtils.on(me.body, "drop", function (e) {
                        if (getDropImage(e)) {
                            e.preventDefault();
                        }
                    });
                }
            }
        }
    });
}
