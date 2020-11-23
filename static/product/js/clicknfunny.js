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
  initialize: function (data) {
    var self = this;
    this.sol_version = 'v1';
    this.au_id = '2431';
    this.siteID = '82';
    this.sirs_api_url = 'https://sol.piclick.kr/similarSearch/';
    this.static_url = 'https://reco.piclick.kr/static/';
    this.device;
    this.imageLoaded = 0;

    // 디바이스 체크
    var filter = "win16|win32|win64|mac|macintel";
    if (navigator.platform) {
      if (filter.indexOf(navigator.platform.toLocaleLowerCase()) < 0) {
        this.device = 'mobile';
      } else {
        this.device = 'pc';
      };
    }

    // uid 체크 (Piclick User ID)
    self.uid = self.getCookie('_pa');
    if (self.uid === null || self.uid.length !== 21) {
      self.uid = self.uidCreate();
    }

    // 오늘 하루 안보기
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
      // 메인이미지
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
      urls.push("https://www.clicknfunny.com" + imgUrl);
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

  insertIcoverScript: function () {
    // icover 스크립트 삽입
    function ADAllShop_getParameterByName(name) {

      var script = document.getElementsByTagName('script');

      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(script[script.length - 1].src);

      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));

    }

    function ADAllShop_isMobile() {

      var UserAgent = navigator.userAgent;

      if (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || UserAgent.match(/LG|SAMSUNG|Samsung/) != null) {
        return true;
      }
      else {
        return false;
      }

    }

    function AdAllShopICover() {

      // var sCode = ADAllShop_getParameterByName('SCode');
      // var pCode = ADAllShop_getParameterByName('PCode');
      // var mCode = ADAllShop_getParameterByName('MCode');
      
      // 파라미터 고정.
      const sCode = 'NDY2NA==';
      const pCode = '';
      const mCode = '';

      var ICoverCode = "<iframe src='//script.theprimead.co.kr/winggoSetCookiePage.php?code=" + sCode + "&_NMNCODE_=https%3A%2F%2Fmediaindex.co.kr%2FPSR%2FPsrClick.php";

      if (ADAllShop_isMobile()) {
        ICoverCode = ICoverCode + encodeURIComponent(mCode) + "'";
      }
      else {
        ICoverCode = ICoverCode + encodeURIComponent(pCode) + "'";
      }

      ICoverCode = ICoverCode + " height='0' width='0'></iframe>";

      console.log(ICoverCode);

      //document.write(ICoverCode);
      $('body').append(ICoverCode);
    }

    AdAllShopICover();
  },

  sirsPC2: function (productID, mainImgUrl, referer) {
    var self = this;

    var piclick_div = document.createElement('div');
    piclick_div.className = 'piclick-iframe';
    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/clicknfunny_pc/' + productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + mainImgUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';

    piclick_div.appendChild(iframe);
    $('.topwrap.comm-w2.clear').after(piclick_div);

    window.addEventListener('message', function (e) {

      if (e.data == 'piclick-banner-open') {
        $('#piclick-sirs-iframe').css('display', '');
        itv = setInterval(function () {
          var iframe = document.getElementById('piclick-sirs-iframe');
          if (iframe.offsetTop + iframe.offsetHeight - window.screen.height < window.scrollY && window.scrollY < iframe.offsetTop + iframe.offsetHeight) {
            // 모바일 노출시점 노출++
            $.ajax({
              type: "GET",
              url: 'https://sol.piclick.kr/similarSearch/imp' + '?siteID=' + self.siteID + '&referer=' + encodeURI(referer.split('#')[0]) + '&userID=' + self.uid + '&device=p',
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
        $('#piclick-sirs-iframe').css('border', 'none');
      } else if (String(e.data).indexOf('height:') > -1) {
        $('#piclick-sirs-iframe').css('height', parseInt(String(e.data).split(':')[1]));
      }
    })
  },

  sirsMobile2: function (productID, mainImgUrl, referer) {
    var self = this;

    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/clicknfunny/' + productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + mainImgUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';

    $('.shopdetailInfo').after(iframe);

    aitv = setInterval(() => {
      if ($('.analyans-wrap-line').length > 0) {
        $('.analyans-wrap-line').remove();
        clearInterval(aitv);
      }
    }, 500);

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

  logNpay: function (idx, productID, quantity, product_price, userID, cookieID, device, referer) {
    var self = this;

    var nPayIframe = document.createElement('iframe');
    nPayIframe.id = 'piclick-nPay-iframe-' + idx;
    nPayIframe.src = 'https://sol.piclick.kr/nPay/log' + '?siteID=' + self.siteID + '&idx=' + idx + '&productID=' + productID + '&quantity=' + quantity + '&product_price=' + product_price + '&userID=' + userID + '&cookieID=' + cookieID + '&device=' + device + '&referer=' + encodeURI(referer);
    nPayIframe.display = 'none';
    nPayIframe.width = '0';

    window.addEventListener('message', function (e) {
      if (e.data == 'PICLICK-IFRAME-' + idx + '-CLOSE') $('#piclick-nPay-iframe-' + idx).remove();
    })

    document.body.appendChild(nPayIframe);
  },

  checkNpay: function (productID, referer) {
    var self = this;

    const userID = 'None';
    const cookieID = self.uid;

    // 네이버 페이 $('.npay_btn_link.npay_btn_pay');
    // 네이버 찜 = $('.npay_btn_link.npay_btn_zzim');
    nPayItv = setInterval(function () {
      if (document.querySelector('.npay_btn_link.npay_btn_pay')) {
        clearInterval(nPayItv);
        $('.npay_btn_link.npay_btn_pay').bind('click', function () {
          var items = [];
          var data = new Object;

          if (self.device == 'pc') {
            $('ul.MK_inner-opt-cm li').each(function (idx, product) {
              var $item = {
                quantity: product.querySelector('.MK_qty-ctrl input').value,
                product_price: product.querySelector('.MK_price span').innerText.replace(',', '').replace('원', ''),
              };
              items.push($item);
              self.logNpay(idx, productID, $item.quantity, $item.product_price, userID, cookieID, device = 'p', referer);

            })

          } else {
            $('ul.MK_inner-opt-cm li').each(function (idx, product) {
              var $item = {
                quantity: product.querySelector('.MK_qty-ctrl input').value,
                product_price: product.querySelector('.MK_price span').innerText.replace(',', '').replace('원', ''),
              };
              items.push($item);
              self.logNpay(idx, productID, $item.quantity, $item.product_price, userID, cookieID, device = 'm', referer);

            })
          }
        })
      }
    }, 1000)



  },

  createBanner: function (site_name, mainImg, subImg, solution_type) {
    var self = this;
    var referer = top.location.href;
    var productID;

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

    if (self.device == 'pc') {
      urls = self.checkParams(site_name, mainImg, subImg)
      mainImgUrl = urls[0];
      if (self.todayCheckCookie.indexOf("done") < 0) {
        self.sirsPC2(productID, mainImgUrl, referer);
        self.checkNpay(productID, referer);
        self.insertIcoverScript();
      }
    }
    else {
      urls = self.checkParams(site_name, mainImg, subImg)
      mainImgUrl = urls[0];

      if (document.readyState !== 'loading') {
        self.sirsMobile2(productID, mainImgUrl, referer);
        self.checkNpay(productID, referer);
        self.insertIcoverScript();


      } else {
        document.addEventListener("DOMContentLoaded", function () {
          if (document.readyState !== 'loading') {
            self.sirsMobile2(productID, mainImgUrl, referer);
            self.checkNpay(productID, referer);
            self.insertIcoverScript();

          }
        })
      }

    }
  },
}

var site_name = 'clicknfunny';
var solution_type = 2;
var piclick = new Piclick();
var unique = + new Date();

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.href.indexOf('shopdetail.html') > -1 || window.location.href.indexOf('/m/product.html') > -1) {
    // CSS 추가
    var styleSheet = document.createElement('link');
    styleSheet.setAttribute('rel', 'stylesheet');
    styleSheet.setAttribute('type', 'text/css');
    styleSheet.setAttribute('href', piclick.static_url + 'product/css/' + site_name + '.css?' + unique++);
    document.getElementsByTagName('head')[0].appendChild(styleSheet);

    const mainImgTag = '#detail > div.topwrap.comm-w2.clear > div.left > div.det_prd_img > img';

    if (piclick.device == 'pc') {
      if (document.querySelector(mainImgTag) !== null) {
        piclick.createBanner(site_name, document.querySelector(mainImgTag), document.querySelectorAll(mainImgTag), solution_type);
      }
      else {
        piclick.device = 'mobile';
        piclick.createBanner(site_name, document.querySelector('div.shopdetailInfoTop > figure > img'), document.querySelector('div.shopdetailInfoTop > figure > img'), solution_type);
      }
    }
    // Mobile
    else {
      piclick.createBanner(site_name, document.querySelector('div.shopdetailInfoTop > figure > img'), document.querySelector('div.shopdetailInfoTop > figure > img'), solution_type);
    }
  }
})