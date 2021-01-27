from __future__ import unicode_literals
import json
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# [0]=about
# [1]["sub"]=projects
# [2]["sub"]=summary
#       [2]["sub"][0] = fabrication
#       [2]["sub"][1]["sub"] = theory.sub
#       [2]["sub"][2] ============= 
#       [2]["sub"][3]["sub"] = media
# [3]=resource
with open('./build/assets/json/menuMap.json', 'r', encoding='UTF-8', errors='ignore') as reader:
    jf = json.loads(reader.read())
# =================== input data ==================
# theory
jf[2]["sub"][1]["sub"].append(
    {'type': 'button', 'title': 'tensorflow', 'title_tw': 'tensorflowtask', 'sub': None})

jsdata = json.dumps(jf, sort_keys=True, indent=4, ensure_ascii=False)

f = open('./val2.json', 'w', encoding='utf-8')
f.write(jsdata)
f.close()
# open('./val.json', 'w', encoding='utf-8'):
#    f.write(jsdata)
