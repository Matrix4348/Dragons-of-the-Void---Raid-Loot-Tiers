import shutil

def return_version(s):
    try:
        F=open(s,"r")
        f=F.read()
        F.close()
    except:
        f=""
    finally:
        beginning=f.find("@version")
        end=f.find("\\",beginning)
        v=f[beginning:end].replace(" ","").replace("@version","")
    return v or "none"

latest = "./user script/latest.user.js"
all_folder = "./user script/All versions/"

vl=return_version(latest)
file=all_folder+vl.replace(".","_")+".user.js"
if vl!="none":
    shutil.copy2(latest,file)
