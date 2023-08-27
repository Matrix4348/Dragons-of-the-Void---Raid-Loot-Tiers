from filestack import Security, Client, Filelink
import time

raid_list_file = "./community-gathered data/raid_list.json"
policy = {"expiry": int(time.time())+4000}

security = Security(policy, app_secret)
filelink = Filelink(handle)

filelink.overwrite(filepath=raid_list_file,security=security)
