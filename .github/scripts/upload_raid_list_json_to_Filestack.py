from filestack import Security, Client, Filelink
import os
import time

raid_list_file = "./community-gathered data/raid_list.json"
policy = {"expiry": int(time.time())+4000}

app_secret = os.environ.get("app_secret")
handle = os.environ.get("handle")
api_key= os.environ.get("api_key")

security = Security(policy, app_secret)
filelink = Filelink(handle)

#filelink.overwrite(filepath=raid_list_file,security=security)
filelink.delete(apikey=api_key,security=security)
