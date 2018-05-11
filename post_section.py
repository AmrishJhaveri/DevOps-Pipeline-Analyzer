import numpy as np
import matplotlib.pyplot as plt
import json
import operator

with open('post_section.json') as f:
    data = json.load(f)
	
sortedData = sorted(data.items(), key=operator.itemgetter(1))
sortedData.reverse()
	
keyList = ["always","changed","fixed","regression","aborted","failure","success","unstable","cleanup"]
missingKeys = list(set(keyList) - set(list(data.keys())))

myKeys = [t[0] for t in sortedData]#list(data.keys())
myKeys.extend(missingKeys)

counts = [t[1] for t in sortedData]#list(data.values())
counts.extend([0]*len(missingKeys))

fig = plt.figure(figsize=(9,max(counts)))
plt.bar(np.arange(9),counts)
plt.xticks(np.arange(9),myKeys)

fig.savefig('plots/post_section.jpg')