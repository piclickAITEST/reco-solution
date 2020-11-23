import json
from elasticsearch import Elasticsearch
from datetime import datetime
from utils.utils import utc_time
import base64
import numpy as np

float32 = np.dtype('>f4')

class Elasticsearch:
    es = Elasticsearch('47.56.200.94:9200', timeout=30, max_retries=10, retry_on_timeout=True)

    def search_vec(self, search_index, search_vec, size=2):
        res = self.es.search(
            index=search_index,
            body={
                "_source": {
                    "includes": ["_index", "c_key"]
                },
                "query": {"function_score": {
                    "boost_mode": "replace",
                    "script_score": {"script": {
                        "source": "binary_vector_score", "lang": "knn",
                        "params": {
                            "cosine": True,
                            "field": "vector",
                            "encoded_vector":  self.encode_array(search_vec)
                            }
                        }
                    }
                }
                },
                "size": size
            },
            request_timeout=5
        )
        return json.dumps(res, ensure_ascii=True, indent='\t')

    def encode_array(self, arr):
        base64_str = base64.b64encode(np.array(arr).astype(float32)).decode("utf-8")
        return base64_str

    def save_vector_ps(self, vec, c_key, img_url):
        now = datetime.now()
        index = "search_img"
        doc = {
            "vector" : self.encode_array(vec),
            "c_key" : c_key,
            "img_url" : img_url,
            "ymd" : str(now.year)+str(now.month)+str(now.day),
            "hour" : str(now.hour),
            "@timestamp": utc_time()
        }

        self.es.index(index=index, doc_type="_doc", body=doc)