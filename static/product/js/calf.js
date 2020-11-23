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
    this.au_id = '2598';
    this.siteID = '144';
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
    if (site_name !== undefined && mainImg !== undefined) {
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

  reverseDisplay: function() {
    // 이미지 롤링
    var display = 0;
    var bg = document.getElementById('piclick-bg');
    var images = document.getElementsByClassName('s-image');
    var prices = document.getElementsByClassName('product-price');

    if (images.length > maxImage) {
      for (var i = 0; i < images.length; i++) {
        if (images[i].style.display == 'grid' || images[i].style.display == '') {
          images[i].style.display = 'none';
          prices[i].style.display = 'none';
        }
        else {
          display++;
          images[i].style.display = '';
          prices[i].style.display = '';
        }
      }

      if (display == 1){
        bg.style.height = "159px";
      }else if (display == 2){
        bg.style.height = "318px";
      }else if (display == 3){
        bg.style.height = "477px";
      }else {
        bg.style.height = "636px";
      }
    }
  },

  bannerHeight: function(e, len){
    switch (len){
      case 1:
        e.style.height = "157px";
        break;
      case 2:
        e.style.height = "316px";
        break;
      case 3:
        e.style.height = "471px";
        break;
      case 4:
        e.style.height = "625px";
        break;
      default:
        e.style.height = "625px";
        break;
    };
  },

  sirsPC2: function(productID, mainImgUrl, referer){
    var self = this;

    var piclick_div = document.createElement('div');
    piclick_div.className = 'piclick-iframe';
    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/calf_pc/' + productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + mainImgUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';

    piclick_div.appendChild(iframe);
    $('#uif_ContentsOut > div > div > div:nth-child(3)').after(piclick_div);

    window.addEventListener('message', function (e) {
      if (e.data == 'piclick-banner-open') {
        $('#piclick-sirs-iframe').css('display', '');
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
        $('#piclick-sirs-iframe').css('display', 'none');
        $('#piclick-sirs-iframe').css('border','none');

      } else if (String(e.data).indexOf('height:') > -1) {
        $('#piclick-sirs-iframe').css('height', parseInt(String(e.data).split(':')[1]));
      }
    })
  },

  sirsMobile2: function (productID, mainImgUrl, referer) {
    var self = this;

    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/calf/' + productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + mainImgUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';

    $('.xans-element-.xans-product.xans-product-detail').append(iframe);

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
        $('#piclick-sirs-iframe').css('border','none');

      } else if (String(e.data).indexOf('height:') > -1) {
        $('#piclick-sirs-iframe').css('height', parseInt(String(e.data).split(':')[1]));
      }
    })
  },


  createBanner: function (site_name, mainImg, subImg, solution_type) {
    var self = this;
    var referer = top.location.href;
    var productID;

    switch(solution_type){
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
        if (site_name == 'feelway' && window.location.href.indexOf('g_no') > -1){
          productID = window.location.href.split('g_no=')[1];
        }
        break;
    }

    if (self.device == 'pc') {
      urls = self.checkParams(site_name, mainImg, subImg)
      mainImgUrl = urls[0];
      if (self.todayCheckCookie.indexOf("done") < 0) {
        self.sirsPC2(productID, mainImgUrl, referer);
      }
    }
    else {
      urls = self.checkParams(site_name, mainImg, subImg)
      mainImgUrl = urls[0];

      if (document.readyState !== 'loading') {
        self.sirsMobile2(productID, mainImgUrl, referer);
      } else {
        document.addEventListener("DOMContentLoaded", function () {
          if (document.readyState !== 'loading') {
            self.sirsMobile2(productID, mainImgUrl, referer);
          }
        })
      }

    }
  },
}

// 스크립트 자동 실행
var site_name = 'calf';
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
  styleSheet.setAttribute('href', piclick.static_url + 'product/css/' + site_name + '.css?' + unique++);
  document.getElementsByTagName('head')[0].appendChild(styleSheet);
  if (piclick.device == 'pc') {
    const mainImgTag = '#uif_ContentsOut > div > div > div:nth-child(3) > div.UIF_ProductDetailWrap > div.uif_detailImgWrap > div.uif-SliderWrap > div > div > ul > li > img';

    if (document.querySelector(mainImgTag) !== null) {
      piclick.createBanner(site_name, document.querySelector(mainImgTag), null, solution_type);
    }
    else {
      piclick.device = 'mobile';
      piclick.createBanner(site_name, document.querySelector('.bigImage'), null, solution_type);
    }
  }
  // Mobile
  else {
    piclick.device = 'mobile';
    piclick.createBanner(site_name, document.querySelector('.bigImage'), null, solution_type);
  }
}

// $.ajax({
//   url : 'https://api.ipify.org?format=json',
//   type : 'get',
//   success: function(json) {
//     var ip = json.ip;
//     if (ip == '1.214.196.202' || ip == '221.148.226.238'){
//       // 제품 상세페이지
//       if (pageID == 'PRODUCT_DETAIL') {
//         // CSS 추가
//         var styleSheet = document.createElement('link');
//         styleSheet.setAttribute('rel', 'stylesheet');
//         styleSheet.setAttribute('type', 'text/css');
//         styleSheet.setAttribute('href', piclick.static_url + 'product/css/' + site_name + '.css?' + unique++);
//         document.getElementsByTagName('head')[0].appendChild(styleSheet);
//         if (piclick.device == 'pc') {
//           const mainImgTag = '#uif_ContentsOut > div > div > div:nth-child(3) > div.UIF_ProductDetailWrap > div.uif_detailImgWrap > div.uif-SliderWrap > div > div > ul > li > img';

//           if (document.querySelector(mainImgTag) !== null) {
//             piclick.createBanner(site_name, document.querySelector(mainImgTag), null, solution_type);
//           }
//           else {
//             piclick.device = 'mobile';
//             piclick.createBanner(site_name, document.querySelector('.bigImage'), null, solution_type);
//           }
//         }
//         // Mobile
//         else {
//           piclick.device = 'mobile';
//           piclick.createBanner(site_name, document.querySelector('.bigImage'), null, solution_type);
//         }
//       }
//     }
//   }
// })


