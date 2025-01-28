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

def return_difficuties(d): # Returns each difficulty which first letter is in d.
    diff=[]
    if "E" in d:
        diff.append("Easy")
    if "H" in d:
        diff.append("Hard")
    if "L" in d:
        diff.append("Legendary")
    return diff

base_path = "./main/community-gathered data/Basic data/"
damage_path = "./main/community-gathered data/Base damage taken/"
loot_path = "./main/community-gathered data/Loot tiers and drop data/"
on_hit_path = "./main/community-gathered data/On-hit drops/"
notes_file = "./main/community-gathered data/Notes.csv"
output_file = "./main/community-gathered data/raid-list.json"

paths = {
    "raiding": ["Regular raids","Guild raids"],
    "questing": ["Quest bosses", "Quest minibosses"],
    "healthless": ["Special raids","World raids","Event raids"],
}

paths_to_files = {
    "": "Regular raids",
    "Guild raid": "Guild raids",
    "Quest boss": "Quest bosses",
    "Quest miniboss": "Quest minibosses",
    "Special raid": "Special raids",
    "Event raid": "Event raids",
    "World raid": "World raids"
}

types = {
    "Regular raids.csv": "",
    "Guild raids.csv": "Guild raid",
    "Quest bosses.csv": "Quest boss",
    "Quest minibosses.csv": "Quest miniboss",
    "Special raids.csv": "Special raid",
    "Event raids.csv": "Event raid",
    "World raids.csv": "World raid"
}

loot_formats = {
    "": "EHL",
    "Guild raid": "EHL",
    "Quest boss": "EHL",
    "Quest miniboss": "EHL",
    "Special raid": "EHL",
    "Event raid": "Image",
    "World raid": "Image"
}

default_difficulties = {
    "": "EHL",
    "Guild raid": "EHL",
    "Quest boss": "EHL",
    "Quest miniboss": "EHL",
    "Special raid":"E",
    "Event raid":"L",
    "World raid": "L"
}

participants = {
    "": { "Small": 10, "Medium": 50, "Large": 100, "Immense": 250 },
    "Guild raid": { "Small": 5, "Medium": 10, "Large": 20, "Immense": 30 }, # Value for immense guild raids is an assumption until one is released
    "Quest boss": { "Quest": 1 },
    "Quest miniboss": {"Quest": 1},
    "Special raid": { "World": 2000 },
    "Event raid": {"World": 10000 },
    "World raid": { "World": 10000 }
}

default_sizes = {
    "": "Small",
    "Guild raid": "Small",
    "Quest boss": "Quest",
    "Quest miniboss": "Quest",
    "Special raid": "World",
    "Event raid": "World",
    "World raid": "World"
}

bonus_drops_tier_based = ["Summoner loot?","Hidden loot?","Bonus tiers?"]

extra_drops = {
    "Summoner loot?": "Summoner",
    "Hidden loot?": "Hidden",
    "Bonus tiers?": "Bonus",
    "On-hit drops?": "On-hit drops",
    "Loot expansion?": "Loot expansion"
}

default_dict = defaultdict(list)

### Basic data files
for m in paths:
    for p0 in paths[m]:
        p=p0+".csv"
        try:
            f=open(base_path+p, 'r')
            reader = csv.DictReader(f, delimiter=',')
            for line in reader:
                raid_name = line.pop('Raid name')
                if raid_name not in default_dict:
                    default_dict[raid_name]=defaultdict(list)
                default_dict[raid_name][m]=line.copy()
                if "Raid type" not in default_dict[raid_name][m]:
                    default_dict[raid_name][m]["Raid type"]=types[p]
                if "Raid size" not in default_dict[raid_name][m]:
                    default_dict[raid_name][m]["Raid size"]=default_sizes[default_dict[raid_name][m]["Raid type"]]
                if "Maximum number of participants" not in default_dict[raid_name][m]:
                    if "Raid size" in default_dict[raid_name][m]:
                        default_dict[raid_name][m]["Maximum number of participants"]=participants[default_dict[raid_name][m]["Raid type"]][default_dict[raid_name][m]["Raid size"]]
                    else:
                        default_dict[raid_name][m]["Maximum number of participants"]=1
                if "Loot format" not in default_dict[raid_name][m]:
                    default_dict[raid_name][m]["Loot format"]=loot_formats[types[p]]
                if "Available difficulties" in default_dict[raid_name][m]:
                    default_dict[raid_name][m]["Available difficulties"] = return_difficuties(default_dict[raid_name][m].pop("Available difficulties"))
                else:
                    default_dict[raid_name][m]["Available difficulties"] = return_difficuties(default_difficulties[types[p]])
                # Let us replace empty cells with "?" and correct a few values:
                default_dict[raid_name][m]["Has extra drops"]={}
                for b in extra_drops:
                    edb=extra_drops[b]
                    if b not in default_dict[raid_name][m]:
                        default_dict[raid_name][m]["Has extra drops"][edb]=False
                    else:
                        c=default_dict[raid_name][m].pop(b)
                        if c.lower() in ["false","no","0","","-"]:
                            default_dict[raid_name][m]["Has extra drops"][edb]=False
                        elif c.lower() in ["true","yes","1"]:
                            default_dict[raid_name][m]["Has extra drops"][edb]=True
                        else:
                            default_dict[raid_name][m]["Has extra drops"][edb]=False
                for v in default_dict[raid_name][m]:
                    if default_dict[raid_name][m][v]=="" and v!="Raid type":
                        default_dict[raid_name][m][v]="?"
            f.close()
        except:
            pass


raid_list = {raid[0]:{m[0]:{v1:v2 for v1,v2 in m[1].items()} for m in raid[1].items()} for raid in sorted(default_dict.items())}


### Damage taken files
for m in paths:
    for p0 in paths[m]:
        p=p0+".csv"
        try:
            f=open(damage_path+p, 'r')
            reader = csv.DictReader(f, delimiter=',')
            for line in reader:
                raid_name = line.pop('Raid name')
                if raid_name in raid_list and m in raid_list[raid_name]:
                    damage_list={v1:v2 for v1,v2 in line.items()}
                    raid_list[raid_name][m]["Damage"]=damage_list.copy()
            # For the raids without a line in the damage taken csv:
            for r in raid_list:
                if m in raid_list[r] and "Damage" not in raid_list[r][m]:
                    raid_list[r][m]["Damage"]={h:"?" for h in reader.fieldnames}
            f.close()
        except:
            pass


### Raid tiers, drops, loot tables
for r in raid_list:
    for M in raid_list[r]:
        all_d = raid_list[r][M]["Available difficulties"]
        raid_list[r][M]["Health"]={a:"" for a in all_d}
        raid_list[r][M]["FS"]={a:0 for a in all_d}
        raid_list[r][M]["Loot tables"]={}
        raid_list[r][M]["Tiers"]={}
        raid_list[r][M]["Tiers as string"]={}
        raid_list[r][M]["Drops"]={}
        raid_list[r][M]["Extra drops"]={}
        raid_list[r][M]["Extra drops"]["On-hit drops"]={a:"no" for a in all_d}
        raid_list[r][M]["Extra drops"]["Loot expansion"]={a:"no" for a in all_d}
        raid_list[r][M]["Average stat points"]={a:[] for a in all_d}
        if raid_list[r][M]["Loot format"]=="EHL":
            raid_list[r][M]["Drops"]["Common"]={a:[] for a in all_d}
            raid_list[r][M]["Drops"]["Rare"]={a:[] for a in all_d}
            raid_list[r][M]["Drops"]["Mythic"]={a:[] for a in all_d}
            for b in bonus_drops_tier_based:
                raid_list[r][M]["Drops"][extra_drops[b]]={a:[] for a in all_d}
            raid_list[r][M]["Drops"]["as string"]={a:[] for a in all_d}
            # Health, FS:
            if M=="raiding":
                diff_health_mult={"Easy":1,"Hard":3,"Legendary":9}
                for d in all_d:
                    m=diff_health_mult[d]
                    hoe=cti(raid_list[r][M]["Health on easy"])
                    mnp=raid_list[r][M]["Maximum number of participants"]
                    if isinstance(hoe,int):
                        raid_list[r][M]["Health"][d]=itc(m*hoe)
                        raid_list[r][M]["FS"][d]=itc(m*hoe/mnp)
                    else:
                        raid_list[r][M]["Health"][d]=hoe
                        raid_list[r][M]["FS"][d]="?"
            elif M=="questing":
                for d in all_d:
                    raid_list[r][M]["Health"][d]=cti(raid_list[r][M]["Health on "+d.lower()])
            # Tiers, drops:
            for d in all_d:
                raid_list[r][M]["Tiers"][d]=[]
                raid_list[r][M]["Average stat points"][d]=[]
                try:
                    f=open(loot_path+paths_to_files[raid_list[r][M]["Raid type"]]+"/"+r+"/"+d+".csv", 'r')
                except:
                    f=open(loot_path+paths_to_files[raid_list[r][M]["Raid type"]]+"/"+"_Example_/"+d+".csv", 'r')
                finally:
                    reader = csv.DictReader(f, delimiter=',')
                    for line in reader:
                        dam=line.pop('Damage')
                        if dam=="Health": # For questing, _Example_ will contain the general drop pattern
                            dam=itc(raid_list[r][M]["Health"][d])
                        elif dam=="FS":
                            dam=itc(raid_list[r][M]["FS"][d])
                        raid_list[r][M]["Tiers"][d].append(dam)
                        raid_list[r][M]["Drops"]["Common"][d].append(line.pop('Common'))
                        raid_list[r][M]["Drops"]["Rare"][d].append(line.pop('Rare'))
                        raid_list[r][M]["Drops"]["Mythic"][d].append(line.pop('Mythic'))
                        for b in bonus_drops_tier_based:
                            x=extra_drops[b]
                            if x in line:
                                raid_list[r][M]["Drops"][x][d].append(line.pop(x))
                                if raid_list[r][M]["Drops"][x][d][-1].lower() not in ["","0","no","false","-"]:
                                    raid_list[r][M]["Has extra drops"][x]=True
                            elif raid_list[r][M]["Has extra drops"][x]:
                                raid_list[r][M]["Drops"][x][d].append("?")
                            else:
                                raid_list[r][M]["Drops"][x][d].append("-")
                        if "Average stat points" in line:
                            raid_list[r][M]["Average stat points"][d].append(line.pop("Average stat points"))
                    f.close()
                l=len(raid_list[r][M]["Tiers"][d]) # This will be used several times below.
                if l==0:
                    if M=="raiding":
                        z=["???",raid_list[r][M]["FS"][d],"???"]
                    elif M=="questing":
                        z=[itc(raid_list[r][M]["Health"][d])]
                    elif M=="healthless":
                        z=["???"]
                    zl=len(z)
                    for j in range(zl):
                        raid_list[r][M]["Tiers"][d].append(z[j])
                        l+=1
                        raid_list[r][M]["Drops"]["Common"][d].append("?")
                        raid_list[r][M]["Drops"]["Rare"][d].append("?")
                        raid_list[r][M]["Drops"]["Mythic"][d].append("?")
                        for b in bonus_drops_tier_based:
                            x=extra_drops[b]
                            if raid_list[r][M]["Has extra drops"][x]:
                                raid_list[r][M]["Drops"][x][d].append("?")
                            else:
                                raid_list[r][M]["Drops"][x][d].append("-")
                # In hope that this will remain the same for every difficulty:
                raid_list[r][M]["Extra drops"]["Loot expansion"][d]=raid_list[r][M]["Has extra drops"]["Loot expansion"]
                # Tiers, as a single character string:
                if M=="raiding":
                    raid_list[r][M]["Tiers as string"][d]=""
                    if raid_list[r][M]["Tiers"][d][0]=="?" and raid_list[r][M]["FS"][d] not in raid_list[r][M]["Tiers"][d]:
                        raid_list[r][M]["Tiers as string"][d]="<b> ??? | "+raid_list[r][M]["FS"][d]+"=FS | ???</b>"
                    elif raid_list[r][M]["Tiers"][d][0]==raid_list[r][M]["FS"][d]:
                        raid_list[r][M]["Tiers as string"][d]="<b>"+raid_list[r][M]["Tiers"][d][0]+"=FS</b>"
                    else:
                        raid_list[r][M]["Tiers as string"][d]=raid_list[r][M]["Tiers"][d][0]
                    for k in range(1,l):
                        if raid_list[r][M]["Tiers"][d][k]==raid_list[r][M]["FS"][d]:
                            raid_list[r][M]["Tiers as string"][d]+=" | <b>"+raid_list[r][M]["Tiers"][d][k]+"=FS</b>"
                        else:
                            raid_list[r][M]["Tiers as string"][d]+=" | "+raid_list[r][M]["Tiers"][d][k]
                elif M=="questing":
                    raid_list[r][M]["Tiers as string"][d]=raid_list[r][M]["Tiers"][d][0]
                    for k in range(1,l):
                        raid_list[r][M]["Tiers as string"][d]+=" | "+raid_list[r][M]["Tiers"][d][k]
                elif M=="healthless":
                    raid_list[r][M]["Tiers as string"][d]=raid_list[r][M]["Tiers"][d][0]
                    for k in range(1,l):
                        raid_list[r][M]["Tiers as string"][d]+=" | "+raid_list[r][M]["Tiers"][d][k]
            for d in all_d:
                thing_to_remove="Health on "+d.lower()
                if thing_to_remove in raid_list[r][M]:
                    raid_list[r][M].pop("Health on "+d.lower()) # Health data was moved to raid_list[r][M]["Health"][d].
        elif raid_list[r][M]["Loot format"]=="Image":
            try:
                f=open(loot_path+paths_to_files[raid_list[r][M]["Raid type"]]+"/"+r+"/Loot tables.csv", 'r')
            except:
                f=open(loot_path+paths_to_files[raid_list[r][M]["Raid type"]]+"/"+"_Example_/Loot tables.csv", 'r')
            finally:
                for d in all_d: # This will have to be reworked if a case with several difficulties arise
                    raid_list[r][M]["Loot tables"][d]=[]
                    reader = csv.DictReader(f, delimiter=',')
                    for line in reader:
                        URL="https://matrix4348.github.io/loot-tables/"+line.pop("File name")
                        date=line.pop("Date of first use")
                        raid_list[r][M]["Loot tables"][d].append({"URL":URL,"date_of_release":date})
                    if len(raid_list[r][M]["Loot tables"][d])==0:
                        raid_list[r][M]["Loot tables"][d].append({"URL":"<i>No loot table URL found.</i>","date_of_release":"Today"})
                f.close()


### On-hit drops
# raid_list[raid_name][mode]["Has extra drops"]["On-hit drops"] will contain weither or not any difficulty has on-hit drops, even if it does not have on-hit drops on all of them
for m in paths:
    for p0 in paths[m]:
        p=p0+".csv"
        try:
            f=open(on_hit_path+p, 'r')
            reader = csv.DictReader(f, delimiter=',')
            for line in reader:
                raid_name = line.pop('Raid name')
                if raid_name in raid_list and m in raid_list[raid_name]:
                    drop_list={v1:v2 for v1,v2 in line.items()}
                    raid_list[raid_name][m]["Extra drops"]["On-hit drops"]=drop_list.copy()
                for d in raid_list[raid_name][m]["Extra drops"]["On-hit drops"]:
                    if raid_list[raid_name][m]["Extra drops"]["On-hit drops"][d].lower() in ["","no","false","0","none","-"]:
                        raid_list[raid_name][m]["Extra drops"]["On-hit drops"][d]="no"
                    else:
                        raid_list[raid_name][m]["Has extra drops"]["On-hit drops"]=True
        except:
            pass


### Notes
for name in raid_list:
    for mode in raid_list[name]:
        raid_list[name][mode]["notes"]={}
        type=raid_list[name][mode]["Raid type"]
        size=raid_list[name][mode]["Raid size"]
        loot_format=raid_list[name][mode]["Loot format"]
        for difficulty in raid_list[name][mode]["Available difficulties"]:
            raid_list[name][mode]["notes"][difficulty]=[]
            with open(notes_file, 'r') as f:
                reader = csv.DictReader(f, delimiter=',')
                for line in reader:
                    condition=line.pop("Condition (Python)")
                    note=line.pop("Note")
                    try:
                        if eval(condition):
                            raid_list[name][mode]["notes"][difficulty].append(note)
                    except:
                        pass

### File creation
with open(output_file, 'w') as f:
    json.dump(raid_list, f)
