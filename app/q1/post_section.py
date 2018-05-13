import numpy as np
import matplotlib.pyplot as plt
import json
import operator

#Graph 1
with open('intermediateOutput.json') as f:
    data = json.load(f)
	
sortedData = sorted(data.items(), key=operator.itemgetter(1))
sortedData.reverse()
	
keyList = ["always","changed","fixed","regression","aborted","failure","success","unstable","cleanup"]
missingKeys = list(set(keyList) - set(list(data.keys())))

myKeys = [t[0] for t in sortedData]#list(data.keys())
myKeys.extend(missingKeys)

counts = [t[1] for t in sortedData]#list(data.values())
counts.extend([0]*len(missingKeys))

fig = plt.figure(figsize=(9,max(counts)/9))
plt.bar(np.arange(9),counts)
plt.xticks(np.arange(9),myKeys)
plt.xlabel('post-condition blocks')
plt.ylabel('Frequency')

fig.savefig('post_section.jpg',bbox_inches="tight")

#Graph 2
with open('intermediateOutput_2.json') as f:
    data = json.load(f)

sortedData = sorted(data.items(), key=operator.itemgetter(1))
sortedData.reverse()
	
myKeys = [t[0] for t in sortedData]
counts = [t[1] for t in sortedData]
len = len(myKeys)

fig = plt.figure(clear=True,figsize=(len*1.5,max(counts)*1.5/len))
plt.bar(np.arange(len),counts)
plt.xticks(np.arange(len),myKeys)
plt.xlabel('post-condition command')
plt.ylabel('Frequency')
#plt.autoscale_view()

fig.savefig('post_section_cmds.jpg',bbox_inches="tight")