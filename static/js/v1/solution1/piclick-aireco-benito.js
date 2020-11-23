/**
* Piclick Solution
*/

// 숫자 -> 통화
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var Piclick = function () {
  this.initialize.apply(this, arguments);
}

Piclick.prototype = {
  initialize: function () {
    var self = this;
    this.sol_version = 'v1';
    this.au_id = '2545';
    this.siteID = '98';
    this.sirs_api_url = 'https://sol.piclick.kr/similarSearch/';
    this.ec_api_url = 'https://sol.piclick.kr/exchangeSearch/';
    this.static_url = 'https://reco.piclick.kr/static/';
    this.device;
    self.imageLoaded = 0;

    // 디바이스 체크
    var filter = "win16|win32|win64|mac|macintel";
    if (navigator.platform) {
      if (filter.indexOf(navigator.platform.toLocaleLowerCase()) < 0) this.device = 'mobile';
      else this.device = 'pc';
    }

    // uid 체크 (Piclick User ID)
    self.uid = self.getCookie('_pa');
    if (self.uid === null || self.uid.length !== 21) self.uid = self.uidCreate();

    self.todayCheckCookie = self.getCookie('todayCookie');
    if (self.todayCheckCookie == null) self.todayCheckCookie = 'None';

    // 만료날짜 갱신
    self.setCookie('_pa', self.uid, 365);

    // 소재
    this.drawerUpSrc = self.static_url + 'img/arrow_up.png';
    this.drawerDownSrc = self.static_url + 'img/arrow_down.png';
    this.xButtonSrc = self.static_url + 'img/xButton.png';
  },

  checkParams: function (site_name, mainImg, subImg) {
    var attr = (typeof attr !== 'undefined') ? attr : 'src'; // default : src
    var urls = [];

    // 일단 전부 정상일때
    if (site_name !== undefined && mainImg !== undefined && subImg !== undefined) {
      // 메인 이미지
      img = mainImg;
      if (img.tagName == "DIV") {
        var style = img.currentStyle || window.getComputedStyle(img, false);
        var imgUrl = style.backgroundImage.slice(4, -1).replace(/"/g, "");
      } else {
        if (img.classList) {
          for (var i = 0; i < img.classList.length; i++) {
            if (img.classList[i].toUpperCase() == "LAZY") {
              attr = "data-src";
            }
          }
        }
        var imgUrl = mainImg.getAttribute(attr);
        if (imgUrl == null && attr !== 'src') {
          imgUrl = mainImg.getAttribute('src'); // 결과가 없을때 src로 한번더 체크
        }
      }
      urls.push(imgUrl);
      return urls
    }
    else return false;
  },

  locationHref: function (clickUrl) {
    location.href = clickUrl;
  },

  createImageImg: function (imgUrl, productPrice, clickUrl) {
    var self = this;
    var imageContainer = document.createElement('div');
    imageContainer.className = "s-image " + self.device;

    var image = document.createElement('img');
    image.src = imgUrl;
    image.onclick = function () { self.locationHref(clickUrl); }
    image.onload = function () { self.imageLoaded++; }
    imageContainer.appendChild(image);

    var productPriceContainer = document.createElement('div');
    productPriceContainer.className = 'product-price';
    productPriceContainer.innerText = productPrice;

    return {
      "imageContainer": imageContainer,
      "productPriceContainer": productPriceContainer
    }
  },

  offset: function (el) {

    var rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var bxy = document.body.getBoundingClientRect();
    var addTop = 0
    var text = top.location.href;

    if (window.getComputedStyle(document.body).position == "relative") {
      scrollLeft = scrollLeft - bxy.left
    }

    if (text.indexOf('mobile') != -1 || text.indexOf('/zxnews/') != -1) {
      if (document.getElementById('title')) {
        addTop = parseInt(window.getComputedStyle(document.getElementById('title'), null).marginTop);
      }
    }

    return {
      top: rect.top + scrollTop - addTop
      , left: rect.left + scrollLeft
      , height: rect.bottom - rect.top
      , width: rect.right - rect.left
    }
  },

  // Visible Checking
  isVisible: function (e) {
    return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
  },

  // 00:00 시 기준 쿠키
  setCookieDay: function (name, value, exp) {
    var todayDate = new Date();
    todayDate = new Date(parseInt(todayDate.getTime() / 86400000) * 86400000 + 54000000);
    if (todayDate > new Date()) {
      exp = exp - 1;
    }
    todayDate.setDate(todayDate.getDate() + exp);
    document.cookie = name + "=" + escape(value) + "; path=/; expires=" + todayDate.toGMTString() + ";"
  },

  // 24시간 기준 쿠키
  setCookie: function (name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
  },

  getCookie: function (name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value ? value[2] : null;
  },

  deleteCookie: function (name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },

  uidCreate: function () {
    var _id1 = parseInt(Math.random() * 10000000000);
    var _id2 = parseInt(new Date().getTime() / 1000)
    return _id1 + '.' + _id2;
  },

  // 교환추천 노출
  impEC: function (tProductNo, userID, device, logType, order_id, from) {
    var self = this;
    if (logType == 'pageView') var loggingParams = 'imp?order_id=' + order_id + '&userID=' + userID + '&cookieID=' + self.uid + '&siteID=' + self.siteID + '&device=' + device + '&logType=' + logType + '&from=' + from;
    else if (logType == 'bannerView') var loggingParams = 'imp?order_id=' + order_id + '&tProductNo=' + tProductNo + '&userID=' + userID + '&cookieID=' + self.uid + '&siteID=' + self.siteID + '&device=' + device + '&logType=' + logType + '&from=' + from;

    if (document.readyState !== 'loading') {
      $.ajax({
        type: "GET",
        url: self.ec_api_url + loggingParams,
        processData: false,
        contentType: false,
        cache: false,
        crossDomain: true,
        timeout: 2000,
        xhrFields: {
          withCredentials: true
        },
        success: function () { }
      })
    }
    else {
      document.addEventListener("DOMContentLoaded", function () {
        $.ajax({
          type: "GET",
          url: self.ec_api_url + loggingParams,
          processData: false,
          contentType: false,
          cache: false,
          crossDomain: true,
          timeout: 2000,
          xhrFields: {
            withCredentials: true
          },
          success: function () { }
        })
      })
    }
  },

  // 교환추천 클릭
  clickEC: function (sProductNo, tProductNo, userID, device, logType, order_id, from, detail) {
    var self = this;
    if (logType == 'exchange') var loggingParams = 'bannerClick?order_id=' + order_id + '&tProductNo=' + tProductNo + '&sProductNo=' + sProductNo + '&userID=' + userID + '&cookieID=' + self.uid + '&siteID=' + self.siteID + '&device=' + device + '&logType=' + logType + '&from=' + from + '&detail=' + detail;
    else if (logType == 'return') var loggingParams = 'bannerClick?order_id=' + order_id + '&tProductNo=' + tProductNo + '&userID=' + userID + '&cookieID=' + self.uid + '&siteID=' + self.siteID + '&device=' + device + '&logType=' + logType + '&from=' + from + '&detail=' + detail;
    if (document.readyState !== 'loading') {
      $.ajax({
        type: "GET",
        url: self.ec_api_url + loggingParams,
        processData: false,
        contentType: false,
        cache: false,
        crossDomain: true,
        timeout: 2000,
        success: function () {
          var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search + '&ec=done';
          window.history.pushState({ path: newurl }, '', newurl);
          $('#paySSLForm').submit();
        },
        error: function (request, status, error) {
          alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        }
      })
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        $.ajax({
          type: "GET",
          url: self.ec_api_url + loggingParams,
          processData: false,
          contentType: false,
          cache: false,
          crossDomain: true,
          timeout: 2000,
          success: function () {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search + '&ec=done';
            window.history.pushState({ path: newurl }, '', newurl);
            $('#paySSLForm').submit();
          },
          error: function (request, status, error) {
            alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
          }
        })

      })
    }
  },

  // 교환추천(교환페이지)
  connectEC: function () {
    var self = this;
    document.addEventListener("DOMContentLoaded", function () {
      const curLocation = window.location.href;
      var order_id = curLocation.split('order_id=')[1].split('&')[0];

      // 반품신청 -> 교환신청
      if (curLocation.indexOf('sProductNo') >= 0 && curLocation.indexOf('tProductNo') >= 0) {
        var sProductNo = curLocation.split('sProductNo=')[1].split('&')[0];
        var tProductNo = curLocation.split('tProductNo=')[1].split('&')[0];

        $.each($('input[id="apply_product0"]'), function (idx, e) {
          if (tProductNo == tProductNo && !e.checked) e.click();
        })

        var selectedItem = $('#selected_product').children().length;
        var beforeItem = [];
        const from = 'return.html'

        for (var i = 0; i < selectedItem; i++) {
          beforeItem.push($('input[name="selected_item[' + i + ']"').val());
        }

        self.setExchangeItem(order_id, sProductNo, tProductNo, beforeItem, from);

      }

      // 교환신청 페이지 직접 접근.
      window.onpageshow = function (e) {
        if (e.persisted) {
          document.location.reload();
        } else {
          const uid = $('#sf_user_name').text() || 'None';
          var order_id = window.location.href.split('order_id=')[1].split('&')[0];
          // 페이지 노출수
          if (self.device == 'pc') self.impEC('', uid, device = 'p', logType = 'pageView', order_id = order_id, from = 'exchange.html');
          else self.impEC('', uid, device = 'm', logType = 'pageView', order_id = order_id, from = 'exchange.html');

          $.each($('input[id="apply_product0"]'), function (idx, e) {
            const tProductNo = e.value.split('|')[0];
            // 이미 클릭되어 있다면,
            if (e.checked) {
              $("#piclick-ec").remove();
              if (self.device == 'pc') {
                $("#sPrdList").before('<iframe id="piclick-ec" src="https://ai.piclick.kr/ec/result/benito_v3/' + tProductNo + '?uid=' + uid + '&cookieID=' + self.uid + '&order_id=' + order_id + '&referrer='+ window.location.href + '" width="100%" height=400px" frameborder="0" scrolling="no">');
                self.impEC(tProductNo, uid, device = 'p', logType = 'bannerView', order_id = order_id, from = 'exchange.html');
              } else {
                // 모바일
                $("#applyForm > div > div.ec-base-fold.theme1.selected.eToggle").after('<iframe id="piclick-ec" src="https://ai.piclick.kr/ec/result/benito/m/' + tProductNo + '?uid=' + uid + '&cookieID=' + self.uid + '&order_id=' + order_id + '&referrer='+ window.location.href + '" width="100%" height="730px" frameborder="0" scrolling="no">');
                self.impEC(tProductNo, uid, device = 'm', logType = 'bannerView', order_id = order_id, from = 'exchange.html');
              }
            }

            e.addEventListener("click", function () {
              // 클릭했다면,
              if (e.checked) {
                $("#piclick-ec").remove();
                if (self.device == 'pc') {
                  $("#sPrdList").before('<iframe id="piclick-ec" src="https://ai.piclick.kr/ec/result/benito_v3/' + tProductNo + '?uid=' + uid + '&cookieID=' + self.uid + '&order_id=' + order_id + '&referrer='+ window.location.href + '" width="100%" height="400px" frameborder="0" scrolling="no">');
                  self.impEC(tProductNo, uid, device = 'p', logType = 'bannerView', order_id = order_id, from = 'exchange.html');
                } else {
                  // 모바일
                  $("#applyForm > div > div.ec-base-fold.theme1.selected.eToggle").after('<iframe id="piclick-ec" src="https://ai.piclick.kr/ec/result/benito/m/' + tProductNo + '?uid=' + uid + '&cookieID=' + self.uid + '&order_id=' + order_id + '&referrer='+ window.location.href + '" width="100%" height="730px" frameborder="0" scrolling="no">');
                  self.impEC(tProductNo, uid, device = 'm', logType = 'bannerView', order_id = order_id, from = 'exchange.html');
                }
              } else {
                $("#piclick-ec").remove();
              }
            })
          })

          // 교환하기
          window.addEventListener('message', function (e) {
            var eString = String(e.data);
            if (eString.indexOf('sProductNo') > -1 && eString.indexOf('tProductNo') > -1) {
              var sProductNo = eString.split('sProductNo=')[1].split('&')[0];
              var tProductNo = eString.split('tProductNo=')[1];
              var selectedItem = $('#selected_product').children().length;
              var beforeItem = [];
              const from = 'exchange.html'

              for (var i = 0; i < selectedItem; i++) {
                beforeItem.push($('input[name="selected_item[' + i + ']"').val());
              }

              self.setExchangeItem(order_id, sProductNo, tProductNo, beforeItem, from);

            }
          })
        }
      }

    })
  },

  //
  setExchangeItem: function (order_id, sProductNo, tProductNo, beforeItem, from) {
    var self = this;

    $.ajax({
      type: "GET",
      url: self.ec_api_url + 'getCode/' + sProductNo,
      processData: false,
      contentType: false,
      cache: false,
      crossDomain: true,
      timeout: 2000,
      success: function (sProductCode) {
        var aParam = {}; 0
        aParam['mode'] = 'add';
        aParam['isPopup'] = 'F';
        aParam['is_same_exchange'] = 'F';
        aParam['order_id'] = order_id;

        for (var i = 0; i < beforeItem.length; i++) {
          aParam['selected_item[' + i + ']'] = beforeItem[i];
        }

        aParam['selected_item[' + beforeItem.length + ']'] = sProductNo + '||1||' + sProductCode + '||0||||||F||C'; // sProductNo

        aParam['i'] = '1';
        aParam['ipt'] = '1';
        aParam['n'] = '1';

        OrderApply.callExchangeProductAjax(aParam); // 적용

        const uid = $('#sf_user_name').text() || 'None';

        // 교환신청
        if (self.device == 'pc') {
          var exchangeBtn = document.querySelector('#applyForm > div > div > a.btnSubmitFix.sizeM');
        } else {
          var exchangeBtn = document.querySelector('#applyForm > div > div.ec-base-button.gColumn > a.btnSubmit');
        }

        exchangeBtn.addEventListener('click', function () {
          var exchangeForm = document.getElementById('paySSLForm');
          var clicked = false; // 중복로깅 방지용
          var block = true;

          exchangeForm.onsubmit = function (e) {
            if (block) {
              e.preventDefault();
              block = false;
            }

            exchangeTrack = setInterval(function () {
              if (exchangeForm.action.indexOf('/exec/front/MyShop/OrderHistoryApply/') >= 0 && exchangeForm.target == '_self' && !clicked) {
                clearInterval(exchangeTrack);
                clicked = true;
                if (self.device == 'pc') self.clickEC(sProductNo, tProductNo, uid, device = 'p', logType = 'exchange', order_id = order_id, from = from, detail = '');
                else self.clickEC(sProductNo, tProductNo, uid, device = 'm', logType = 'exchange', order_id = order_id, from = from, detail = '');
              }
            }, 300)
          }
        })
      }
    })
  },

  // 교환추천(반품페이지)
  createEC: function () {
    var self = this;
    document.addEventListener("DOMContentLoaded", function () {
      // 뒤로가기시, BFCache 때문에 이벤트가 제대로 작동하지않음.
      window.onpageshow = function (e) {
        if (e.persisted) {
          document.location.reload();
        } else {
          const uid = $('#sf_user_name').text() || 'None';
          var order_id = window.location.href.split('order_id=')[1].split('&')[0];
          // 페이지 노출수
          if (self.device == 'pc') self.impEC('', uid, device = 'p', logType = 'pageView', order_id = order_id, from = 'return.html');
          else self.impEC('', uid, device = 'm', logType = 'pageView', order_id = order_id, from = 'return.html');

          $.each($('input[id="apply_product0"]'), function (idx, e) {
            const tProductNo = e.value.split('|')[0];
            // 이미 클릭되어 있다면,
            if (self.device == 'pc') {
              if (e.checked) {
                $("#piclick-ec").remove();
                $(".xans-myshop-orderhistoryapplyreturn > div:nth-child(1)").after('<iframe id="piclick-ec" src="https://ai.piclick.kr/ec/result/benito_v3/' + tProductNo + '?uid=' + uid + '&cookieID=' + self.uid + '&order_id=' + order_id + '&referrer='+ window.location.href +'" width="100%" height="400px" frameborder="0" scrolling="no">');
                self.impEC(tProductNo, uid, device = 'p', logType = 'bannerView', order_id = order_id, from = 'return.html');
              }
              e.addEventListener("click", function () {
                // 클릭했다면,
                if (e.checked) {
                  $("#piclick-ec").remove();
                  $(".xans-myshop-orderhistoryapplyreturn > div:nth-child(1)").after('<iframe id="piclick-ec" src="https://ai.piclick.kr/ec/result/benito_v3/' + tProductNo + '?uid=' + uid + '&cookieID=' + self.uid + '&order_id=' + order_id + '&referrer='+ window.location.href +'" width="100%" height="400px" frameborder="0" scrolling="no">');
                  self.impEC(tProductNo, uid, device = 'p', logType = 'bannerView', order_id = order_id, from = 'return.html');
                } else {
                  $("#piclick-ec").remove();
                }
              })
            } else {
              if (e.checked) {
                $("#piclick-ec").remove();
                $(".xans-myshop-orderhistoryapplyreturn > div:nth-child(1)").after('<iframe id="piclick-ec" src="https://ai.piclick.kr/ec/result/benito/m/' + tProductNo + '?uid=' + uid + '&cookieID=' + self.uid + '&order_id=' + order_id + '&referrer='+ window.location.href +'" width="100%" height="730px" frameborder="0" scrolling="no">');
                self.impEC(tProductNo, uid, device = 'm', logType = 'bannerView', order_id = order_id, from = 'return.html');
              }
              e.addEventListener("click", function () {
                // 클릭했다면,
                if (e.checked) {
                  $("#piclick-ec").remove();
                  $(".xans-myshop-orderhistoryapplyreturn > div:nth-child(1)").after('<iframe id="piclick-ec" src="https://ai.piclick.kr/ec/result/benito/m/' + tProductNo + '?uid=' + uid + '&cookieID=' + self.uid + '&order_id=' + order_id + '&referrer='+ window.location.href +'" width="100%" height="730px" frameborder="0" scrolling="no">');
                  self.impEC(tProductNo, uid, device = 'm', logType = 'bannerView', order_id = order_id, from = 'return.html');
                } else {
                  $("#piclick-ec").remove();
                }

              })
            }
          })

          if (self.device == 'pc') var returnBtn = document.querySelector('#applyForm > div > div.ec-base-button > a.btnSubmitFix.sizeM');
          else var returnBtn = document.querySelector('#applyForm > div > div.ec-base-button.gColumn > a.btnSubmit');

          // 반품신청
          returnBtn.addEventListener('click', function () {
            var returnForm = document.getElementById('paySSLForm');
            var clicked = false; // 중복로깅 방지용
            var block = true;

            returnForm.onsubmit = function (e) {
              if (block) {
                e.preventDefault();
                block = false;
              }

              exchangeTrack = setInterval(function () {
                if (returnForm.action.indexOf('/exec/front/MyShop/OrderHistoryApply/') >= 0 && returnForm.target == '_self' && !clicked) {
                  clearInterval(exchangeTrack);
                  clicked = true;
                  // 현재 체크되어있는 것들을 모두 로깅
                  $.each($('input[id="apply_product0"]'), function (idx, e) {
                    if (e.checked) {
                      tProductNo = e.value.split('|')[0];
                      return_detail = $('#reason_select option:selected').val();
                      if (self.device == 'pc') {
                        self.clickEC('', tProductNo, uid, device = 'p', logType = 'return', order_id = order_id, from = 'return.html', detail = return_detail);
                      }
                      else {
                        self.clickEC('', tProductNo, uid, device = 'm', logType = 'return', order_id = order_id, from = 'return.html', detail = return_detail);
                      }
                    }
                  })
                }
              }, 300)
            }
          })
        }
      }
    })
  },

  bannerHeight: function (e, len) {
    switch (len) {
      case 1:
        e.style.height = "155px";
        break;
      case 2:
        e.style.height = "314px";
        break;
      case 3:
        e.style.height = "473px";
        break;
      case 4:
        e.style.height = "632px";
        break;
      default:
        break;
    };
  },

  sirsPC: function (productID, mainImgUrl, product_set_id, referer, debug) {
    var allLoaded = false;
    var self = this;

    $.ajax({
      type: "GET",
      url: self.sirs_api_url + self.au_id + '/' + self.siteID + '_' + productID + '?contentUrl=' + mainImgUrl + '&product_set_id=' + product_set_id + '&banner=true',
      processData: false,
      contentType: false,
      cache: false,
      crossDomain: true,
      timeout: 2000,
      success: function (json) {
        var imgList = [];
        var priceList = [];
        var clickList = [];
        const maxShow = 4; // 최대 이미지 개수
        const showMax = 4; // 시작 display 개수

        if (json.status == 'S') {
          $.each(json.result, function (idx, dict) {
            if (idx >= maxShow) return -1;
            imgList.push(dict.tiny_url);
            priceList.push(numberWithCommas(dict.product_price) + " 원");
            clickList.push(dict.click_url + "&siteID=" + self.siteID + "&referer=" + encodeURI(referer) + "&userID=" + self.uid + "&device=p");
          })

          // 백그라운드 div
          var backgroundBanner = document.createElement('div');
          backgroundBanner.id = 'piclick-bg';
          backgroundBanner.style.display = 'none';
          if (imgList.length < showMax) {
            self.bannerHeight(backgroundBanner, imgList.length);
          }

          var banner = document.createElement('div');
          banner.id = 'piclick-sirs';
          banner.className = 'pc';
          banner.style.display = 'none';

          // 상단 드로어
          var drawer = document.createElement('div');
          drawer.className = 'piclick-drawer opened';
          drawer.id = 'piclick-drawer';
          drawer.insertAdjacentHTML('afterbegin', '<img height="20px" width="30px" src="' + self.drawerDownSrc + '" />');
          drawer.onclick = function () {
            var images_display = [];
            var prices_display = [];
            var drawer = document.getElementById('piclick-drawer');
            var bg = document.getElementById('piclick-bg');
            var images = document.querySelectorAll('#piclick-sirs .s-image');
            var prices = document.querySelectorAll('#piclick-sirs .product-price');

            for (var i = 0; i < images.length; i++) {
              if (images[i].style.display == 'grid' || images[i].style.display == '') {
                images_display.push(images[i])
                prices_display.push(prices[i])
              }
            }

            if (drawer.classList.contains('opened')) {
              drawer.classList.remove('opened');
              drawer.classList.add('closed');
              drawer.firstChild.src = self.drawerUpSrc;
              for (var i = 1; i < images_display.length; i++) {
                images_display[i].style.display = 'none';
                prices_display[i].style.display = 'none';
              }

            } else {
              drawer.classList.remove('closed');
              drawer.classList.add('opened');
              drawer.firstChild.src = self.drawerDownSrc;

              for (var i = 0; i < (images.length < showMax ? images.length : showMax); i++) {
                images[i].style.display = '';
                prices[i].style.display = '';
              }
            }

            images_display = [];
            prices_display = [];

            for (var i = 0; i < images.length; i++) {
              if (images[i].style.display == 'grid' || images[i].style.display == '') {
                images_display.push(images[i])
                prices_display.push(prices[i])
              }
            }

            self.bannerHeight(bg, images_display.length);
          }

          // 오늘 그만보기
          var todayCheck = document.createElement('div');
          todayCheck.className = 'piclick-today';
          todayCheck.innerText = '오늘 하루 열지 않기';
          todayCheck.onclick = function () {
            document.getElementById('piclick-sirs').style.display = 'none';
            document.getElementById('piclick-bg').style.display = 'none';
            self.setCookieDay("todayCookie", "done", 1);
            // 오늘하루그만보기 로그수집용
            $.ajax({
              type: "GET",
              url: 'https://sol.piclick.kr/stopAd?device=p' + '&siteID=' + self.siteID,
              processData: false,
              contentType: false,
              cache: false,
              crossDomain: true,
              timeout: 2000,
              success: function () { }
            })
          };

          // 업&다운
          // var arrowUp = document.createElement('div');
          // arrowUp.className = 'arrow';
          // arrowUp.id = 'arrow-up';
          // arrowUp.insertAdjacentHTML('afterbegin', '<img src="' + self.arrowUpSrc + '" />');

          // var arrowDown = document.createElement('div');
          // arrowDown.className = 'arrow';
          // arrowDown.id = 'arrow-down';
          // arrowDown.insertAdjacentHTML('afterbegin', '<img src="' + self.arrowDownSrc + '" />');

          // 이미지
          var s_images = document.createElement('div');
          s_images.className = 's-images';
          // s_images.appendChild(arrowUp);
          for (var i = 0; i < imgList.length; i++) {
            contaniers = self.createImageImg(imgList[i], priceList[i], clickList[i]);
            s_images.appendChild(contaniers.imageContainer);
            s_images.appendChild(contaniers.productPriceContainer);
          }
          // s_images.appendChild(arrowDown);

          // 타이틀
          var title = document.createElement('div');
          title.id = 'piclick-title';
          title.className = 'piclick-header';
          title.innerText = 'AI 유사 상품 추천';

          // 취합
          banner.appendChild(drawer);
          banner.appendChild(title);
          banner.appendChild(s_images);
          banner.appendChild(todayCheck);

          // Powered By Piclick
          banner.insertAdjacentHTML('beforeend', '<span class="powered">Powered by <span class="piclick">Piclick</span></span>')

          backgroundBanner.appendChild(banner);
          document.body.appendChild(backgroundBanner);

          //////////////////////////////
          //                          //
          //    배너 애니메이션       //
          //                          //
          //////////////////////////////

          const maxImage = 4;

          // 최대이미지
          var images = document.getElementsByClassName('s-image');
          var prices = document.getElementsByClassName('product-price');
          var drawer = document.getElementById('piclick-drawer');

          $('.s-image').css('display', 'none');
          $('.product-price').css('display', 'none');

          for (var i = 0; i < (maxImage > images.length ? images.length : maxImage); i++) {
            images[i].style.display = '';
            prices[i].style.display = '';
          }

          if (images.length == 1) {
            document.getElementById('piclick-bg').style.height = "159px";
          } else if (images.length == 2) {
            document.getElementById('piclick-bg').style.height = "318px";
          } else if (images.length == 3) {
            document.getElementById('piclick-bg').style.height = "477px";
          } else {
            document.getElementById('piclick-bg').style.height = "636px";
          }

          document.getElementById('piclick-title').onclick = function () {
            document.getElementById('piclick-drawer').click();
          }

          // 위치조정
          const between = 220;
          // 사이드 태그
          var sideTag = document.createElement('img');
          const onSrc = self.static_url + 'img/sideTag_pc_bold2.png';
          sideTag.id = 'piclick-sidetag';
          sideTag.className = 'tag-on';
          sideTag.style.display = 'none';
          sideTag.src = onSrc;
          sideTag.onclick = function () {
            if ($('#piclick-sidetag').attr('class') == 'tag-on') {
              $('.s-images-sm .s-image').css('display', '');
              $('.s-images-sm .product-price').css('display', '');
              $('#piclick-sirs-sm').css('display', '');
              $('#piclick-sidetag').attr('class', 'tag-off');
            } else {
              $('#piclick-sirs-sm').css('display', 'none');
              $('#piclick-sidetag').attr('class', 'tag-on');
            }
          }

          var banner_sm = document.createElement('div');
          banner_sm.id = 'piclick-sirs-sm';
          banner_sm.style.display = 'none';

          // 이미지
          var s_images_sm = document.createElement('div');
          s_images_sm.className = 's-images-sm';
          for (var i = 0; i < imgList.length; i++) {
            contaniers = self.createImageImg(imgList[i], priceList[i], clickList[i]);
            s_images_sm.appendChild(contaniers.imageContainer);
            s_images_sm.appendChild(contaniers.productPriceContainer);
          }

          banner_sm.appendChild(s_images_sm)
          banner_sm.insertAdjacentHTML('beforeend', '<span class="powered">Powered by <span class="piclick">Piclick</span></span>')
          document.body.appendChild(banner_sm);
          document.body.appendChild(sideTag);

          imageCheck = setInterval(function () {
            if (self.imageLoaded >= (maxShow > imgList.length ? imgList.length : maxShow)) allLoaded = true;
          }, 50)

          var view = false;

          afterLoaded = setInterval(function () {
            if (allLoaded) {
              clearInterval(imageCheck);

              if (!view) {
                // PC 노출시점 노출++
                $.ajax({
                  type: "GET",
                  url: self.sirs_api_url + 'imp?siteID=' + self.siteID + '&referer=' + encodeURI(referer.split('#')[0]) + '&userID=' + self.uid + '&device=p',
                  processData: false,
                  contentType: false,
                  cache: false,
                  crossDomain: true,
                  timeout: 2000,
                  success: function () { }
                })
                view = true;
              }
              // 이미지를 가릴 시 배너 switch
              var o = self.offset(img);
              if (o.left - between < 0) {
                banner.style.display = 'none';
                backgroundBanner.style.display = 'none';
                sideTag.style.display = '';
              } else {
                sideTag.style.display = 'none';
                banner_sm.style.display = 'none';

                if ($('#piclick-sidetag').attr('class') == 'tag-off') {
                  $('#piclick-sidetag').attr('class', 'tag-on');
                }

                banner.style.left = (o.left / 2 - 145 / 2) + 'px';
                backgroundBanner.style.left = (o.left / 2 - 145 / 2) + 'px';
                if (self.getCookie('todayCookie') == 'done') {
                  banner.style.display = 'none';
                  backgroundBanner.style.display = 'none';
                } else {
                  banner.style.display = '';
                  backgroundBanner.style.display = '';
                }
              }

              // PC처럼 작동하는 모바일일때
              if ($('#sideTag').length > 0) {
                $('#sideTag').css('right', (document.getElementById('piclick-sirs').offsetWidth - 33) + "px")
              }

            }

          }, 100)

        } else {
          console.log("Piclick :", json.result);
        }
      }
    });
  },

  sirsMobile: function (productID, mainImgUrl, product_set_id, referer) {
    var allLoaded = false;
    var self = this;

    if (self.todayCheckCookie.indexOf("done") < 0) {
      jQuery.ajax({
        type: "GET",
        url: self.sirs_api_url + self.au_id + '/' + self.siteID + '_' + productID + '?contentUrl=' + mainImgUrl + '&product_set_id=' + product_set_id + '&banner=true',
        processData: false,
        contentType: false,
        cache: false,
        crossDomain: true,
        timeout: 2000,
        success: function (json) {
          var imgList = [];
          var priceList = [];
          var clickList = [];
          const maxShow = 3;

          if (json.status == 'S') {
            $.each(json.result, function (idx, dict) {
              if (idx >= maxShow) return -1;
              imgList.push(dict.tiny_url);
              priceList.push(numberWithCommas(dict.product_price) + " 원");
              clickList.push(dict.click_url + "&siteID=" + self.siteID + "&referer=" + encodeURI(referer) + "&userID=" + self.uid + "&device=m");
            })

            var banner = document.createElement('div');
            banner.id = 'piclick-sirs';
            banner.className = 'mobile';
            banner.style.display = 'none';

            var s_images = document.createElement('div');
            s_images.className = 's-images';
            for (var i = 0; i < imgList.length; i++) {
              contaniers = self.createImageImg(imgList[i], priceList[i], clickList[i]);
              s_images.appendChild(contaniers.imageContainer);
              s_images.appendChild(contaniers.productPriceContainer);
            }

            // 사이드 태그
            var sideTag = document.createElement('img');
            const onSrc = self.static_url + 'img/sideBanner65_b.png';
            //const offSrc = self.static_url + 'img/benito_drawer_off_big4.png';

            sideTag.id = 'sideTag';
            sideTag.style.display = 'none';
            sideTag.src = onSrc;
            sideTag.onclick = function () {
              if (document.getElementById('piclick-sirs').style.display == 'none') {
                //sideTag.src = onSrc;
                document.getElementById('piclick-sirs').style.display = '';
                // 모바일 노출시점 노출++
                $.ajax({
                  type: "GET",
                  url: self.sirs_api_url + 'imp?siteID=' + self.siteID + '&referer=' + encodeURI(referer.split('#')[0]) + '&userID=' + self.uid + '&device=m',
                  processData: false,
                  contentType: false,
                  cache: false,
                  crossDomain: true,
                  timeout: 2000,
                  success: function () { },
                  error: function (e) {
                    console.log(e);
                  }
                })
              } else {
                //sideTag.src = offSrc;
                document.getElementById('piclick-sirs').style.display = 'none';
              }
            }

            document.body.appendChild(sideTag);

            imageCheck = setInterval(function () {
              if (self.imageLoaded >= (maxShow > imgList.length ? imgList.length : maxShow)) allLoaded = true;
            }, 50)

            afterLoaded = setInterval(function () {
              if (allLoaded) {
                clearInterval(imageCheck);
                document.getElementById('sideTag').style.display = '';
                document.getElementById('sideTag').style.right = (document.getElementById('piclick-sirs').offsetWidth - 33) + "px";

                if ((document.documentElement.scrollTop || document.body.scrollTop) > 60) {
                  // 스냅컴퍼니 작동시 배너가 겹치면 제거

                  if ($('#spm_banner_main').offset() !== null && $('#sideTag').offset() !== null) {
                    var snap_banner = {
                      top: $('#spm_banner_main').offset().top,
                      right: $('#spm_banner_main').offset().left + $('#spm_banner_main').width()
                    }
                    var piclick_banner = {
                      bottom: $('#sideTag').offset().top + $('#sideTag').height(),
                      left: $('#sideTag').offset().left
                    }
                    if (snap_banner.top < piclick_banner.bottom && snap_banner.right > piclick_banner.left) {
                      // overlap
                      $('#sideTag').css('display', 'none');
                    } else {
                      document.getElementById('sideTag').style.display = '';
                      document.getElementById('sideTag').style.right = (document.getElementById('piclick-sirs').offsetWidth - 33) + "px";

                    }
                  } else {
                    document.getElementById('sideTag').style.display = '';
                    document.getElementById('sideTag').style.right = (document.getElementById('piclick-sirs').offsetWidth - 33) + "px";

                  }
                } else {
                  document.getElementById('sideTag').style.display = 'none';
                  //document.getElementById('sideTag').src = offSrc;
                  document.getElementById('piclick-sirs').style.display = 'none';
                }
              }

            }, 50)

            // X버튼
            var xButton = document.createElement('img');
            xButton.id = 'xButton';
            xButton.src = self.xButtonSrc;
            xButton.onclick = function () {
              // 오늘 하루 안보기
              if ($("input:checkbox[id='todayCheck']").is(":checked")) {
                document.getElementById('piclick-sirs').style.display = 'none';
                document.getElementById('sideTag').style.display = 'none';
                self.setCookieDay("todayCookie", "done", 1);
                $.ajax({
                  type: "GET",
                  url: 'https://sol.piclick.kr/stopAd?device=m' + '&siteID=' + self.siteID,
                  processData: false,
                  contentType: false,
                  cache: false,
                  crossDomain: true,
                  timeout: 2000,
                  success: function () { }
                })
              }
              else {
                // document.getElementById('sideTag').src = self.static_url + 'img/benito_drawer_off_big4.png';
                document.getElementById('piclick-sirs').style.display = 'none';
                // sideTag.style.right = "-33px";
              }
            };

            // 취합
            banner.appendChild(s_images);
            banner.appendChild(xButton);
            // 오늘 하루 열지 않음
            banner.insertAdjacentHTML("beforeend", "<p id='todayCheck'><input type='checkbox' id='todayCheck'> <label for='todayCheck'>오늘 하루 열지 않기</label></p>")
            // 배너 생성 끝
            // 배너 추가
            document.body.appendChild(banner);

          } else {
            console.log(json.result)
          }
        }
      });
    }
  },

  sirsMobile2: function (productID, mainImgUrl, referer) {
    var self = this;

    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/benito/' + productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + mainImgUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';

    $('.prdDesc').append(iframe);

    window.addEventListener('message', function (e) {

      if (e.data == 'piclick-banner-open') {
        $('#piclick-sirs-iframe').css('display', '');
        itv = setInterval(function () {
          var iframe = document.getElementById('piclick-sirs-iframe');
          if (iframe.offsetTop + iframe.offsetHeight - window.screen.height < window.scrollY && window.scrollY < iframe.offsetTop + iframe.offsetHeight) {
            // 모바일 노출시점 노출++
            $.ajax({
              type: "GET",
              url: 'https://sol.piclick.kr/similarSearch/imp' + '?siteID=' + self.siteID + '&referer=' + encodeURI(referer.split('#')[0]) + '&userID=' + self.uid + '&device=m',
              processData: false,
              contentType: false,
              cache: false,
              crossDomain: true,
              timeout: 2000,
              success: function () { },
              error: function (e) { console.log(e) }
            })
            clearInterval(itv);
          }
        }, 500);
      } else if (e.data == 'piclick-banner-close') {
        $('#piclick-sirs-iframe').css('display', 'none');
      } else if (String(e.data).indexOf('height:') > -1) {
        $('#piclick-sirs-iframe').css('height', parseInt(String(e.data).split(':')[1]));
      }
    })
  },

  logNpay: function(idx, productID, quantity, product_price, userID, cookieID, device, referer) {
    var self = this;

    var nPayIframe = document.createElement('iframe');
    nPayIframe.id = 'piclick-nPay-iframe-' + idx;
    nPayIframe.src = 'https://sol.piclick.kr/nPay/log' + '?siteID=' + self.siteID + '&idx=' + idx + '&productID=' + productID + '&quantity=' + quantity + '&product_price=' + product_price + '&userID=' + userID + '&cookieID=' + cookieID + '&device=' + device + '&referer=' + encodeURI(referer);
    nPayIframe.display = 'none';
    nPayIframe.width = '0';
    
    window.addEventListener('message', function (e) {
      if(e.data == 'PICLICK-IFRAME-'+ idx +'-CLOSE') $('#piclick-nPay-iframe-' + idx).remove();
    })
  
    document.body.appendChild(nPayIframe);
  },

  checkNpay: function(productID, referer) {
    var self = this;

    const userID = $('#sf_user_name').text() || 'None';
    const cookieID = self.uid;
    
    // 네이버 페이 $('.npay_btn_link.npay_btn_pay');
    // 네이버 찜 = $('.npay_btn_link.npay_btn_zzim');

    itv = setInterval(function(){
      if($('.npay_btn_link.npay_btn_pay').length > 0){
        clearInterval(itv);

        $('.npay_btn_link.npay_btn_pay').bind('click', function(){
          var items = [];
          var data = new Object;
    
          if (self.device == 'pc'){
            $('.option_product').each(function(idx, product){
              var $item = {
                // product_name: product.children[0].innerText.split('\n')[0].trim(),
                // product_option: product.children[0].innerText.split('\n')[1].split('-')[1].trim(),
                quantity: product.children[1].querySelector('input').value,
                product_price: product.children[2].innerText.split('\n')[0].replace(',','').replace('원',''),
              };
              items.push($item);

              self.logNpay(idx, productID, $item.quantity, $item.product_price , userID, cookieID, device='p', referer);
            })
   
          }else {
            $('.option_product').each(function(idx, product){
              var $item = {
                // product_name: product.querySelector('.product strong').innerText,
                // product_option: product.children[0].innerText.split('\n')[0].split('-')[1].trim(),
                quantity: product.children[0].querySelector('p input').value,
                product_price: product.children[1].querySelector('input').value.replace(',','').replace('원',''),
              };
              items.push($item);
              self.logNpay(idx, productID, $item.quantity, $item.product_price , userID, cookieID, device='m', referer);

            })
          }
        })
      }
    },500)    

    
  },


  // 유사추천솔루션
  createBanner: function (site_name, mainImg, subImg, solution_type) {
    var self = this;
    var referer = top.location.href;
    var productID;
    const product_set_id = 'AIPIC_KR';

    switch (solution_type) {
      case 1: //cafe24
        if (typeof iProductNo == "undefined" || iProductNo == "productID") {
          productID = window.location.href.split('/')[5];
          if (typeof productID == "undefined") productID = window.location.href.split('/')[4].split('=')[1].split('&')[0];
          if (productID == "productID") productID = window.location.href.split('/')[4].split('=')[1].split('&')[0];
        }
        else productID = iProductNo;

        // 간혹 이상한 productID값이 들어옴.
        if (String(productID).indexOf('product_no=') >= 0) productID = productID.split('product_no=')[1].split('&')[0];
        break;
      case 2: // makeshop
        if (typeof iProductNo == "undefined" || iProductNo == "productID") {
          productID = window.location.href.split('branduid=')[1].split('&')[0];
        }
        break;
      default: // else
        if (site_name == 'feelway' && window.location.href.indexOf('g_no') > -1) {
          productID = window.location.href.split('g_no=')[1];
        }
        break;
    }

    // PC
    if (self.device == 'pc') {
      urls = self.checkParams(site_name, mainImg, subImg)
      if (urls) {
        //일단 1개만
        mainImgUrl = urls[0];
        //메인
        if (document.readyState !== 'loading') {
          $.ajax({
            url: 'https://api.ipify.org?format=json',
            type: 'get',
            success: function (json) {
              var ip = json.ip;
              if (ip == '1.214.196.202' || ip == '221.148.226.238' || ip == '14.40.34.61') {
                self.sirsPC(productID, mainImgUrl, product_set_id, referer);
              }

            }
          })
          self.checkNpay(productID, referer);
        } else {
          document.addEventListener("DOMContentLoaded", function () {
            if (document.readyState !== 'loading') {
              $.ajax({
                url: 'https://api.ipify.org?format=json',
                type: 'get',
                success: function (json) {
                  var ip = json.ip;
                  if (ip == '1.214.196.202' || ip == '221.148.226.238' || ip == '14.40.34.61') {
                    self.sirsPC(productID, mainImgUrl, product_set_id, referer);
                  }
    
                }
              })
              self.checkNpay(productID, referer);
            }
          })
        }
      }
    }
    // 모바일
    else {
      urls = self.checkParams(site_name, mainImg, subImg)
      mainImgUrl = urls[0];
      if (document.readyState !== 'loading') {
        $.ajax({
          url: 'https://api.ipify.org?format=json',
          type: 'get',
          success: function (json) {
            var ip = json.ip;
            if (ip == '1.214.196.202' || ip == '221.148.226.238' || ip == '14.40.34.61') {
              self.sirsMobile2(productID, mainImgUrl, referer);
            }

          }
        })
        self.checkNpay(productID, referer);
      } else {
        document.addEventListener("DOMContentLoaded", function () {
          if (document.readyState !== 'loading') {
            $.ajax({
              url: 'https://api.ipify.org?format=json',
              type: 'get',
              success: function (json) {
                var ip = json.ip;
                if (ip == '1.214.196.202' || ip == '221.148.226.238' || ip == '14.40.34.61') {
                  self.sirsMobile2(productID, mainImgUrl, referer);
                }
    
              }
            })
            self.checkNpay(productID, referer);
          }
        })
      }
    }

  },
}

// 스크립트 자동 실행
var site_name = 'benito';
var solution_type = 1 // 1: cafe24, 2: makeshop, 3: else
var piclick = new Piclick();
var pageID = document.querySelector('meta[name="path_role"]').content;
var unique = + new Date();

// 제품 상세페이지
if (pageID == 'PRODUCT_DETAIL') {
  // CSS 추가
  var styleSheet = document.createElement('link');
  styleSheet.setAttribute('rel', 'stylesheet');
  styleSheet.setAttribute('type', 'text/css');
  styleSheet.setAttribute('href', piclick.static_url + 'css/v1/piclick-aireco-' + site_name + '.css?' + unique++);
  document.getElementsByTagName('head')[0].appendChild(styleSheet);
  if (piclick.device == 'pc') {
    if (document.querySelector('.BigImage') !== null) {
      piclick.createBanner(site_name, document.querySelector('.BigImage'), document.querySelector('#prdDetail > div > div:nth-child(12) > img'), solution_type);
    }
    else {
      piclick.device = 'mobile';
      piclick.createBanner(site_name, document.querySelector('.bigImage'), document.querySelector('.bigImage'), solution_type);
    }
  }
  // Mobile
  else {
    piclick.device = 'mobile';
    piclick.createBanner(site_name, document.querySelector('.bigImage'), document.querySelector('.bigImage'), solution_type);
  }

} //반품 페이지
else if (pageID == 'MYSHOP_ORDER_RETURN' || location.href.indexOf('return.html') >= 0) {
  piclick.createEC();
} //교환 페이지
else if (pageID == 'MYSHOP_ORDER_EXCHANGE' || location.href.indexOf('exchange.html') >= 0) {
  piclick.connectEC();
} // 주문 상세 페이지
else if (pageID == 'MYSHOP_ORDER_DETAIL') {
}

