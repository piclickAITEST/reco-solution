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
    this.api_url = 'https://reco.piclick.kr/similarSearch/2545/' // 베니토 2545
    this.device;

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

    self.todayCheckCookie = self.getCookie('todayCookie');
    if (self.todayCheckCookie == null) self.todayCheckCookie = 'None';

    // 만료날짜 갱신
    self.setCookie('_pa', self.uid, 365);

    // 소재
    this.arrowUpSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAfUlEQVRIie2Puw2AIBQAWcGCxp0sXcGdXIHWnSwoXOFsMGqEJxASE/Oufp87YxTlPwAWcMAC9K2Pj4DnZAOmFocP6xT1NRHrFGU1grUPTwdgraoRrB1gL3MdMBfXpKyF+WhN7oObtbDzqHl7IFrn1EhDWdbCvgVc7b6ifMQO9xNmwzP+HrAAAAAASUVORK5CYII=";
    this.arrowDownSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAgElEQVRIie2RsRGAIBAEacHAxJ4MacGebMHUngwIbGFNYAZm8HnQ8Dfm/vYG5wzDKABOYPmQn4FDegBwA9vAcQ8EgFZBQrUmWedBbUFzTW6tLViBq1JUrKlZRwLguyfn4TfrmJnF48o1/dZCyQTswvE+644149ZCSfqbf6wNQ80DCxtmw6y520AAAAAASUVORK5CYII=";
    this.drawerUpSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAAu0lEQVRoge2WsRLCIBAF+S21yEQ/2dIiDf+1NlaICgS4M/O2Zm52C+BCEEIIIYQQ4nAAF+ABROBm7VPMS/zOO75Dvoj7DqkQ9xUCnBvFcyHXfxSfGzJQfGzIRPG+IcDJSDwlAquFeATW3vOmic+eH4YNHhTSM6DpsrHzcegR0OW5aw3ZEzDkw6kNaQmY8uWXhtQEmCxd/FgSSwJcrL2fQnIHXYmnpCG5AxuwGLhVASzAZu0hhBBCCCFECE9PnazInZCrSQAAAABJRU5ErkJggg==";
    this.xButtonSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAiklEQVRIie2UQQqAMAwER/9g0SfqcxUU9DH10oKC1qSt4qF7bTIDIQ2U/DU9YBT1xvWIMgAWmIQS42qt631MA4yuYQE6RW0rEUgl0XCJJBkekmSDX0lWYM4JP0o82AKbFF4nSKuE3lNCIwqtsBruZ675J2r43ZtaIlnFaIlmz6Mkrx87ePlcl3ybHZOAR4UrnAAtAAAAAElFTkSuQmCC";
  },

  checkParams: function (api_key, mainImg, subImg) {
    // TODO : 이미지가 두개 들어왔을때,
    var checkList = [mainImg, subImg];
    var attr = (typeof attr !== 'undefined') ? attr : 'src'; // default : src
    var urls = [];

    // 일단 전부 정상일때
    if (api_key !== undefined && mainImg !== undefined && subImg !== undefined) {
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

  createImage: function (imgUrl, productPrice, clickUrl) {
    var self = this;
    var imageContainer = document.createElement('div');
    imageContainer.className = `s-image ${self.device}`;
    imageContainer.style.background = `url('${imgUrl}') center center / cover no-repeat`;
    imageContainer.onclick = () => self.locationHref(clickUrl);

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
    if ( todayDate > new Date() )  
    {  
      exp = exp - 1;  
    }  
    todayDate.setDate( todayDate.getDate() + exp );   
    document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";" 
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

  createBanner: function (api_key, mainImg, subImg) {
    var self = this;
    var unique = + new Date();
    var referer = top.location.href;
    // 베니토 고정
    // TODO : 이후 api_key로 siteID를 고정
    var siteID = 98; // -> TODO: 스크립트 외부 변수로 변경
    // 외부 스크립트에서 받아오는 변수이기 때문에, 작동하지 않을 수 있음.
    // window.location.href.split('/')[5]
    if (typeof iProductNo == "undefined") productID = 'productID'
    else productID = iProductNo;
    var product_set_id = 'AIPIC_KR';

    // PC
    if (self.device == 'pc') {
      urls = self.checkParams(api_key, mainImg, subImg)
      if (urls) {
        //일단 1개만
        mainImgUrl = urls[0];
        //메인
        $.ajax({
          type: "GET",
          url: self.api_url + `${siteID}_${productID}?contentUrl=${mainImgUrl}&product_set_id=${product_set_id}&banner=true&referer=${referer}&userID=${self.uid}`,
          processData: false,
          contentType: false,
          cache: false,
          crossDomain: true,
          timeout: 10000,
          success: (json) => {
            var imgList = [];
            var priceList = [];
            var clickList = [];

            if (json.status == 'S') {
              $.each(json.result, (idx, dict) => {
                imgList.push(dict.img_url);
                priceList.push(numberWithCommas(dict.product_price) + " 원");
                clickList.push(dict.click_url);
              })

            // 백그라운드 div
            var backgroundBanner = document.createElement('div');
            backgroundBanner.id = 'background';

            // 배너 생성
            var bannerTitle = 'AI 유사 상품 추천';
            var sideBanner = document.createElement('div');
            sideBanner.id = 'piclick-sol1';
            sideBanner.className = 'pc';
            sideBanner.insertAdjacentHTML('afterbegin', `<div class="p-header">${bannerTitle}</div>`);

            // 업&다운
            var arrowUp = document.createElement('div');
            arrowUp.className = 'arrow';
            arrowUp.id = 'p-up';
            arrowUp.insertAdjacentHTML('afterbegin', `<img src="${self.arrowUpSrc}" />`);

            var arrowDown = document.createElement('div');
            arrowDown.className = 'arrow';
            arrowDown.id = 'p-down';
            arrowDown.insertAdjacentHTML('afterbegin', `<img src="${self.arrowDownSrc}" />`);

            // 이미지
            var s_images = document.createElement('div');
            s_images.className = 's-images';
            s_images.append(arrowUp);
            for (var i = 0; i < imgList.length; i++) {
              contaniers = self.createImage(imgList[i], priceList[i], clickList[i]);
              s_images.appendChild(contaniers.imageContainer);
              s_images.appendChild(contaniers.productPriceContainer);
            }
            s_images.append(arrowDown);

            // 하단 드로어
            var drawer = document.createElement('div');
            drawer.className = 'drawer opened';
            drawer.id = 'drawer';
            drawer.insertAdjacentHTML('afterbegin', `<img height="30px" src="${self.drawerUpSrc}" />`);

            // 취합
            sideBanner.append(s_images);
            sideBanner.append(drawer);
            // Powered By Piclick
            sideBanner.insertAdjacentHTML('beforeend', '<a href="https://piclick.me"><span>Powered by <span class="piclick">Piclick</span></span></a>')
            backgroundBanner.append(sideBanner);
            // 배너 생성 끝
            // 배너 추가
            document.body.append(backgroundBanner);
            // 배너 스크립트 추가
            var bannerScript = document.createElement('script');
            bannerScript.type = 'text/javascript';
            bannerScript.src = `https://reco.piclick.kr/static/js/v1/solution1/banner.js?${unique++}`
            document.getElementsByTagName('head')[0].appendChild(bannerScript);
            // CSS 추가
            var styleSheet = document.createElement('link');
            styleSheet.setAttribute('rel', 'stylesheet');
            styleSheet.setAttribute('type', 'text/css');
            styleSheet.setAttribute('href', `https://reco.piclick.kr/static/css/v1/piclick-sol.css?${unique++}`);
            document.getElementsByTagName('head')[0].appendChild(styleSheet);

            // 위치조정
            setTimeout(() => {
              var o = self.offset(img);
              if (self.isVisible(img)) {
                sideBanner.style.left = (o.left - 220) + 'px';
                backgroundBanner.style.left = (o.left - 220) + 'px';

                if (o.top - 100 < 0) {
                  sideBanner.style.top = '147.281px';
                  backgroundBanner.style.top = '147.281px';
                } else {
                  sideBanner.style.top = (o.top - 100) + 'px';
                  backgroundBanner.style.top = (o.top - 100) + 'px';
                }
                
                sideBanner.style.display = '';
              }
            }, 2000);

            // 자동 변경
            // setInterval(() => {
            //   document.getElementById('p-down').click();
            // }, 10000);
            }else{
              console.log("Piclick :", json.result);
            }
          },
          // error: (e) => {
          //   var tmpImgList = ['https://www.benito.co.kr/web/product/big/20200529/ad10b55cc196b57abe5bd96c16733edf.jpg',
          //     'https://www.benito.co.kr/web/product/big/20200427/58226107831638605a1abf682d5e7cad.jpg',
          //     'https://www.benito.co.kr/web/product/big/20200702/e034bb172b08d0571a8e8ea5b7c56f21.jpg',
          //     'https://www.benito.co.kr/web/product/big/201807/11162_shop1_15306876032945.jpg'];
          //   var tmpPriceList = ['62,900 원', '59,000 원', '56,000 원', '57,600 원'];

          //   // 백그라운드 div
          //   var backgroundBanner = document.createElement('div');
          //   backgroundBanner.id = 'background';

          //   var bannerTitle = 'AI 유사 상품 추천';
          //   var sideBanner = document.createElement('div');
          //   sideBanner.id = 'piclick-sol1';
          //   sideBanner.className = 'pc';
          //   sideBanner.insertAdjacentHTML('afterbegin', `<div class="p-header">${bannerTitle}<img src="${self.c_logoSrc}" /></div>`);

          //   var arrowUp = document.createElement('div');
          //   arrowUp.className = 'arrow';
          //   arrowUp.id = 'p-up';
          //   arrowUp.insertAdjacentHTML('afterbegin', `<img src="${self.arrowUpSrc}" />`);

          //   var arrowDown = document.createElement('div');
          //   arrowDown.className = 'arrow';
          //   arrowDown.id = 'p-down';
          //   arrowDown.insertAdjacentHTML('afterbegin', `<img src="${self.arrowDownSrc}" />`);

          //   var s_images = document.createElement('div');
          //   s_images.className = 's-images';
          //   s_images.append(arrowUp);
          //   for (var i = 0; i < tmpImgList.length; i++) {
          //     contaniers = self.createImage(tmpImgList[i], tmpPriceList[i]);
          //     s_images.appendChild(contaniers.imageContainer);
          //     s_images.appendChild(contaniers.productPriceContainer);
          //   }
          //   s_images.append(arrowDown);

          //   var drawer = document.createElement('div');
          //   drawer.className = 'drawer opened';
          //   drawer.id = 'drawer';
          //   drawer.insertAdjacentHTML('afterbegin', `<img height="30px" src="${self.drawerUpSrc}" />`);

          //   // 취합
          //   sideBanner.append(s_images);
          //   sideBanner.append(drawer);
          //   sideBanner.append(backgroundBanner);

          //   // 배너 추가
          //   document.body.append(sideBanner);
          //   // 배너 스크립트 추가
          //   var bannerScript = document.createElement('script');
          //   bannerScript.type = 'text/javascript';
          //   bannerScript.src = `https://reco.piclick.kr/static/js/v1/solution1/banner.js?${unique++}`
          //   document.getElementsByTagName('head')[0].appendChild(bannerScript);
          //   // CSS 추가
          //   var styleSheet = document.createElement('link');
          //   styleSheet.setAttribute('rel', 'stylesheet');
          //   styleSheet.setAttribute('type', 'text/css');
          //   styleSheet.setAttribute('href', `https://reco.piclick.kr/static/css/v1/piclick-sol.css?${unique++}`);
          //   document.getElementsByTagName('head')[0].appendChild(styleSheet);

          //   // 위치조정
          //   setTimeout(() => {
          //     var o = self.offset(img);
          //     if (self.isVisible(img)) {
          //       sideBanner.style.left = (o.left - 220) + 'px';
          //       sideBanner.style.top = o.top + 'px';
          //       sideBanner.style.display = '';
          //     }
          //   }, 2000);
          // }
        });
      }
    }
    // 모바일
    else {
      urls = self.checkParams(api_key,document.querySelector('.bigImage'),document.querySelector('.bigImage'));
      mainImgUrl = urls[0];

      if (self.todayCheckCookie.indexOf("done") < 0){
        $.ajax({
          type: "GET",
          url: self.api_url + `${siteID}_${productID}?contentUrl=${mainImgUrl}&product_set_id=${product_set_id}&banner=true&referer=${referer}&userID=${self.uid}`,
          processData: false,
          contentType: false,
          cache: false,
          crossDomain: true,
          timeout: 10000,
          success: (json) => {
            var imgList = [];
            var priceList = [];
            var clickList = [];
  
            if (json.status == 'S') {
              $.each(json.result, (idx, dict) => {
                imgList.push(dict.img_url);
                priceList.push(numberWithCommas(dict.product_price) + " 원");
                clickList.push(dict.click_url);
              })
  
              var sideBanner = document.createElement('div');
              sideBanner.id = 'piclick-sol1';
              sideBanner.className = 'mobile';
    
              var s_images = document.createElement('div');
              s_images.className = 's-images';
              for (var i = 0; i < imgList.length; i++) {
                contaniers = self.createImage(imgList[i], priceList[i], clickList[i]);
                s_images.appendChild(contaniers.imageContainer);
              }
              // 오늘 그만보기
              var todayCheck = document.createElement('div');
              todayCheck.id = 'todayCheck';
              todayCheck.innerText = '오늘 하루 열지 않기';
              todayCheck.onclick = () => {
                document.getElementById('piclick-sol1').style.display = 'none';
                document.getElementById('sideTag').style.display = 'none';
                self.setCookieDay("todayCookie","done", 1);
              }
              s_images.appendChild(todayCheck);
    
              // X버튼
              var xButton = document.createElement('img');
              xButton.id = 'xButton';
              xButton.src = self.xButtonSrc;
              xButton.onclick = () => {
                document.getElementById('piclick-sol1').style.display = 'none';
                document.getElementById('sideTag').style.display = 'none';
              }
    
              // 사이드 태그
              var sideTag = document.createElement('div');
              sideTag.id = 'sideTag';
              sideTag.innerText = '유사 상품 추천';
              document.body.append(sideTag);
    
              // 취합
              sideBanner.append(xButton);
              sideBanner.append(s_images);
            
              // 배너 생성 끝
              // 배너 추가
              
              document.body.append(sideBanner);
    
              // 배너 스크립트 추가
              var bannerScript = document.createElement('script');
              bannerScript.type = 'text/javascript';
              bannerScript.src = `https://reco.piclick.kr/static/js/v1/solution1/banner.js?${unique++}`
              document.getElementsByTagName('head')[0].appendChild(bannerScript);
              // CSS 추가
              var styleSheet = document.createElement('link');
              styleSheet.setAttribute('rel', 'stylesheet');
              styleSheet.setAttribute('type', 'text/css');
              styleSheet.setAttribute('href', `https://reco.piclick.kr/static/css/v1/piclick-sol.css?${unique++}`);
              document.getElementsByTagName('head')[0].appendChild(styleSheet);
  
            }else {
              console.log(json.result)
            }
  
  
          },
          // error: (e) => {
  
          //   var tmpImgList = ['https://www.benito.co.kr/web/product/big/20200529/ad10b55cc196b57abe5bd96c16733edf.jpg',
          //     'https://www.benito.co.kr/web/product/big/20200427/58226107831638605a1abf682d5e7cad.jpg',
          //     'https://www.benito.co.kr/web/product/big/20200702/e034bb172b08d0571a8e8ea5b7c56f21.jpg',
          //     'https://www.benito.co.kr/web/product/big/201807/11162_shop1_15306876032945.jpg'];
          //   var tmpPriceList = ['62,900 원', '59,000 원', '56,000 원', '57,600 원'];
  
          //   // 하기싫다
          //   var sideBanner = document.createElement('div');
          //   sideBanner.id = 'piclick-sol1';
          //   sideBanner.className = 'mobile';
  
          //   var s_images = document.createElement('div');
          //   s_images.className = 's-images';
          //   for (var i = 0; i < imgList.length; i++) {
          //     contaniers = self.createImage(tmpImgList[i], tmpPriceList[i], tmpImgList[i]);
          //     s_images.appendChild(contaniers.imageContainer);
          //     s_images.appendChild(contaniers.productPriceContainer);
          //   }
  
          //   // X버튼
          //   // 오늘 그만보기
  
          //   // 취합
          //   sideBanner.append(s_images);
  
          //   // 배너 생성 끝
          //   // 배너 추가
          //   document.body.append(backgroundBanner);
          //   // 배너 스크립트 추가
          //   var bannerScript = document.createElement('script');
          //   bannerScript.type = 'text/javascript';
          //   bannerScript.src = `https://reco.piclick.kr/static/js/v1/solution1/banner.js?${unique++}`
          //   document.getElementsByTagName('head')[0].appendChild(bannerScript);
          //   // CSS 추가
          //   var styleSheet = document.createElement('link');
          //   styleSheet.setAttribute('rel', 'stylesheet');
          //   styleSheet.setAttribute('type', 'text/css');
          //   styleSheet.setAttribute('href', `https://reco.piclick.kr/static/css/v1/piclick-sol.css?${unique++}`);
          //   document.getElementsByTagName('head')[0].appendChild(styleSheet);
  
          //   // 위치 조정
          // }
        });
      }
    }
  },
}

// 스크립트 자동 실행
var API_KEY = 'benito';
var piclick = new Piclick();
// APIKEY , 메인이미지, 서브이미지

// 베니토
if (API_KEY == 'benito'){

  var pageID = document.querySelector('meta[name="path_role"]').content;

  // 제품 상세페이지에서만 작동
  if (pageID == 'PRODUCT_DETAIL') {
    if (piclick.device == 'pc'){
      piclick.createBanner(API_KEY, document.querySelector('.BigImage'), document.querySelector('#prdDetail > div > div:nth-child(12) > img'));
    }
    // Mobile
    else{
      piclick.createBanner(API_KEY,document.querySelector('.bigImage'),document.querySelector('.bigImage'));
    }
  }


}// DEMO
else{
  piclick.createBanner(API_KEY, document.querySelector('.detailArea > .search-image > div'), document.querySelector('.infoArea > img'));
}


