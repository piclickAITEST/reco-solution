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

    self.sirs_api_url = 'https://sol.piclick.kr/similarSearch/';
    self.static_url = 'https://reco.piclick.kr/static/';
    self.imp_url = 'https://sol.piclick.kr/similarSearch/imp';
    self.npay_click_url = 'https://sol.piclick.kr/nPay/log';

    self.siteName = data.siteName;
    self.auID = data.auID;
    self.siteID = data.siteID;
    self.referrer = top.location.href;
    self.productID;
    self.contentUrl;
    self.device;

    self.imageLoaded = 0;

    self.checkDevice();
    self.addCSS2Page();

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
    self.drawerUpSrc = self.static_url + 'img/arrow_up.png';
    self.drawerDownSrc = self.static_url + 'img/arrow_down.png';
    self.xButtonSrc = self.static_url + 'img/xButton.png';
  },

  checkDevice: function() {
    var self = this;
    // 디바이스 체크
    var filter = "win16|win32|win64|mac|macintel";
    if (navigator.platform) {
      if (filter.indexOf(navigator.platform.toLocaleLowerCase()) < 0) self.device = 'm';
      else self.device = 'p';
    }
  },
  
  addCSS2Page: function (){
    var self = this;
    var unique = + new Date();
    var styleSheet = document.createElement('link');
    styleSheet.setAttribute('rel', 'stylesheet');
    styleSheet.setAttribute('type', 'text/css');
    styleSheet.setAttribute('href', self.static_url + 'product/css/' + self.site_name + '.css?' + unique++);
  },

  checkParams: function () {
    var attr = (typeof attr !== 'undefined') ? attr : 'src'; // default : src
    var urls = [];

    var mainImg = document.querySelector()

    if (self.site_name !== undefined && mainImg !== undefined && subImg !== undefined) {
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
      if (/(http(s?)):\/\//i.test(imgUrl)) {
        urls.push(imgUrl);
      } else {
        urls.push("https:" + imgUrl);
      }

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

  getBanner_pc_hz: function () {
    var self = this;
    var finder = false;
    const insertIntoSelector = '.srlite_container';

    var piclick_div = document.createElement('div');
    piclick_div.className = 'piclick-iframe';
    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/' + self.site_name + '_pc/' + self.productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + self.contentUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';
    piclick_div.appendChild(iframe);

    if (document.querySelector(insertIntoSelector)) {
      finder = true;
      document.querySelector(insertIntoSelector).before(piclick_div);
    } else {
      finditv = setInterval(function () {
        if (!finder && document.querySelector(insertIntoSelector)) {
          finder = true;
          clearInterval(finditv);
          document.querySelector(insertIntoSelector).before(piclick_div);
        }
      }, 500)
    }

    window.addEventListener('message', function (e) {
      if (e.data == 'piclick-banner-open') {
        document.getElementById('piclick-sirs-iframe').style.display = '';
        itv = setInterval(function () {
          var iframe = document.getElementById('piclick-sirs-iframe');
          if (iframe.offsetTop + iframe.offsetHeight - window.screen.height < window.scrollY && window.scrollY < iframe.offsetTop + iframe.offsetHeight) {
            // PC 노출시점 노출++
            $.ajax({
              type: "GET",
              url: self.imp_url + '?siteID=' + self.siteID + '&referer=' + encodeURI(self.referrer.split('#')[0]) + '&userID=' + self.uid + '&device=p',
              timeout: 2000,
              success: function () { },
              error: function (e) { console.log(e) }
            })
            clearInterval(itv);
          }
        }, 500);
      } else if (e.data == 'piclick-banner-close') {
        document.getElementById('piclick-sirs-iframe').style.display = 'none';
        $('.piclick-iframe').css('border', 'none');

      } else if (String(e.data).indexOf('height:') > -1) {
        document.getElementById('piclick-sirs-iframe').style.height = parseInt(String(e.data).split(':')[1]) + 'px';
      }
    })
  },

  getBanner_mob_hz: function () { 
    var self = this;
    const insertIntoSelector = '#etc-button';

    var piclick_div = document.createElement('div');
    piclick_div.className = 'piclick-iframe-m';
    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/' + self.site_name + '/' + self.productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + self.contentUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';
    piclick_div.appendChild(iframe);

    document.querySelector(insertIntoSelector).after(piclick_div);

    window.addEventListener('message', function (e) {
      if (e.data == 'piclick-banner-open') {
        document.getElementById('piclick-sirs-iframe').style.display = '';
        itv = setInterval(function () {
          var iframe = document.getElementById('piclick-sirs-iframe');
          if (iframe.offsetTop + iframe.offsetHeight - window.screen.height < window.scrollY && window.scrollY < iframe.offsetTop + iframe.offsetHeight) {
            // 모바일 노출시점 노출++
            $.ajax({
              type: "GET",
              url: self.imp_url + '?siteID=' + self.siteID + '&referer=' + encodeURI(self.referrer.split('#')[0]) + '&userID=' + self.uid + '&device=' + self.device,
              timeout: 2000,
              success: function () {},
              error: function (e) { console.log(e) }
            })
            clearInterval(itv);
          }
        }, 500);
      } else if (e.data == 'piclick-banner-close') {
        document.getElementById('piclick-sirs-iframe').style.display = 'none';
        $('#piclick-sirs-iframe').css('border', 'none');

      } else if (String(e.data).indexOf('height:') > -1) {
        document.getElementById('piclick-sirs-iframe').style.height = parseInt(String(e.data).split(':')[1]) + 'px';
      }
    })
  },

  setNpayChecker: function () {
    var self = this;

    const userID = 'None';
    const cookieID = self.uid;

    // 네이버 페이 $('.npay_btn_link.npay_btn_pay');
    // 네이버 찜 = $('.npay_btn_link.npay_btn_zzim');

    itv = setInterval(function () {
      if (document.querySelector('.npay_btn_link.npay_btn_pay')) {
        clearInterval(itv);

        $('.npay_btn_link.npay_btn_pay').bind('click', function () {
          var items = [];
          if (self.device == 'p') {
            $('.option_product').each(function (idx, product) {
              var $item = {
                // product_name: product.children[0].innerText.split('\n')[0].trim(),
                // product_option: product.children[0].innerText.split('\n')[1].split('-')[1].trim(),
                quantity: product.children[1].querySelector('input').value,
                product_price: product.children[2].innerText.split('\n')[0].replace(',', '').replace('원', ''),
              };
              items.push($item);

              self.logNpay(idx, self.productID, $item.quantity, $item.product_price, userID, cookieID);
            })

          } else {
            $('.option_product').each(function (idx, product) {
              var $item = {
                // product_name: product.querySelector('.product strong').innerText,
                // product_option: product.children[0].innerText.split('\n')[0].split('-')[1].trim(),
                quantity: product.children[0].querySelector('p input').value,
                product_price: product.children[1].querySelector('input').value.replace(',', '').replace('원', ''),
              };
              items.push($item);
              self.logNpay(idx, self.productID, $item.quantity, $item.product_price, userID, cookieID);

            })
          }
        })
      }
    }, 500)
  },

  logNpay: function (idx, quantity, product_price, userID, cookieID) {
    var self = this;

    var nPayIframe = document.createElement('iframe');
    nPayIframe.id = 'piclick-nPay-iframe-' + idx;
    nPayIframe.src = self.npay_click_url + '?siteID=' + self.siteID + '&idx=' + idx + '&productID=' + self.productID + '&quantity=' + quantity + '&product_price=' + product_price + '&userID=' + userID + '&cookieID=' + cookieID + '&device=' + self.device + '&referer=' + encodeURI(self.referrer);
    nPayIframe.display = 'none';
    nPayIframe.width = '0';

    window.addEventListener('message', function (e) {
      if (e.data == 'PICLICK-IFRAME-' + idx + '-CLOSE') $('#piclick-nPay-iframe-' + idx).remove();
    })

    document.body.appendChild(nPayIframe);
  },

  createBanner: function () {
    var self = this;
    var bannerOpen = false;
    var urls = self.checkParams();
    self.contentUrl = urls[0];
    
    switch (self.solution_type) {
      // CAFE24
      case 1: 
        const pageID = document.querySelector('meta[name="path_role"]').content;

        if (typeof iProductNo == "undefined" || iProductNo == "productID") {
          self.productID = window.location.href.split('/')[5];
          if (typeof self.productID == "undefined") self.productID = window.location.href.split('/')[4].split('=')[1].split('&')[0];
          if (self.productID == "productID") self.productID = window.location.href.split('/')[4].split('=')[1].split('&')[0];
        }
        else self.productID = iProductNo;

        // 간혹 이상한 productID값이 들어옴.
        if (String(self.productID).indexOf('product_no=') >= 0) self.productID = self.productID.split('product_no=')[1].split('&')[0];

        // 상세페이지에서만 작동.
        if (pageID == 'PRODUCT_DETAIL') bannerOpen = true;

        break;
      // Makeshop
      case 2: 
        if (typeof iProductNo == "undefined" || iProductNo == "productID") {
          self.productID = window.location.href.split('branduid=')[1].split('&')[0];
        }
        
        // 상세페이지에서만 작동.
        if (window.location.href.indexOf('shopdetail.html') > -1 || window.location.href.indexOf('/m/product.html') > -1) bannerOpen = true;
        break;
      // else
      default: 
        if (site_name == 'feelway' && window.location.href.indexOf('g_no') > -1) {
          self.productID = window.location.href.split('g_no=')[1];
        }
        break;
    }
    
    if(bannerOpen){
      // 사이트 마다 상황이 다르다.
      // 컨텐츠 로딩이 완료된 경우,
      if (document.readyState !== 'loading') {
        if (self.device == 'p') self.getBanner_pc_hz();
        else self.getBanner_mob_hz();

        self.setNpayChecker();
      } else {
        // 컨텐츠 로딩 중 인 경우
        document.addEventListener("DOMContentLoaded", function () {
          if (document.readyState !== 'loading') {
            if (self.device == 'p') self.getBanner_pc_hz();
            else self.getBanner_mob_hz();
          
            self.setNpayChecker();
          }
        })
      }
    }

  },
}

// 1: cafe24, 2: makeshop, 3: else
var sirs = new Piclick({
  site_name : '{{site_name}}',
  solution_type : {{solution_type}}, 
  auID: {{au_id}},
  siteID: {{site_id}},
  pc_selector: '.BigImage',
  mob_selector: '.bigImage',
});

// var xmlhttp = new XMLHttpRequest();
// xmlhttp.onreadystatechange = function () {
//   if (xmlhttp.readyState == XMLHttpRequest.DONE) {
//     if (xmlhttp.status == 200) {
//       if (JSON.parse(xmlhttp.response).ip == '1.214.196.202') {

//       }
//     } else if (xmlhttp.status == 400) {
//       console.log('error')
//     } else {
//       console.log('what')
//     }
//   }
// }
// xmlhttp.open("GET", "https://api.ipify.org?format=json")
// xmlhttp.send();
