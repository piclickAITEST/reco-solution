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
    this.au_id = '2473';
    this.siteID = '148';
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
      urls.push("https:shezbycoco.co.kr" + imgUrl);
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

  bannerHeight: function (e, len) {
    switch (len) {
      case 1:
        e.style.height = "23vh";
        break;
      case 2:
        e.style.height = "43vh";
        break;
      case 3:
        e.style.height = "63vh";
        break;
      case 4:
        e.style.height = "83vh";
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
      url: self.sirs_api_url + self.au_id + '/' + self.siteID + '_' + productID + '?product_set_id=' + product_set_id + '&banner=true',
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

          // 이미지
          var s_images = document.createElement('div');
          s_images.className = 's-images';
          for (var i = 0; i < imgList.length; i++) {
            contaniers = self.createImageImg(imgList[i], priceList[i], clickList[i]);
            s_images.appendChild(contaniers.imageContainer);
            s_images.appendChild(contaniers.productPriceContainer);
          }

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

          self.bannerHeight(document.getElementById('piclick-bg'),images.length)

          document.getElementById('piclick-title').onclick = function () {
            document.getElementById('piclick-drawer').click();
          }

          // 위치조정
          const between = 120;
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
                if (window.pageYOffset < 600 || window.innerHeight < 820 || window.innerWidth < 1100) {
                  banner.style.display = 'none';
                  backgroundBanner.style.display = 'none';
                  sideTag.style.display = 'none';
                }else{
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

  sirsPC2: function (productID, mainImgUrl, referer) {
    var self = this;

    var piclick_div = document.createElement('div');
    piclick_div.className = 'piclick-iframe';
    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/shezbycoco_pc/' + productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + mainImgUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';

    piclick_div.appendChild(iframe);
    document.querySelector('.xans-element-.xans-product.xans-product-image.imgArea ').prepend(piclick_div);

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
        document.getElementById('piclick-sirs-iframe').style.height = parseInt(String(e.data).split(':')[1]) + 'vh';
      }
    })
  },

  sirsMobile2: function (productID, mainImgUrl, referer) {
    var self = this;

    var piclick_div = document.createElement('div');
    piclick_div.className = 'piclick-iframe-m';
    var iframe = document.createElement('iframe');
    iframe.id = 'piclick-sirs-iframe';
    iframe.src = 'https://ai.piclick.kr/sirs/shezbycoco/' + productID + '?uid=' + self.uid + '&cookieID=' + self.uid + '&contentUrl=' + mainImgUrl;
    iframe.width = "100%";
    iframe.display = 'none';
    iframe.height = "0px";
    iframe.frameBorder = "0";
    iframe.scrolling = 'no';

    piclick_div.appendChild(iframe);
    $('#mbris_detail_section').before(piclick_div);

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
        if (document.readyState !== 'loading') {
          self.sirsPC(productID, mainImgUrl, 'AIPIC_KR', referer);
  
        } else {
          document.addEventListener("DOMContentLoaded", function () {
            if (document.readyState !== 'loading') {
              self.sirsPC(productID, mainImgUrl, 'AIPIC_KR', referer); 
            }
          })
        }
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
var site_name = 'shezbycoco';
var solution_type = 1 // 1: cafe24, 2: makeshop, 3: else
var sirs = new Piclick();
sirs.site_name = 'shezbycoco'
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

  if (window.location.href.indexOf('//m.')>-1) sirs.device = 'mobile';
  if (sirs.device == 'pc') {
    if (document.querySelector('#prddetailimg img') !== null) {
      sirs.createBanner(site_name, document.querySelector('#prddetailimg img'), null, solution_type);
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