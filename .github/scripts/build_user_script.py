import json

draft = "./main/user script/development.user.js"
latest = "./main/user script/latest.user.js"
raid_list_file = "./main/docs/raid-list.json"
raid_filters_file = "./main/docs/raid-filters.json"

## Set raid_list
try:
    with open(raid_list_file,"r") as reader:
        raid_list=reader.read()
except:
    raid_list="{}"

## Set raid_filters
try:
    with open(raid_filters_file,"r") as reader:
        raid_filters_json=json.load(reader)
    with open(raid_filters_file,"w+") as reader:
        json.dump(raid_filters_json,reader) # To remove whitespaces.
    with open(raid_filters_file,"r") as reader:
        raid_filters=reader.read()
except:
    raid_filters="{}"

### Build the script:
with open(draft,"r") as F0, open(latest,"w+") as F:
    # Raid list:
    M="/* MARKER 1 */"
    l=len(M)
    f=F0.read()
    beginning=f.find(M)
    end=f.find(M,beginning+l)
    newf=f[0:beginning]+M+" raid_list=raid_list||"+raid_list+"; "+M+f[end+l:]
    # Raid filters:
    M="/* MARKER 2 */"
    l=len(M)
    f=newf
    beginning=f.find(M)
    end=f.find(M,beginning+l)
    newf=f[0:beginning]+M+" raid_filters=raid_filters||"+raid_filters+"; "+M+f[end+l:]
    # Write:
    F.write(newf)