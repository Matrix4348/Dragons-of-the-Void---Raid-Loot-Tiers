import shutil

## set-up

beta = "./user script/Development/beta.user.js"
latest = "./user script/latest.user.js"
trigger = "./user script/Development/Trigger release.txt"

final_lines=["# Release new version of the user script? #","No","# Error(s) from last attempt #"]
error_count=0

## Functions

def add_error(e):
    global final_lines
    global error_count
    final_lines.append(e)
    error_count+=1

def return_version(s):
    F=open(s,"r")
    f=F.read()
    F.close()
    beginning=f.find("@version")
    end=f.find("\\",beginning)
    v=f[beginning:end].replace(" ","").replace("@version","")
    return v

## Execution

with open(trigger, 'r') as f:
    L=f.readlines()
    t=L[1][0:-1]
    try:
        boo_trigger=["no","yes"].index(t.lower())
    except:
        boo_trigger=False
        add_error("\""+t+"\" is not a proper triggering keyword - only \"yes\" and \"no\" are accepted (not case-sensitive).")

vb=return_version(beta)
vl=return_version(latest)
if not vb>vl:
    boo_trigger=False
    add_error("New version number ("+vb+") is not strictly greater than the current version number ("+vl+").")

## Conclusion

if boo_trigger:
    shutil.copy2(beta,latest)

with open(trigger, 'w') as f:
    if not error_count:
        add_error("-")
    fl=""
    for l in final_lines:
        fl+=l+"\n"
    f.write(fl)
