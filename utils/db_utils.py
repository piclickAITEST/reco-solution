import pymysql
import time

ssh_pkey = '/home/ubuntu/piclick.pem'
# ssh_pkey = '/home/piclick/piclick.pem'

class Mysql():
  def connectdb(self):

    conn = pymysql.connect(host='p-kr-main-db.cluster-cfb73nu5n703.ap-northeast-2.rds.amazonaws.com',
                            port=3306,
                            user='piclick',
                            passwd='psr9566!',
                            db='piclick')
    return  conn

  def dbClose(self, cur):
    cur.close()

  def getSimilar(self, au_id, p_key):
    conn = self.connectdb()
    cur = conn.cursor()

    try:
      query = f'SELECT product_name, category1, category2, p_key FROM item_list WHERE p_key="{p_key}"'
      # print("[QUERY]", query)
      cur.execute(query)
      products = cur.fetchall()
      products = {au_id: {"product_name": product_name, "cate1": category1, "cate2": category2, "p_key": p_key} for product_name, category1, category2, p_key in products}
      
      if len(products) == 0:
        products[au_id] = {}
      return products
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)


  def getSimilarInfo(self, pkeys):
    conn = self.connectdb()
    cur = conn.cursor()

    try:
      cur.execute(
          "SELECT p_key, au_id, product_name, img_url, price_pc, click_url, click_url_m FROM item_list WHERE p_key IN " +  str(pkeys).replace('[','(').replace(']',')'))
      products = cur.fetchall()
      products = {pkey: {
                    "product_name": product_name, 
                    "img_url": img_url, 
                    "au_id": au_id,
                    "product_price": int(price_pc), 
                    "click_url": 'https://reco.piclick.kr/click?cl=https://'+ click_url, 
                    "click_url_m": click_url_m} 
                  for pkey, au_id, product_name, img_url, price_pc, click_url, click_url_m in products}
      return products
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)


  def getProductInfo(self, pkeys):
    conn = self.connectdb()
    cur = conn.cursor()

    try:
      cur.execute(
          "SELECT p_key, product_name, product_price, click_url, click_url_m FROM product_list WHERE p_key IN " +  str(pkeys).replace('[','(').replace(']',')'))
      products = cur.fetchall()
      products = {pkey: {"product_name": product_name, "product_price": product_price, "click_url": click_url, "click_url_m": click_url_m} for pkey, product_name, product_price, click_url, click_url_m in products}
      return products
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)
  
  def getSimilarInfo2(self, pkeys):
    conn = self.connectdb()
    cur = conn.cursor()

    try:
      cur.execute(
          "SELECT p_key, au_id, product_name, img_url, price_pc, click_url, click_url_m FROM product_list2 WHERE STATUS=1 AND p_key IN " +  str(pkeys).replace('[','(').replace(']',')'))
      products = cur.fetchall()
      products = {pkey: {"product_name": product_name, "img_url": img_url, "au_id": au_id,
      "product_price": int(price_pc), "click_url": "https://reco.piclick.kr/click?cl="+click_url, "click_url_m": click_url_m} 
      for pkey, au_id, product_name, img_url, price_pc, click_url, click_url_m in products}
      return products
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)
      

  def getAdvertiser(self):
    conn = self.connectdb()
    cur = conn.cursor()
    try:
      cur.execute("SELECT DISTINCT b.bizName, a.au_id FROM users AS u JOIN advertiser_record AS a ON a.au_lid = u.lid JOIN biz_info AS b ON b.u_id = a.au_id")
      advertisers = cur.fetchall()
      advertisers = {au_id: bizName for bizName, au_id in advertisers}
      return advertisers
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)

  def getAdvertiserStatics(self):
    conn = self.connectdb()
    cur = conn.cursor()

    sql = """
          SELECT b.bizName, au_id, COUNT(*) AS COUNT 
          FROM product_list AS p
          JOIN biz_info AS b ON b.u_id = p.au_id
          WHERE STATUS=1 
          AND au_id IN 
          (SELECT p.au_id FROM 
          (SELECT DISTINCT b.bizName, a.au_id FROM users AS u JOIN advertiser_record AS a ON a.au_lid = u.lid JOIN biz_info AS b ON b.u_id = a.au_id) p) 
          GROUP BY au_id
          ORDER BY COUNT(*) DESC
          LIMIT 5
          """

    try:
      cur.execute(sql)
      countByAdver = cur.fetchall()
      countByAdver = {au_id: {"bizName":bizName,"count":count} for bizName, au_id, count in countByAdver}
      return countByAdver
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)
  
  # Cookie
  def getTBLByCookie(self, cookieID, userID):
    conn = self.connectdb()
    cur = conn.cursor() 
    # 베니토 고정
    siteID = '98'
    if userID == "":
      sql = f'SELECT product_id FROM `tbl_reco_click` WHERE cookie_id="{cookieID}" and action in ("CART","WISH") and site_id="{siteID}" ORDER BY idx DESC'
    else:
      sql = f'SELECT product_id FROM `tbl_reco_click` WHERE (cookie_id="{cookieID}" or user_id="{userID}") and action in ("CART","WISH") and site_id="{siteID}" ORDER BY idx DESC'
      
    try:
      print(sql)
      cur.execute(sql)
      userInfo = cur.fetchall()
      userInfo =  [list(user)[0] for user in userInfo]
      return userInfo
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)

  # OrderID
  def getTBLByOrderID(self, orderID):
    conn = self.connectdb()
    cur = conn.cursor() 

    sql = f'SELECT product_id FROM tbl_reco_click WHERE user_id = (SELECT p.user_id FROM (SELECT DISTINCT user_id FROM tbl_rcv_buy_log WHERE order_no = "{orderID}") AS p)'
    print(sql)
    try:
      cur.execute(sql)
      userInfo = cur.fetchall()
      userInfo =  [list(user)[0] for user in userInfo]
      return userInfo
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)

  # CAFE24(?) 베니토 쿠키용
  def getProductInfoForUserSearch(self, pkeys):
    conn = self.connectdb()
    cur = conn.cursor()

    try:
      cur.execute(
          #"SELECT p_key, product_name, product_price, click_url, click_url_m FROM product_list WHERE product_id IN " +  str(pkeys).replace('[','(').replace(']',')'))
          "SELECT p_key, product_name, img_url, click_url, click_url_m, price_pc FROM item_list WHERE product_id IN " +  str(pkeys).replace('[','(').replace(']',')'))
      products = cur.fetchall()
      products = {p_key: {"product_name": product_name, "product_price": int(price_pc), "click_url": "https://"+click_url, "click_url_m": click_url_m, "img_url": img_url} for p_key, product_name, img_url, click_url, click_url_m, price_pc in products}
      return products
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)

  # 비조스용
  def getProductInfoForUserSearchElse(self, pkeys):
    conn = self.connectdb()
    cur = conn.cursor()

    try:
      cur.execute("SELECT p_key, product_name, img_url, click_url, click_url_m, product_price FROM product_list2 WHERE product_id IN " +  str(pkeys).replace('[','(').replace(']',')'))
      products = cur.fetchall()
      products = {p_key: {"product_name": product_name, "product_price": int(price_pc), "click_url": "https://"+click_url, "click_url_m": click_url_m, "img_url": img_url} for p_key, product_name, img_url, click_url, click_url_m, price_pc in products}
      return products
    except Exception as e:
      print(e)
    finally:
      self.dbClose(cur)
  
  
