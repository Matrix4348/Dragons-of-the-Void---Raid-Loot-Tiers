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
        end=min(f.find("\\",beginning),f.find("\n",beginning))
        # Note: files are not read/encoded the same way on GitHub than on my computer.
        # On the former, new lines are displayed as \n while on my computer, they are displayed as \\par\n
        v=f[beginning:end].replace(" ","").replace("@version","")
    return v or "none"

latest = "./user script/latest.user.js"
all_folder = "./user script/All versions/"

vl=return_version(latest)
file=all_folder+vl.replace(".","_")+".user.js"
if vl!="none":
    shutil.copy2(latest,file)
