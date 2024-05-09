import os
import shutil

# Assuming that the main repository is located in ./main and the github.io repository is located in ./io:
output_file = "./main/community-gathered data/raid_list.json" # Must exist
io_output_file = "./io/raid_list.json"

shutil.copy2(output_file, io_output_file)
