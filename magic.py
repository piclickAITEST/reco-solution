import os
import redis
import json
import hashlib
import datetime
import logging
import logging.config
import flask

# Flask
from flask import Flask, request, render_template, send_from_directory, jsonify, Response, redirect
from flask_uploads import UploadSet, configure_uploads, IMAGES
from flask_cors import CORS, cross_origin

# Utils
from utils.db_utils import *
from utils.db_utils_cafe24 import *
from utils.magic_utils import *

from datetime import datetime
import datetime as dt


app = Flask(__name__)
CORS(app, resources={r'*': {'origins': '*'}})
app.debug = False

with open('screen.txt','r') as f:
  pp = f.readline().split(',')

r = redis.StrictRedis(host="localhost",port=6379, db=0)
photos = UploadSet('photos', IMAGES)
app.config['UPLOADED_PHOTOS_DEST'] = 'static/img/uploads/'
configure_uploads(app, photos)

with open("mapping.json", "r") as f:
  mapping = json.load(f)


def clickLog(referer, userID, clickURL, device, siteId):
  loggingStr = f'[YMD] {datetime.today().strftime("%Y/%m/%d %H:%M:%S")} [REFERER] {referer} [userID] {userID} [clickURL] {clickURL} [device] {device} [siteId] {siteId}\n'
  with open(f'click/click.log', "a") as f:
    f.write(loggingStr)
  #app.logger.info(loggingStr)

def impLog(referer, userID, device, siteId):
  loggingStr = f'[YMD] {datetime.today().strftime("%Y/%m/%d %H:%M:%S")} [REFERER] {referer} [userID] {userID} [device] {device} [siteId] {siteId}\n'
  with open("imp/imp.log", "a") as f:
    f.write(loggingStr)

# REDIS DB 내용삭제
# 사용주의
@app.route('/redis/flush')
def flush():
  r.flushdb()
  return 'Flush Redis DB'

# REDIS P_key 검색
@app.route('/redis/get/<p_key>')
def redisGet(p_key):
  redisPkey = r.get(p_key)
  if redisPkey:
    json_test_dict = redisPkey.decode('utf-8')
    matching = dict(json.loads(json_test_dict))
    
  return matching


from urllib import parse

@app.route('/click')
def clickChck():
  clickURL = request.args['cl']
  try:
    referer = request.args['referer']
  except:
    referer = None

  try:
    #userID = request.cookies['uid']
    userID = request.args['userID']
  except:
    userID = None   

  try:
    device = request.args['device']
  except:
    device = None 

  try:
    siteId = request.args['siteID']
  except:
    siteId = None

  ymd = datetime.today().strftime("%Y%m%d")
  rkey = f'similarSearch:click:{siteId}:{device}:{ymd}'
  r.incr(rkey)

  clickLog(referer, userID, clickURL, device, siteId)

  return redirect(clickURL+"&psr=reco_ai", code=302)




@app.route('/imp')
def impCheck():
  try:
    referer = request.args['referer']
  except:
    referer = None

  try:
    #userID = request.cookies['uid']
    userID = request.args['userID']
  except:
    userID = None   

  try:
    device = request.args['device']
  except:
    device = None 

  try:
    siteId = request.args['siteID']
  except:
    siteId = None   

  ymd = datetime.today().strftime("%Y%m%d")
  rkey = f'similarSearch:imp:{siteId}:{device}:{ymd}'
  r.incr(rkey)

  impLog(referer, userID, device, siteId)

  return ""


@app.route('/stopAd')
@cross_origin(origin='*')
def stopAdCheck():
  device = request.args['device']
  ymd = datetime.today().strftime("%Y%m%d")
  rkey = f'{ymd}:{device}'
  print(rkey)
  r.incr(rkey)
  return ""

@app.route('/userSearch/<site_id>')
@cross_origin(origin='*')
def userSearch(site_id):
  
  user_type = request.args['user_type']
  mysql = Mysql()

  # 쿠키
  if user_type == 'cookie':
    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> cookie")
    cookieID = request.args['uid']
    userID = request.args['user_id']
    #cookieID = request.cookies['uid']
    #cookieID = "4632784112.1591851925"
    productList = mysql.getTBLByCookie(cookieID=cookieID, userID=userID)
    if productList is None:
      Json = {
        'status':'F',
        'result': ['No data in CART & WISH']
      }
      return jsonify(Json)

    productInfo = mysql.getProductInfoForUserSearch(productList)
    Json = {
        'status':'S',
        'result': productInfo
    }

  # 유저 아이디
  # elif user_type == 'user_id':
  #   userID = request.args['uid']

  # 주문번호
  else:
    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> order number")
    orderID = request.args['uid']
    productList = mysql.getTBLByOrderID(orderID=orderID)

    if productList is None:
      Json = {
        'status':'F',
        'result': ['No data in CART & WISH']
      }
      return jsonify(Json)

    productInfo = mysql.getProductInfoForUserSearchElse(productList)
    print(productInfo)
    Json = {
        'status':'S',
        'result': productInfo
    }
  # print(Json)
  return jsonify(Json)

@app.route('/cmSearch/<site_id>')
@cross_origin(origin='*')
def cmSearch(site_id):

  # img
  with open("img/200731_03_05.jpg", "rb") as imgFile:
    img = base64.b64encode(imgFile.read())
  imgStr = img.decode()

  # info
  info = {
    "product_id": 15920,
    "site_id": 98,
    "au_id": 2545,
    "category1": "Skirt",
    "category2": "롱스커트",
    "img_url": "http://benito.co.kr/web/product/medium/202007/0b541dc4b8cfe9dde84f669c3b468a55.jpg"
  }

  res = requests.post("http://screen.piclick.kr/cm/saveVec", data=imgStr, json=info)


@app.route('/similarSearch')
@cross_origin(origin='*')
def similarSearch():
  return render_template('similarSearch.html', product_set_id='PICLICK_KR', au_id = 2545)

# /similarSearch
@app.route('/similarSearch/<int:au_id>/<p_key>', methods=['POST', 'GET'])
@cross_origin(origin='*')
def sSearch(au_id, p_key):
  site_id = p_key.split("_")[0]
  try:
    debug = requests.form['debug']
  except:
    debug = True
  
  if p_key in pp:
    Json = {
      'status':'F',
      'result': ['사전 차단된 이미지입니다.']
    }
    # REDIS 저장
    redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
    r.set(p_key, redisJson)
    return jsonify(Json)
  # GET REDIS
  redisPkey = r.get(p_key)
  if redisPkey:
    json_test_dict = redisPkey.decode('utf-8')
    matching = dict(json.loads(json_test_dict)) #{'status':S, 'result':['1','2']}
    if len(matching['result']) > 8:
      matching['result'] = matching['result'][:8]
    if au_id == 2302:
      matching['result'] = matching['result'][:4]
    
    if matching['status'] == "S":
      for res in matching['result']:
        productID = res['click_url'].split("product_no=")[-1]
        ymd = datetime.today().strftime("%Y%m%d")
        rkey = f'similarSearch:imp:{site_id}:{productID}:{ymd}'
        r.incr(rkey)

    # REDIS 정보 반출
    # print('RESULT IN REDIS')  
    return jsonify(matching)
  # NO RESULT IN REDIS
  else:
    mysql = Mysql()
    mysql_ad = Mysql_ad()

    # print('NO RESULT IN REDIS')
    if request.args['contentUrl'] == 'searchThis':
      product_id = p_key.split('_')[1]
      contentUrl = mysql_ad.getImageUrl(site_id, product_id)[0]
      print(contentUrl, len(contentUrl))

      if len(contentUrl) == 0:
        Json = {
          'status': 'F',
          'result': ['DB 상품 없음']
        }
        # REDIS 저장
        redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
        r.set(p_key, redisJson, dt.timedelta(days=1))
        return jsonify(Json)

      img, _, _ = downloadImage(contentUrl)

      if type(img) == str:
        data = 'undefined'
      else:
        buffered = BytesIO()
        img.convert('RGB').save(buffered, format="JPEG")
        b64Image = base64.b64encode(buffered.getvalue()) 

      product_set_id = 'AIPIC_KR'
      banner = True

    else:
      b64Image, contentUrl, product_set_id, banner = upload_image2(request, app=app, photos=photos)


    if au_id == 2302:
      b64Image2, contentUrl2, _, _ = upload_image3(request, app=app, photos=photos)
    

    if b64Image == 'undefined':
      Json = {
        'status':'F',
        'result': ['유효하지 않은 이미지 링크입니다.']
      }
      # REDIS 저장
      redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
      r.set(p_key, redisJson)
      return jsonify(Json)
  
    # 07-28 cate24 DB로 변경
    #product = mysql.getSimilar(au_id, p_key)[au_id]
    if au_id == 2317:
      product = mysql_ad.getSimilar(au_id, p_key)[au_id]
    else:
      product = mysql_ad.getSimilarCAFE24(au_id, p_key)[au_id]

    # 07-23 진우 작업
    # 검색하려는 상품이 DB에 존재하지 않더라도, GCP 검색은 진행하도록 수정
    # 07-27 소영 작업 > 롤백
    if len(product) == 0:
      Json = {
          'status': 'F',
          'result': ['DB 상품 없음']
        }
      # REDIS 저장
      redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
      r.set(p_key, redisJson, dt.timedelta(days=1))
      return jsonify(Json)
                                        
    else:
      # print("[DB]", product)
      try:
        search = mapping[str(au_id)][product['cate1']][product['cate2']]
      except:
        print("mapping not exist", product)
        Json = {
          'status': 'F',
          'result': ['category mapping 없음']
        }
        # REDIS 저장
        redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
        r.set(p_key, redisJson)
        return jsonify(Json)

      # print("[LABEL]",search)
      cate1, cate2, topK = search

      if cate1 == "Shoes" or cate1 == "Accessory":
        Json = {
          'status': 'F',
          'result': ['Shoes, Accessory 제외']
        }
        # REDIS 저장
        redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
        r.set(p_key, redisJson)
        return jsonify(Json)
      
      if au_id == 2317:
        cate1 = hashlib.md5(cate1.encode()).hexdigest()
        cate2 = hashlib.md5(cate2.encode()).hexdigest()

      # 메인 이미지 검색
      resVisionAPI, pkeys, msg, scores = similarAPI(
                                            b64Image, topK = 20, 
                                            psProductSetId="AIPIC_KR", 
                                            au_id=au_id, cate1=cate1, cate2=cate2, 
                                            contentUrl=contentUrl
                                            )

      # 서브 이미지 검색
      if au_id == 2302:
        if not b64Image2 == 'undefined':
          _, sub_pkeys, sub_msg, sub_scores = similarAPI(
                                                b64Image2, topK = 20, 
                                                psProductSetId="AIPIC_KR", 
                                                au_id=au_id, cate1=cate1, cate2=cate2, 
                                                contentUrl=contentUrl2
                                                ) 
          sub_scores.update(scores)
          scores = sub_scores
          msg += sub_msg
          #print(scores)

      if msg != '':
        Json = {
          'status': 'F',
          'result': ['GCP 결과 없음']
        }
        # REDIS 저장
        redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
        r.set(p_key, redisJson)
        return jsonify(Json)


      orderPkey = []
      for k in sorted(scores, key=scores.get, reverse=True):
        if au_id == 2302:
          if cate1 == "94" and scores[k] < 0.32:
            continue
          elif cate1 == "25" and scores[k] < 0.36:
            continue
          elif cate1 == "7" and scores[k] < 0.3:
            continue
          elif cate1 == "519" and scores[k] < 0.25:
            continue

          if k[-2:] == '_1':
            k = k[:-2]
        if k == product['p_key']:
          continue
        if k in orderPkey:
          continue
        if k in ['88_15119']:
          continue

        orderPkey.append(k)

      if len(orderPkey) == 0:
        Json = {
          'status': 'F',
          'result': ['orderPkey 없음']
        }
        # REDIS 저장
        redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
        r.set(p_key, redisJson)
        return jsonify(Json)

      print("orderPkey", orderPkey)
      # 매칭 상품 검색
      if au_id == 2317:
        products = mysql.getSimilarInfo2(orderPkey)
      else:
        products = mysql_ad.getSimilarInfo(orderPkey)

      

      print("products", products.keys())

      delKey = []

      for key in orderPkey:
        if not key in products.keys():
          orderPkey.remove(key)
          delKey.append(key)

      for i, key in enumerate(products.keys()):
        if "기모" in products[key]['product_name']:
          orderPkey.remove(key)
          delKey.append(key)
        elif "F/W" in products[key]['product_name']:
          orderPkey.remove(key)
          delKey.append(key)

      if product['cate2'] in ['데님','Better Jeans']:
        for i, key in enumerate(products.keys()):
          if not "숏" in products[key]['product_name']:
            orderPkey.remove(key)
            delKey.append(key)

      
      
      # 인덱스삭제 데모용
      if len(delKey)>0:
        delKey.reverse()
        for dk in delKey:
          try:
            del products[dk]
          except:
            print(dk)

    # 상태값 체크
    au_ids = [products[pkey]['au_id'] for pkey in orderPkey]
    if len(orderPkey) == 0:
      Json = {
          'status': 'F',
          'result': ['orderPkey 없음']
        }
      # REDIS 저장
      redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
      r.set(p_key, redisJson)
      return jsonify(Json)

    filterdPkey = mysql_ad.checkCondition(orderPkey, au_ids, site_id)

    delKey = []
    for k,v in filterdPkey.items():
      if not (v['sold_out'] == 'F' and v['display'] == 'T' and v['selling'] == 'T'):
        orderPkey.remove(k)
        delKey.append(k) 

    # 인덱스삭제 데모용
    if len(delKey)>0:
      delKey.reverse()
      for dk in delKey:
        del products[dk]

    # 실서비스
    if banner:
      result = [products[pk] for pk in orderPkey]
      if len(result) == 0:
        Json = {
          'status': 'F',
          'result': ['결과없음']
        }

        # REDIS 저장
        redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
        r.set(p_key, redisJson)
        return jsonify(Json)
      else:
        Json = {
          'status': 'S',
          'result': result[:10]
        }
        # REDIS 저장
        redisJson = json.dumps(Json, ensure_ascii=False).encode('utf-8')
        r.set(p_key, redisJson)
        return jsonify(Json)
        

  # 확인용
  responseForm = {}
  responseForm['full_result'] = resVisionAPI['responses'][0]['productSearchResults']['results']
  responseForm['gcp_result'] = resVisionAPI['responses'][0]['productSearchResults']

  responseForm['memo'] = msg
  responseForm['contentUrl'] = contentUrl
  responseForm['products'] = products
  responseForm['status'] = 'S'
 
  return responseForm


@app.route('/')
def index():
  return 'flask health'

@app.route('/sol2pc')
def sol2pc():
  return render_template('sol2pc.html')


if __name__ == '__main__':
  
  app.run(host="0.0.0.0", port=8888, debug=True)

#   $cookie_id = $_COOKIE['uid'] ?? NULL ;
#             if($cookie_id == NULL || $sUserKey != $cookie_id) {
#                 if($cookie_id) $sUserKey = $cookie_id;
#                 $expireTime = 60 * 60 * 24 * 365 * 10;  //10년
#                 setcookie("uid", $sUserKey, time()+$expireTime, "/; SameSite=None; Secure", ".piclick.kr");
#                 $cookie_id = $sUserKey;
#             }
