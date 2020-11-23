import requests
import time
import json
import base64
import urllib.request
from PIL import Image
from io import BytesIO
import subprocess
import os
import PIL
import random
import numpy as np

from flask_uploads import secure_filename

def upload_image2(request, app, photos):
  if request.method == 'POST':  # 이미지 업로드
      try:
          product_set_id = request.form['product_set_id']
          banner = request.args['banner']
      except:
          product_set_id = None
          banner = False
          pass

      try:
        file = request.files['file']
      except:
        filename = 'uploads_%d.jpg' % random.randint(0,999999)
        f = request.stream.read()

      filename = secure_filename(file.filename)
      # TODO : 한글 파일명 업로드시 에러남.
      upload_path = os.path.join(app.config['UPLOADED_PHOTOS_DEST'], filename)
      file.save(upload_path)

      contentUrl = "https://magic2.piclick.me/" + upload_path

      img = Image.open(upload_path).convert('RGB')
      with open(upload_path, 'rb') as f:
        data = base64.b64encode(f.read())

  else:  # Drag & Drop
      contentUrl = request.args['contentUrl'].split('?')[0].replace('/dims/optimize','')

      try:
          product_set_id = request.args['product_set_id']
          banner = request.args['banner']
      except:
          product_set_id = None
          banner = False
          pass

      img, log, img_url = downloadImage(contentUrl)
      
      upload_path = app.config['UPLOADED_PHOTOS_DEST'] + \
          contentUrl.split('/')[-1]

      if type(img) == str:
        data = 'undefined'
      else:
        buffered = BytesIO()
        img.convert('RGB').save(buffered, format="JPEG")
        data = base64.b64encode(buffered.getvalue()) 

  return data, contentUrl, product_set_id, banner

def upload_image3(request, app, photos):
  if request.method == 'POST':  # 이미지 업로드
      try:
          product_set_id = request.form['product_set_id']
          banner = request.args['banner']
      except:
          product_set_id = None
          banner = False
          pass

      try:
        file = request.files['file']
      except:
        filename = 'uploads_%d.jpg' % random.randint(0,999999)
        f = request.stream.read()

      filename = secure_filename(file.filename)
      # TODO : 한글 파일명 업로드시 에러남.
      upload_path = os.path.join(app.config['UPLOADED_PHOTOS_DEST'], filename)
      file.save(upload_path)

      contentUrl = "https://magic2.piclick.me/" + upload_path

      img = Image.open(upload_path).convert('RGB')
      with open(upload_path, 'rb') as f:
        data = base64.b64encode(f.read())

  else:  # Drag & Drop
      contentUrl = request.args['contentUrl2'].split('?')[0].replace('/dims/optimize','')

      try:
          product_set_id = request.args['product_set_id']
          banner = request.args['banner']
      except:
          product_set_id = None
          banner = False
          pass
      img, log, img_url = downloadImage(contentUrl)

      
      upload_path = app.config['UPLOADED_PHOTOS_DEST'] + \
          contentUrl.split('/')[-1]

      if type(img) == str:
        data = 'undefined'
      else:
        buffered = BytesIO()
        img.convert('RGB').save(buffered, format="JPEG")
        data = base64.b64encode(buffered.getvalue()) 

  return data, contentUrl, product_set_id, banner

def curlImage(url, method):
  cmd = ['curl',
          '-A',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
          '-m 1.5',
          '-Ls',
          '-X', 'GET',
          url]

  fd_popen = subprocess.Popen(cmd, stdout=subprocess.PIPE).stdout
  data = fd_popen.read()
  fd_popen.close()

  try:
      img = Image.open(BytesIO(data))
      if type(img) == PIL.PngImagePlugin.PngImageFile:
          img = Image.fromarray(np.asarray(
              img, dtype=np.uint8)).convert('RGB')
      tmp = np.asarray(img, np.uint8)
      del tmp
      log = 'Download_' + method
      return img, log
  except TypeError:
      log = 'Timeout'
      return '', log
  except Exception as e:
      log = 'Pass'
      return '', log


def downloadImage(img_url_raw):
  # //
  if 'http' not in img_url_raw[:5]:
      img_url = 'http:' + img_url_raw
      img, log = curlImage(img_url, 'http')

      if log == 'Pass':
          # https://
          img_url = 'https:' + img_url_raw
          img, log = curlImage(img_url, 'https')

          if log == 'Pass':
              log = 'Forbidden'

  # http:// or https://
  else:
      img_url = img_url_raw

      # http://
      if img_url.split(':')[0] == 'http':
          img, log = curlImage(img_url, 'http')

          if log == 'Pass':
              img_url = img_url.replace('http:', 'https:')
              img, log = curlImage(img_url, 'https')

              if log == 'Pass':
                  log = 'Forbidden'
      # https://
      else:
          img, log = curlImage(img_url, 'https')

          if log == 'Pass':
              img_url = img_url.replace('https:', 'http:')
              img, log = curlImage(img_url, 'http')

              if log == 'Pass':
                  log = 'Forbidden'

  return img, log, img_url

def similarAPI(b64Image, psProductSetId, topK = 100, au_id=None, cate1=None, cate2=None, contentUrl=None):
  google_vision_url = 'https://vision.googleapis.com/'
  module_name = 'v1/images:annotate?key='
  psProductSet = 'piclick-ai-kr'
  psProductSetId = 'AIPIC_KR' #PICLICK_KR, AI_RECO_KR, LIVEKR

  content_type = 'application/json'
  headers = {'content-type': content_type}

  # GCP PARAMS
  psApiKey = "AIzaSyDVw5J7zt5n2UxU8xGGpYsBknhZ_XDquu4"
  psProject = "piclick"
  psLocation = "asia-east1"
  psProductCategory = "apparel-v2"

  # 새로 추가
  afterFilter = ['Boot','High-heeled footwear','Sandal','Shoe','Flip-flops','High heels','Slipper','Footwear','Sneakers','Satchel','Handbag','Briefcase','Tašky a zavazadla','Luggage & bags','Bag'] # 신발, 가방
  if au_id == 2302: # 로렌하이
    # 아우터/상의는 GCP결과에서 하의 박스를 제거한다.
    if cate1 in ['12', '519', '94','25']: afterFilter += ['Jeans','Pants','Shorts','Trousers','Sweatpants','Skirt','MiniSkirt']
    # 하의는 GCP결과에서 아우터, 상의 박스를 제거한다.
    elif cate1 in ['7', '43']: afterFilter += ['Coat', 'Jacket', 'Outerwear','Vest','Shirt','Top','Hoodie','Sweater','T-shirt']

  elif au_id == 2545: # 베니토
    # 아우터/상의는 GCP결과에서 하의 박스를 제거한다.
    if cate1 in ['9', '37', '41','10']: afterFilter += ['Jeans','Pants','Shorts','Trousers','Sweatpants','Skirt','MiniSkirt']
    # 하의는 GCP결과에서 아우터, 상의 박스를 제거한다.
    elif cate1 in ['36','33']: afterFilter += ['Coat', 'Jacket', 'Outerwear','Vest','Shirt','Top','Hoodie','Sweater','T-shirt']


  if cate1 == None and cate2 == None:
    filter = f'au_id={au_id}'
  elif cate2 == None:
    filter = f'au_id={au_id} AND cate1_code={cate1}' #AND cate_1={cate1}
  else:  
    filter = f'au_id={au_id} AND cate1_code={cate1} AND cate2_code={cate2}' # AND cate_2={cate2}  

  # # 07/23 진우 작업
  # # GCP 결과에서 신발, 가방 박스를 제거한다.
  # afterFilter = ['Boot','High-heeled footwear','Sandal','Shoe','Flip-flops','High heels','Slipper','Footwear','Sneakers','Satchel','Handbag','Briefcase','Tašky a zavazadla','Luggage & bags','Bag'] # 신발, 가방
  # # 아우터/상의는 GCP결과에서 하의 박스를 제거한다.
  # if cate1 in ['Blouse','Knit/Tee', 'Outer']: afterFilter += ['Jeans','Pants','Shorts','Trousers','Sweatpants','Skirt','MiniSkirt']
  # # 하의는 GCP결과에서 아우터, 상의 박스를 제거한다.
  # elif cate1 in ['Pants','Skirt']: afterFilter += ['Coat', 'Jacket', 'Outerwear','Vest','Shirt','Top','Hoodie','Sweater','T-shirt']

  # if cate1 == None and cate2 == None:
  #   filter = f'au_id={au_id}'
  # elif cate2 == None:
  #   filter = f'au_id={au_id} AND cate_1={cate1}' #AND cate_1={cate1}
  # else:  
  #   filter = f'au_id={au_id} AND cate_1={cate1} AND cate_3={cate2}' # AND cate_2={cate2}

  print("[GCP FILTER]", filter)
  request_url = google_vision_url + module_name + psApiKey

  request_body = {
      "requests": [{
          'image': {
              'content': str(b64Image)[2:-1],
          },
          'features': [{
              'type': 'PRODUCT_SEARCH',
              'maxResults': topK
          }],
          'imageContext': {
              'productSearchParams': {
                  'productSet': 'projects/{}/locations/{}/productSets/{}'.format(psProject, psLocation, psProductSetId),
                  'productCategories': ['{}'.format(psProductCategory)],
                  'filter': filter
              }
          }
      }]
  }

  request_body = json.dumps(request_body)
  gcp_res_json = requests.post(
      request_url, data=request_body, headers=headers).json()

  pkeys = []
  scores = {}
  msg = ''
  delIndex = []
  # 전체결과
  if not 'error' in gcp_res_json['responses'][0].keys():
    for result in gcp_res_json['responses'][0]['productSearchResults']['results']:
        result['product']['img_uri'] = 'https://storage.googleapis.com/%s/%s' % (
            psProductSet, result['product']['displayName'])

        pkey = result['product']['name'].split('|')[-1]
        pkeys.append(pkey)
        scores[pkey] = result['score']

    # 박스결과
    if not len(gcp_res_json['responses'][0]['productSearchResults']['productGroupedResults']) == 0:
      for i, pgr in enumerate(gcp_res_json['responses'][0]['productSearchResults']['productGroupedResults']):
          try:       
            if pgr['objectAnnotations'][0]['name'] in afterFilter:
              delIndex.append(i)
              continue # 07/23 진우 작업 afterfilter
          except:
            continue
          if not 'results' in pgr.keys(): continue 
          for results in pgr['results']:
              results['product']['img_uri'] = 'https://storage.googleapis.com/%s/%s' % (
                  psProductSet, results['product']['displayName'])

              pkey = results['product']['name'].split('|')[-1]
              pkeys.append(pkey)
              if pkey in scores.keys():
                # print("exist", pkey, ">>>", "NEW:", results['score'], "ORI:", scores[pkey])
                scores[pkey] = max(results['score'], scores[pkey])
              else:
                scores[pkey] = results['score']  
  else:
    print(gcp_res_json)
    msg = 'error'

  # 인덱스 삭제
  if len(delIndex) > 0:
    delIndex.reverse()
    for di in delIndex:
      del gcp_res_json['responses'][0]['productSearchResults']['productGroupedResults'][di]
      
  return gcp_res_json, pkeys, msg, scores
