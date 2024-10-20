draft = "./user script/development.user.js"
latest = "./user script/latest.user.js"
raid_list_file = "./community-gathered data/raid_list.json"

try:
    with open(raid_list_file,"r") as reader:
        raid_list=reader.read()
except:
    raid_list="{}"
finally:
    M="/* MARKER 1 */"
    l=len(M)
    with open(draft,"r") as F0, open(latest,"w") as F:
        f=F0.read()
        beginning=f.find(M)
        end=f.find(M,beginning+l)
        newf=f[0:beginning]+M+" raid_list="+raid_list+"; "+M+f[end+l:]
        F.write(newf)