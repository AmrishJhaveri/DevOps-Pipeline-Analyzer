import numpy as np
import matplotlib.pyplot as plt
import json
import operator

with open('tools_section.json') as f:
    data = json.load(f)
	
sortedData = sorted(data.items(), key=operator.itemgetter(1))
sortedData.reverse()
	
keyList = ["maven","jdk","gradle"]
missingKeys = list(set(keyList) - set(list(data.keys())))

myKeys = [t[0] for t in sortedData]#list(data.keys())
myKeys.extend(missingKeys)

counts = [t[1] for t in sortedData]#list(data.values())
counts.extend([0]*len(missingKeys))

fig = plt.figure(figsize=(3,max(counts)))
plt.bar(np.arange(3),counts)
plt.xticks(np.arange(3),myKeys)
plt.xlabel('Tools used')
plt.ylabel('Frequency')

fig.savefig('plots/tools_section.jpg')