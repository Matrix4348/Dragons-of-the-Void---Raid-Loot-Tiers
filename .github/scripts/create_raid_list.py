import os
import csv
import json
from collections import defaultdict

def cti(n): # Takes a character string containing a number with comma separators and returns the associated number as an integer.
    if isinstance(n,int):
        return n
    else:
        try:
            return int(n.replace(",","")) # For example, cti("1,000,000") returns 1000000.
        except:
            return n # In case the initial value was a "?", a word or anything of this kind.

def itc(n): # Takes a number and writes it with comma separators.
    if isinstance(n,str):
        return n
    else:
        return "{:,}".format(int(n))

base_file = "./community-gathered data/Basic raid data.csv"
damage_file = "./community-gathered data/Base damage taken.csv"
loot_path = "./community-gathered data/Loot tiers and drop data/"
output_file = "./community-gathered data/raid_list.json"
io_output_file= "./raid_list.json"

default_dict = defaultdict(list)

with open(base_file, 'r') as f:
    reader = csv.DictReader(f, delimiter=',')
    for line in reader:
        raid_name = line.pop('Raid name')
        default_dict[raid_name]=line.copy()

raid_list = {raid[0]:{v1:v2 for v1,v2 in raid[1].items()} for raid in default_dict.items()}

# Let us replace empty cells with "?" and correct a few values:
for r in raid_list:
    raid=raid_list[r]
    for v in raid:
        if raid[v]=="" and v!="Raid type":
            raid_list[r][v]="?"
    if raid["Has summoner loot?"].lower() in ["false","no","0"]:
        raid["Has summoner loot?"]=False
    elif raid["Has summoner loot?"].lower() in ["true","yes","1"]:
        raid["Has summoner loot?"]=True
    if raid["Has hidden loot?"].lower() in ["false","no","0"]:
        raid["Has hidden loot?"]=False
    elif raid["Has hidden loot?"].lower() in ["true","yes","1"]:
        raid["Has hidden loot?"]=True

with open(damage_file, 'r') as f:
    reader = csv.DictReader(f, delimiter=',')
    for line in reader:
        raid_name = line.pop('Raid name')
        if raid_name in raid_list:
            damage_list={v1:v2 for v1,v2 in line.items()}
            raid_list[raid_name]["Damage"]=damage_list.copy()
    # For the raids without a line in the damage taken csv:
    for r in raid_list:
        if "Damage" not in raid_list[r]:
            raid_list[r]["Damage"]={h:"?" for h in reader.fieldnames}

for r in raid_list:
    diff_health_mult={"Easy":1,"Hard":3,"Legendary":9}
    if raid_list[r]["Loot format"]=="EHL":
        raid_list[r]["Health"]={"Easy":"","Hard":"","Legendary":""}
        raid_list[r]["FS"]={"Easy":1,"Hard":1,"Legendary":1}
        raid_list[r]["Common"]={"Easy":[],"Hard":[],"Legendary":[]}
        raid_list[r]["Rare"]={"Easy":[],"Hard":[],"Legendary":[]}
        raid_list[r]["Mythic"]={"Easy":[],"Hard":[],"Legendary":[]}
        raid_list[r]["Summoner"]={"Easy":[],"Hard":[],"Legendary":[]}
        raid_list[r]["Hidden"]={"Easy":[],"Hard":[],"Legendary":[]}
        raid_list[r]["drops"]={"Easy":[], "Hard":[], "Legendary":[]}
        for d in ["Easy","Hard","Legendary"]:
            # Health, FS:
            m=diff_health_mult[d]
            hoe=cti(raid_list[r]["Health on easy"])
            mnp=cti(raid_list[r]["Maximum number of participants"])
            if isinstance(hoe,int):
                raid_list[r]["Health"][d]=itc(m*hoe)
                if isinstance(mnp,int):
                    raid_list[r]["FS"][d]=itc(m*hoe/mnp)
                else:
                    raid_list[r]["FS"][d]="?"
            else:
                raid_list[r]["Health"][d]=hoe
                raid_list[r]["FS"][d]="?"
            # Tiers, drops:
            raid_list[r][d+" tiers"]=[]
            try:
                f=open(loot_path+r+"/"+d+".csv", 'r')
            except:
                f=open(loot_path+"Example/"+d+".csv", 'r')
            finally:
                reader = csv.DictReader(f, delimiter=',')
                for line in reader:
                    raid_list[r][d+" tiers"].append(line.pop('Damage') or "?")
                    raid_list[r]["Common"][d].append(line.pop('Common') or "?")
                    raid_list[r]["Rare"][d].append(line.pop('Rare') or "?")
                    raid_list[r]["Mythic"][d].append(line.pop('Mythic') or "?")
                    if raid_list[r]["Has summoner loot?"]== False:
                        raid_list[r]["Summoner"][d].append("0")
                    else:
                        raid_list[r]["Summoner"][d].append(line.pop('Summoner'))
                    if raid_list[r]["Has hidden loot?"]== False:
                        raid_list[r]["Hidden"][d].append("0")
                    else:
                        raid_list[r]["Hidden"][d].append(line.pop('Hidden'))
                f.close()
            l=len(raid_list[r][d+" tiers"]) # This will be used several times below.
            if l==0:
                raid_list[r][d+" tiers"].append(raid_list[r]["FS"][d])
                l+=1
                raid_list[r]["Common"][d].append("?")
                raid_list[r]["Rare"][d].append("?")
                raid_list[r]["Mythic"][d].append("?")
                if raid_list[r]["Has hidden loot?"]== False:
                    raid_list[r]["Hidden"][d].append("0")
                else:
                    raid_list[r]["Hidden"][d].append("?")
                if raid_list[r]["Has summoner loot?"]== False:
                    raid_list[r]["Summoner"][d].append("0")
                else:
                    raid_list[r]["Summoner"][d].append("?")
            # Tiers, as a single character string:
            raid_list[r][d]=""
            if raid_list[r][d+" tiers"][0]=="?" and raid_list[r]["FS"][d] not in raid_list[r][d+" tiers"]:
                raid_list[r][d]="<b> ??? | "+raid_list[r]["FS"][d]+"=FS | ???</b>"
            elif raid_list[r][d+" tiers"][0]==raid_list[r]["FS"][d]:
                raid_list[r][d]="<b>"+raid_list[r][d+" tiers"][0]+"=FS</b>"
            else:
                raid_list[r][d]=raid_list[r][d+" tiers"][0]
            for k in range(1,l):
                if raid_list[r][d+" tiers"][k]==raid_list[r]["FS"][d]:
                    raid_list[r][d]=raid_list[r][d]+" | <b>"+raid_list[r][d+" tiers"][k]+"=FS</b>"
                else:
                    raid_list[r][d]=raid_list[r][d]+" | "+raid_list[r][d+" tiers"][k]
            # Drops, as a list of grouped character strings:
            for k in range(l):
                d1=raid_list[r]["Common"][d][k]
                d2=raid_list[r]["Rare"][d][k]
                d3=raid_list[r]["Mythic"][d][k]
                d4=raid_list[r]["Hidden"][d][k]
                d5=raid_list[r]["Summoner"][d][k]
                raid_list[r]["drops"][d].append(d1+" | "+d2+" | "+d3+" | "+d4+" | "+d5)
        raid_list[r].pop("Health on easy") # At this point, we no longer need this key as it was moved to raid_list[r]["Health"]["Easy"].
    elif raid_list[r]["Loot format"]=="Image":
        try:
            f=open(loot_path+r+"/Loot tables.csv", 'r')
        except:
            f=open(loot_path+"Example/Loot tables.csv", 'r')
        finally:
            headers=csv.DictReader(f,delimiter=",").fieldnames
            last_line=list(csv.reader(f,delimiter=","))[-1]
            if last_line!=headers and "File name" in headers:
                raid_list[r]["Loot table"]="https://matrix4348.github.io/Loot%20tables/"+last_line[headers.index("File name")]
            else:
                raid_list[r]["Loot table"]="<i>No loot table URL found.</i>"
            f.close()

with open(output_file, 'w') as f:
    json.dump(raid_list, f)

with open(io_output_file, 'w") as f:
    json.dump(raid_list, f)
