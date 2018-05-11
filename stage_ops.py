import numpy as np
import matplotlib.pyplot as plt
import json
import operator

with open('stage_ops.json') as f:
    data = json.load(f)
	
stageList = ['build','test','deploy']
echoList = []
shList = []
for stage in stageList:
    try:
        echoList.append(data[stage]['echo'])
    except:
        echoList.append(0)
    try:
        shList.append(data[stage]['sh'])
    except:
        shList.append(0)

stageCount = len(stageList)
ind = np.arange(stageCount)

fig, ax = plt.subplots()

p1 = ax.bar(ind, echoList, width=0.35, color='r')
p2 = ax.bar(ind+0.35, shList, width=0.35, color='y')

ax.set_title('Stage-wise operation frequencies')
ax.set_xticks(ind + 0.35 / 2)
ax.set_xticklabels(stageList)

ax.legend((p1[0], p2[0]), ('echo', 'sh'))

fig.savefig('plots/stage_ops.jpg')