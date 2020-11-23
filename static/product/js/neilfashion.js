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
    this.au_id = '2290';
    this.siteID = '62';
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
      urls.push("https:" + imgUrl);
      return urls
    }
    else return false;
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

  sirsPC2: function (productID, mainImgUrl, referer) {
    var self = this;

    var piclick_div = document.createElement('div');
    piclick_div.className = 'piclick-iframe';
    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/neilfashion_pc/' + productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + mainImgUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';

    piclick_div.appendChild(iframe);
    $('.xans-element-.xans-product.xans-product-detail').after(piclick_div);

    window.addEventListener('message', function (e) {
      if (e.data == 'piclick-banner-open') {
        document.getElementById('piclick-sirs-iframe').style.display = '';
        itv = setInterval(function () {
          var iframe = document.getElementById('piclick-sirs-iframe');
          if (iframe.offsetTop + iframe.offsetHeight - window.screen.height < window.scrollY && window.scrollY < iframe.offsetTop + iframe.offsetHeight) {
            // PC 노출시점 노출++
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
        document.getElementById('piclick-sirs-iframe').style.display = 'none';
        $('#piclick-sirs-iframe').css('border','none');

      } else if (String(e.data).indexOf('height:') > -1) {
        document.getElementById('piclick-sirs-iframe').style.height = parseInt(String(e.data).split(':')[1]) + 'px';
      }
    })
  },

  sirsMobile2: function (productID, mainImgUrl, referer) {
    var self = this;

    var piclick_div = document.createElement('div');
    piclick_div.className = 'piclick-iframe-m';
    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/neilfashion/' + productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + mainImgUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';

    piclick_div.appendChild(iframe);
    $('.xans-element-.xans-product.xans-product-detail').after(piclick_div);

    window.addEventListener('message', function (e) {

      if (e.data == 'piclick-banner-open') {
        document.getElementById('piclick-sirs-iframe').style.display = '';
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
        document.getElementById('piclick-sirs-iframe').style.display = 'none';
        $('#piclick-sirs-iframe').css('border','none');

      } else if (String(e.data).indexOf('height:') > -1) {
        document.getElementById('piclick-sirs-iframe').style.height = parseInt(String(e.data).split(':')[1]) + 'px';
      }
    })
  },

  logNpay: function (productID, data, userID, cookieID, device, referer) {
    var self = this;

    $.ajax({
      type: "GET",
      url: 'https://sol.piclick.kr/nPay' + '?siteID=' + self.siteID + '&productID=' + productID + '&userID=' + userID + '&cookieID=' + cookieID + '&device=' + device + '&referer=' + encodeURI(referer),
      data: data,
      crossDomain: true,
      timeout: 2000,
      success: function () { },
      error: function (e) { console.log(e) }
    })
  },

  checkNpay: function (productID, referer) {
    var self = this;

    const userID = 'None';
    const cookieID = self.uid;

    // 네이버 페이 $('.npay_btn_link.npay_btn_pay');
    // 네이버 찜 = $('.npay_btn_link.npay_btn_zzim');
    itv = setInterval(function () {
      clearInterval(itv);
      if (document.querySelectorAll('.npay_btn_link.npay_btn_pay').length > 0) {
        $('.npay_btn_link.npay_btn_pay').bind('click', function () {
          var items = [];
          var data = new Object;

          if (self.device == 'pc') {
            $('ul.MK_inner-opt-cm li').each(function (idx, product) {
              var $item = {
                product_name: $('#form1 > div.titname').text().trim(),
                product_option: product.querySelector('.MK_p-name').innerText,
                quantity: product.querySelector('.MK_qty-ctrl input').value,
                product_price: product.querySelector('.MK_price span').innerText.replace(',', '').replace('원', ''),
              };
              items.push($item);
            })

            // var total_price = $('#totalPrice .total strong').text().replace(',','').replace('원','');

            data = {
              // 'total_price': total_price,
              'items_length': items.length,
              'items': items
            }

            self.logNpay(productID, data, userID, cookieID, device = 'p', referer);

          } else {
            $('ul.MK_inner-opt-cm li').each(function (idx, product) {
              var $item = {
                product_name: $('#contents > main > section > div.SMS_ShopDetail_layout > div.SMS_ShopDetail_layout_right > div.shop_de_name > div > span').text().trim(),
                product_option: product.querySelector('.MK_p-name').innerText,
                quantity: product.querySelector('.MK_qty-ctrl input').value,
                product_price: product.querySelector('.MK_price span').innerText.replace(',', '').replace('원', ''),
              };
              items.push($item);
            })

            // var total_price = $('#totalPrice .total strong').text().replace(',','').replace('원','');

            data = {
              // 'total_price': total_price,
              'items_length': items.length,
              'items': items
            }

            self.logNpay(productID, data, userID, cookieID, device = 'm', referer);

          }

        })
      }
    }, 500)



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
        // self.checkNpay(productID, referer);
      }
    }
    else {
      urls = self.checkParams(site_name, mainImg, subImg)
      mainImgUrl = urls[0];

      if (document.readyState !== 'loading') {
        self.sirsMobile2(productID, mainImgUrl, referer);
        // self.checkNpay(productID, referer);

      } else {
        document.addEventListener("DOMContentLoaded", function () {
          if (document.readyState !== 'loading') {
            self.sirsMobile2(productID, mainImgUrl, referer);
            // self.checkNpay(productID, referer);

          }
        })
      }

    }
  },
}

// 스크립트 자동 실행
var site_name = 'neilfashion';
var solution_type = 1 // 1: cafe24, 2: makeshop, 3: else
var sirs = new Piclick();
var pageID = document.querySelector('meta[name="path_role"]').content;
var unique = + new Date();

// 제품 상세페이지
if (pageID == 'PRODUCT_DETAIL') {
  // CSS 추가
  var styleSheet = document.createElement('link');
  styleSheet.setAttribute('rel', 'stylesheet');
  styleSheet.setAttribute('type', 'text/css');
  styleSheet.setAttribute('href', sirs.static_url + 'product/css/' + site_name + '.css?' + unique++);
  document.getElementsByTagName('head')[0].appendChild(styleSheet);
  if (sirs.device == 'pc') {
    if (document.querySelector('.BigImage') !== null) {
      sirs.createBanner(site_name, document.querySelector('.BigImage'), null, solution_type);
    }
    else {
      sirs.device = 'mobile';
      sirs.createBanner(site_name, document.querySelector('.bigImage'), null, solution_type);
    }
  }
  // Mobile
  else {
    sirs.device = 'mobile';
    sirs.createBanner(site_name, document.querySelector('.bigImage'), null, solution_type);
  }
}


// var xmlhttp = new XMLHttpRequest();
// xmlhttp.onreadystatechange = function() {
//   if (xmlhttp.readyState == XMLHttpRequest.DONE){
//     if (xmlhttp.status == 200){
//       if(JSON.parse(xmlhttp.response).ip == '1.214.196.202'){
//         ///
//       }
//     }else if (xmlhttp.status == 400){
//       console.log('error')
//     }else{
//       console.log('what')
//     }
//   }
// }
// xmlhttp.open("GET", "https://api.ipify.org?format=json")
// xmlhttp.send();


// $.ajax({
//   url: 'https://api.ipify.org?format=json',
//   type: 'get',
//   success: function (json) {
//     var ip = json.ip;
//     if (ip == '1.214.196.202' || ip == '221.148.226.238') {

//     }
//   }
// })