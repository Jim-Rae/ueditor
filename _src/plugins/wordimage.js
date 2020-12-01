///import core
///commands 本地图片引导上传
///commandsName  WordImage
///commandsTitle  本地图片引导上传
///commandsDialog  dialogs\wordimage

UE.plugin.register("wordimage", function () {
    var me = this,
        images = [];

    return {
        commands: {
            wordimage: {
                execCommand: function () {
                    var images = domUtils.getElementsByTagName(me.body, "img");
                    var urlList = [];
                    for (var i = 0, ci;
                        (ci = images[i++]);) {
                        var url = ci.getAttribute("word_img");
                        url && urlList.push(url);
                    }
                    return urlList;
                },
                queryCommandState: function () {
                    images = domUtils.getElementsByTagName(me.body, "img");
                    for (var i = 0, ci;
                        (ci = images[i++]);) {
                        if (ci.getAttribute("word_img")) {
                            return 1;
                        }
                    }
                    return -1;
                },
                notNeedUndo: true
            }
        },
        inputRule: function (root) {
            utils.each(root.getNodesByTagName("img"), function (img) {
                var attrs = img.attrs,
                    opt = me.options,
                    src = opt.UEDITOR_HOME_URL + "themes/default/images/spacer.gif";

                    if (parseInt(attrs.width) > 350) {
                        flag = 'l';
                    } else if (parseInt(attrs.width) > 80) {
                        flag = 'm';
                    } else {
                        flag = 's';
                    }

                if (attrs["src"] && /^(?:(file:\/+))/.test(attrs["src"])) {

                    function guid() {
                        function S4() {
                            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                        }
                        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
                    }

                    var id = "wordimage_" + guid();

                    img.setAttr({
                        id: id,
                        width: attrs.width,
                        height: attrs.height,
                        alt: attrs.alt,
                        word_img: attrs.src,
                        src: src,
                        style: "background:url(" +
                            opt.langPath + opt.lang + "/images/localimage_" + flag + ".png" +
                            ") no-repeat center center;border:1px solid #ddd;" +
                            "cursor: pointer;",
                        onclick: "window.parent.$EDITORUI.wordimageClick('" + id + "', document)"
                    });

                    window.$EDITORUI.wordimageClick = function (id, doc) {
                        var input = document.createElement("input");
                        input.type = 'file';
                        input.accept = "image/*";
                        input.onchange = function () {
                            var file = input.files[0];
                            var reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = function () {
                                var img = doc.getElementById(id);
                                img && (img.src = reader.result);
                                // 重置样式
                                img.style.background = 'none';
                                img.style.border = 'none';
                                img.style.cursor = 'initial';
                                // 删除点击事件
                                img.onclick = '';
                                // 移除 word_img 属性，使得图片缩放功能生效
                                img.removeAttribute('word_img');
                            };

                            // 移除 input
                            input = null;
                        };

                        input.click();
                    }
                }
            });
        }
    };
});
