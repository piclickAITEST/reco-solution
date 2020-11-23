import pymysql
import time
import requests
from bs4 import BeautifulSoup

#ssh_pkey = '/home/ubuntu/piclick.pem'
ssh_pkey = '/home/piclick/piclick.pem'

class Mysql_ad():
  def connectdb(self):
    conn = pymysql.connect(host='p-kr-ai-ads.cluster-cfb73nu5n703.ap-northeast-2.rds.amazonaws.com',
                            port=3306,
                            user='piclick',
                            passwd='psr0011!',
                            db='ad_crawling_cafe24')
    return conn
  
  def connectdb2(self):
    conn = pymysql.connect(host='p-kr-ai-ads.cluster-cfb73nu5n703.ap-northeast-2.rds.amazonaws.com',
                            port=3306,
                            user='piclick',
                            passwd='psr0011!',
                            db='ad_crawling')
    return conn

  def dbClose(self, cur):
    cur.close()

  def getSimilarCAFE24(self, au_id, p_key):
    conn = self.connectdb()
    cur = conn.cursor()

    try:
      #query = f'SELECT product_name, category1, category2, p_key FROM item_list WHERE p_key="{p_key}"'
      p_key = p_key.split("_")[-1]
      query = f'SELECT product_name, category1_code, category2_code, site_id, product_no FROM product_list WHERE product_no="{p_key}" AND au_id="{au_id}"'
      # print("[QUERY]", query)
      cur.execute(query)
      products = cur.fetchall()
      products = {au_id: {"product_name": product_name, "cate1": category1, "cate2": category2, "p_key":  str(site_id)+"_"+str(product_no)} for product_name, category1, category2, site_id, product_no in products}
      
      if len(products) == 0:
        products[au_id] = {}
      return products
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)


  # not cafe24
  def getSimilar(self, au_id, p_key):
    conn = self.connectdb2()
    cur = conn.cursor()

    try:
      p_key = p_key.split("_")[-1]
      query = f'SELECT product_name, category1, category2, site_id, product_id FROM `crawling_list2` WHERE product_id="{p_key}" AND au_id="{au_id}"'
      cur.execute(query)
      products = cur.fetchall()
      products = {au_id: {"product_name": product_name, "cate1": category1, "cate2": category2, "p_key":  str(site_id)+"_"+str(product_no)} for product_name, category1, category2, site_id, product_no in products}
      
      if len(products) == 0:
        products[au_id] = {}
      return products
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)


  def checkCondition(self, pkeys, au_ids, site_id):
    conn = self.connectdb()
    cur = conn.cursor()

    product_ids = [pkey.split('_')[-1] for pkey in pkeys]
    q = str([z for z in zip(au_ids,product_ids)]).replace('[','(').replace(']',')')
  
    try:
      cur.execute(
          "SELECT au_id, product_no, sold_out, display, selling FROM product_list WHERE (au_id, product_no) IN " +  q)
      products = cur.fetchall() # TODO: 이후 product_list 에 site_id가 들어온다면 그것으로 대체.
      products = {
                f'{site_id}_{product_no}': {
                  "sold_out": sold_out, "display": display, "selling": selling
                  } 
                for au_id, product_no, sold_out, display, selling in products}

      return products
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)

  
  
  def getSimilarInfo(self, pkeys):
    # https://reco.piclick.kr/click?cl={baseURL}
    print(pkeys)
    site_id = pkeys[0].split("_")[0]
    product_ids = [pkey.split('_')[-1] for pkey in pkeys]
    
    conn = self.connectdb()
    cur = conn.cursor()

    if site_id == "98":
      baseURL = "https://benito.co.kr/"
    elif site_id == "88":
      baseURL = "https://laurenhi.com/"

    try:
      query = "SELECT site_id, product_no, au_id, product_name, list_image, price FROM product_list WHERE site_id='"+site_id+"' and product_no IN " +  str(product_ids).replace('[','(').replace(']',')')
      print(query)
      cur.execute(query)
      products = cur.fetchall()
      products = {f'{site_id}_{product_no}': {"product_name": product_name, "img_url": list_image, "au_id": au_id,
      "product_price": int(price), "click_url": f'https://reco.piclick.kr/click?cl={baseURL}product/detail.html?product_no={product_no}'} 
      for site_id, product_no, au_id, product_name, list_image, price in products}

      if len(products) == 0: products = [[]]

      return products
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)

  def getImageUrl(self, site_id, product_id):  
    conn = self.connectdb2()
    cur = conn.cursor()

    if site_id == "98":
      baseURL = "https://benito.co.kr/"
    elif site_id == "88":
      baseURL = "https://laurenhi.com/"
    elif site_id == "7":
      baseURL = "http://www.bizos.co.kr"

    try:
      query = f"SELECT img_url FROM crawling_list2 WHERE site_id='{site_id}' and product_id = {product_id}"
      cur.execute(query)
      img_url = cur.fetchone()

      if img_url == None:
        # 비조스 / DB 상품 없을 시 페이지로 직접가서 이미지따옴
        if site_id == "7":
          res = requests.get(f'{baseURL}/shop/shopdetail.html?branduid={product_id}')
          res.encoding = 'euc-kr'
          soup = BeautifulSoup(res.text, 'html.parser')
          img_url = baseURL + soup.select_one('#productDetail > div.page-body > div.thumb-info > div > div > img')['src']
          product_name = soup.select_one('h3.name').text
      else:
        img_url = [[]]

      return img_url
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)


    

