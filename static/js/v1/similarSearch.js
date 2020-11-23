/**
 * Demo
 */

var au_ids = {};
var scoreList = [];

var Demo = function () {
    this.initialize.apply(this, arguments);
    this.align_items("score", "desc");
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

Demo.prototype = {
    initialize: function (data) {
        var self = this;
        this.ai_version = data.ai_version;
        this.product_set_id = data.product_set_id;
        this.au_id = data.au_id;
        //this.p_key = data.p_key;

        $.get("/static/advertise_mapping.json", function (data) {
            $.each(data, function (idx, item) {
                au_ids[item.u_id] = item.bizName;
            });
        });

        self.item1 = $(".item", "#items1").clone();
        $(".item", "#items1").remove();
        self.item1_name = $(".name", "#items1").clone();
        $(".name", "#items1").remove();
        self.item2 = $(".item", "#items2").clone();
        $(".item", "#items2").remove();

        $(".img-drag")
            .bind("dragenter", function () {
                var height = $(this).css("height");
                $(this).css("height", height);
                $(this).css("background-color", "#9fa8da");
                $(this).css('background-image','none');
                $("#items1").hide();
            })
            .bind("dragleave", function () {
                $(this).css("background-color", "white");
                $(this).css('background-image','url(/static/img/drag_upload.png)');
                
                $("#items1").show();
                $(this).css("height", "");
            })
            .bind("dragover", function (e) {
                e.preventDefault();
            })
            .bind("drop", function (e) {
                $(this).css("background-color", "white");
                $("#items1").show();
                $(this).css("height", "");
                $("input[name='img']").val(
                    e.originalEvent.dataTransfer.getData("url")
                );
                e.preventDefault();
                $("#btn-search").trigger("click");
            });

        // 클릭 업로드
        $("#btn-search").bind("click", function () {
            var contentUrl = $("input[name='img']").val();
            self.get_ads(contentUrl);
        });

        // 버튼 업로드
        $("#btn-upload").bind("click", function () {
            $("input[name='file']").trigger("click");
        });

        $("input[name='file']").bind("change", function () {
            self.file_upload(self.product_set_id);
        });

        $(".dropdown-item#score-desc").bind("click", function () {
            // 내림차순
            self.align_items("score", "desc");
        });

        $(".dropdown-item#score-asc").bind("click", function () {
            // 오름차순
            self.align_items("score", "asc");
        });

        $(".dropdown-item#price-desc").bind("click", function () {
            // 내림차순
            self.align_items("product-price", "desc");
        });

        $(".dropdown-item#price-asc").bind("click", function () {
            // 오름차순
            self.align_items("product-price", "asc");
        });
    },

    file_upload: function (product_set_id) {
        var self = this;
        var $form = $("#file-upload")[0];
        var data = new FormData($form);

        data.append("product_set_id", product_set_id);

        $("input[name='file']").val("");
        $("#items1, #items2").hide();
        $(".img", "#items1").prop("src", "");
        $(".spinner-grow").show();
        $(".memo").empty();
        $(".item", "#items1").remove();
        $(".name", "#items1").remove();
        $(".item", "#items2").remove();
        $(".check", "#items1").hide();

        $.ajax({
            type: "POST",
            enctype: "multipart/form-data",
            url: "/similarSearch/" + self.au_id + "/" + $('input','#p_key').val(),
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 30000,
            success: function (json) {
                self.view_result(json);
            },
        });
    },

    get_ads: function (contentUrl) {
        var self = this;
        var data = contentUrl;

        $("#items1, #items2").hide();
        $(".img", "#items1").prop("src", "");
        $("#ad-canvas1").hide();
        $(".spinner-grow").show();
        $(".item", "#items1").remove();
        $(".name", "#items1").remove();
        $(".item", "#items2").remove();
        $(".memo").empty();
        $(".check", "#items1").hide();
        console.log(self.p_key)

        $.ajax({
            type: "GET",
            url:
                "/similarSearch/" +
                self.au_id +
                "/" + $('input','#p_key').val() +
                "?contentUrl=" +
                data +
                "&product_set_id=" +
                self.product_set_id,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 30000,
            success: function (json) {
                self.view_result(json);
            },
        });
    },

    align_items: function (value, type) {
        var divList = $("#items2").find(".item");

        if (value == "score" && type == "asc") {
            divList.sort(function (a, b) {
                return $(a).find(".score").text() - $(b).find(".score").text();
            });
        } else if (value == "score" && type == "desc") {
            divList.sort(function (a, b) {
                return $(b).find(".score").text() - $(a).find(".score").text();
            });
        } else if (value == "product-price" && type == "asc") {
            divList.sort(function (a, b) {
                return (
                    replaceAll(
                        $(a).find(".product_price").text().replace("￦", ""),
                        ",",
                        ""
                    ) -
                    replaceAll(
                        $(b).find(".product_price").text().replace("￦", ""),
                        ",",
                        ""
                    )
                );
            });
        } else if (value == "product-price" && type == "desc") {
            divList.sort(function (a, b) {
                return (
                    replaceAll(
                        $(b).find(".product_price").text().replace("￦", ""),
                        ",",
                        ""
                    ) -
                    replaceAll(
                        $(a).find(".product_price").text().replace("￦", ""),
                        ",",
                        ""
                    )
                );
            });
        }

        $("#items2").html(divList);
    },

    view_result: function (json) {
        var self = this;
        var color = [
            "red",
            "orange",
            "yellow",
            "green",
            "blue",
            "navy",
            "magenta",
            "skyblue",
            "orange",
            "maroon",
            "pink",
        ];
        var $item2, p;
        const MINSCORE = 0.44;

        $(".spinner-grow").hide();
        $('.img-drag.drag').css('background-image','none');
        
        $("#btn-au").empty();
        $(".memo").text(json.memo);
      

        if (json.status == "F") {
            alert(json.message);
        }

        $(".img", "#items1")
            .unbind("load")
            .bind("load", function () {
                var width = $(this).width();
                var height = $(this).height();
                var image_xy = width * height;

                var color_no = 0;
                var au_idList = [];

                // 이미지 전체 결과
                if (true) {
                    $.each(json.full_result, function (idx, item) {
                        $item2 = self.item2.clone();
                        $item2.addClass("piclick-10");
                        $(".img", $item2).css({
                            background:
                                "url(" +
                                item.product.img_uri +
                                ") center center / cover no-repeat",
                        });

                        $(".score", $item2).text(item.score);
                        if (item.score > MINSCORE) {
                            $(".score", $item2).removeClass("bg-danger");
                            $(".score", $item2).addClass("bg-primary");
                        }

                        console.log(item.product)
                        $item2.attr(
                            "au_id",
                            item.product.productLabels[0].value
                        );

                        $item2.attr(
                            "pkey",
                            item.product.name.split("|")[2]
                        );
                        $(".pkey", $item2).text(
                            item.product.name.split("|")[2]
                        );

                        au_idList.push(item.product.productLabels[0].value);
                        scoreList.push(item.score);

                        // 상품별 마우스오버
                        $item2.bind("mouseover", function () {
                            $(".description", $(this)).css("display", "grid");
                        });

                        // 상품별 마우스아웃
                        $item2.bind("mouseout", function () {
                            $(".description", $(this)).css("display", "none");
                        });

                        $("#items2").append($item2);
                        $(".piclick-10", "#items2").show();
                    });
                } 

                // 박스별 결과
                $.each(json.gcp_result.productGroupedResults, function (
                    idx1,
                    item1
                ) {
                    p = item1.boundingPoly.normalizedVertices;
                    $item1 = self.item1.clone();
                    $item1_name = self.item1_name.clone();

                    $item1.prop("id", idx1);
                    // $item1_name.text(item1.objectAnnotations[0].name);
                    $item1_name.css(
                        "left",
                        (p[0].x ? p[0].x + 0.01 : 0) * 100 + "%"
                    );
                    $item1_name.css(
                        "top",
                        (p[0].y ? p[0].y + 0.01 : 0) * 100 + "%"
                    );

                    // 박스 그리기
                    $item1.css("left", (p[0].x ? p[0].x : 0) * 100 + "%");
                    $item1.css("top", (p[0].y ? p[0].y : 0) * 100 + "%");
                    $item1.css(
                        "width",
                        ((p[1].x ? p[1].x : 0) - (p[0].x ? p[0].x : 0)) *
                            100 +
                            "%"
                    );
                    $item1.css(
                        "height",
                        ((p[2].y ? p[2].y : 0) - (p[1].y ? p[1].y : 0)) *
                            100 +
                            "%"
                    );
                    if (item1.except !== undefined) {
                        $item1.css("border-color", "black");
                    } else {
                        $item1.css("border-color", color[color_no]);
                        $item1_name.css("color", color[color_no++]);
                    }

                    $("#items1").append($item1);
                    $("#items1").append($item1_name);
                    $item1.css(
                        "z-index",
                        parseInt(
                            (image_xy - $item1.width() * $item1.height()) /
                                1000
                        )
                    );

                    // 박스별 결과
                    // item2
                    $.each(item1.results, function (idx2, item2) {
                        $item2 = self.item2.clone();
                        $item2.addClass("piclick-" + idx1);
                        // $item2.css("border-color", color[idx1]);
                        $(".img", $item2).css({
                            background:
                                "url(" +
                                item2.product.img_uri +
                                ") center center / cover no-repeat",
                        });

                        $(".score", $item2).text(item2.score);
                        if (item2.score > MINSCORE) {
                            $(".score", $item2).removeClass("bg-danger");
                            $(".score", $item2).addClass("bg-primary");
                        }

                        
                        $item2.attr(
                            "au_id",
                            item2.product.productLabels[0].value
                        );

                        $item2.attr(
                            "pkey",
                            item2.product.name.split("|")[2]
                        );
                        $(".pkey", $item2).text(
                            item2.product.name.split("|")[2]
                        );

                        au_idList.push(
                            item2.product.productLabels[0].value
                        );
                        
                        scoreList.push(item2.score);

                        // 상품별 마우스오버
                        $item2.bind("mouseover", function () {
                            $(".description", $(this)).css(
                                "display",
                                "grid"
                            );
                        });

                        // 상품별 마우스아웃
                        $item2.bind("mouseout", function () {
                            $(".description", $(this)).css(
                                "display",
                                "none"
                            );
                        });

                        $("#items2").append($item2);
                        $(".piclick-" + idx1, "#items2").show();
                    });
                });
                

                // 광고주 버튼 생성 (전체)
                $("#btn-au").append(
                    "<button class='btn' type='button' id='btn-au' au_id='0'>전체</button>"
                );
                $("button[au_id='0']").bind("click", function () {
                    $("#items2").find(".item").css("display", "block");
                });

                // 광고주 버튼 생성 (광고주별))
                $.each(Array.from(new Set(au_idList)), function (idx, item) {
                    var dom =
                        "<button class='btn' type='button' id='btn-au' au_id='" +
                        item +
                        "'>" +
                        au_ids[item];
                    dom += "</button>";
                    $("#btn-au").append(dom);
                    $("button[au_id='" + item + "']").bind(
                        "click",
                        function () {
                            $("#items2").find(".item").css("display", "none");
                            $("div[au_id='" + item + "']").show();
                        }
                    );
                });

                // DB 정보 연결
                $.each(json.products, function (pk, info) {
                    var pkey = pk;
                    $("div[pkey='" + pkey + "']")
                        .children("a")
                        .prop("href", info.click_url ? info.click_url: info.click_url_m);

                    if (!info.product_price) {
                        $("div[pkey='" + pkey + "']")
                            .children("a")
                            .children(".product_price")
                            .children("span")
                            .text("￦0");
                    } else {
                        $("div[pkey='" + pkey + "']")
                            .children("a")
                            .children(".product_price")
                            .children("span")
                            .text(numberWithCommas("￦" + info.product_price));
                    }

                    var product_name = info.product_name
                        ? info.product_name.toString()
                        : " ";
                    product_name = product_name.replace(/ *\([^)]*\) */g, "");

                    const stringLimit = 15;
                    $("div[pkey='" + pkey + "']")
                        .children("a")
                        .children(".product_name")
                        .text(
                            product_name.length > stringLimit
                                ? product_name.slice(0, stringLimit) + "..."
                                : product_name.slice(0, stringLimit)
                        );
                });

                $("#items2").show();

                // BoundingBox Click
                $(".item", "#items1").bind("click", function () {
                    var id = $(this).prop("id");
                    var border_color = $(this).css("border-color");
                    $(this).css("background-color", border_color);
                    $(this).css("opacity", 0.5);
                    $("#items2").find(".item").css("display", "none");
                    $(".piclick-" + id, "#items2").show();
                });

                // BoundingBox MouseOut
                $(".item", "#items1").bind("mouseout", function () {
                    var id = $(this).prop("id");
                    $(this).css("background-color", "");
                    $(this).css("opacity", "");
                    // $("#items2").find('.item').css('display','block');
                });

                // BoundingBox MouseOver
                $(".item", "#items1").bind("mouseover", function () {
                    var border_color = $(this).css("border-color");
                    $(this).css("background-color", border_color);
                    $(this).css("opacity", 0.3);
                });
            });

        $("#items1").show();
        $(".img", "#items1").prop("src", json.contentUrl);
    },
};
