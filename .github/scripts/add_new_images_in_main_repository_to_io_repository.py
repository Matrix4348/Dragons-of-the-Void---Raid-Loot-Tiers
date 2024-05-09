import os
import shutil

path1 = "./main/community-gathered data/Loot tiers and drop data/"
path2 = "./io/Loot tables/"

for root, dirs, files in os.walk(path1):
    for dir in dirs:
        path=path1+dir+"/"
        for r, d, f in os.walk(path):
            for name in f:
                if name.endswith((".png", ".jpg", ".jpeg", ".webp")):
                    p1=path+name
                    p2=path2+name
                    try:
                        with open(p1,"rb") as f1, open(p2,"rb") as f2:
                            x=not f1.read()==f2.read()
                    except:
                        x=True
                    if x:
                        shutil.copy2(p1,p2)
