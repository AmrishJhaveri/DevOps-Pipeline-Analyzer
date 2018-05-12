import numpy as np
import matplotlib.pyplot as plt
import json
from pylab import *

with open('intermediateOutput.json') as f:
    allOps = json.load(f)
	
with open('intermediateOutput_2.json') as f:
    allStageOps = json.load(f)

ops = {'init':0, 'build':0, 'report':0, 'test':0, 'deploy':0, 'checkout':0,'check':0,  'release':0, 'delete':0,'cleanup':0}

cmdDict = {}

for ao in list(allStageOps.keys()):
	if 'sonar' in ao:
		newKey = ao.replace("sonar","report ")
		allStageOps[newKey] = allStageOps.pop(ao);
		allOps[newKey] = allOps.pop(ao);

#update ops while iterating through allOps
for ao in allOps.items():
	key = ao[0]
	val = ao[1]
	#print("\n",key,val)
	keyExists = False
	
	#if key exists in dictionary ops, then increment
	for o in ops.keys():
		if o in key:
			ops[o] = ops[o] + 1
			keyExists = True
			break
	#else add new item to ops dictionary
	if not keyExists:
		ops[key] = 1

# Remove stages whose count is <=1
for o in list(ops.keys()):
	if ops[o]<=1:
		del ops[o]
#for o in ops.items():
#	print(o)
		
myKeys = list(ops.keys())
counts = list(ops.values())
length = len(myKeys)

fig = plt.figure(clear=True,figsize=(length*1.5,max(counts)/1.5))
plt.bar(np.arange(length),counts)
plt.xticks(np.arange(length),myKeys)
plt.xlabel('Stage operations')
plt.ylabel('Frequency')
#plt.autoscale_view()

fig.savefig('freq_ops.jpg')

for aso in allStageOps.keys():
	for o in ops.keys():
		if o in aso:
			stageCmdList = allStageOps[aso]
			if o not in cmdDict:
				cmdDict[o] = {}
			for s in stageCmdList:
				cmdDict[o][s] = cmdDict[o].get(s, 0) + 1
				#cmdDict[o][s] = cmdDict[o][s] + 1
			break
			
#for o in cmdDict.items():
#	print(o)
	
f, (ax1, ax2, ax3) = plt.subplots(3, sharex=True, sharey=True, figsize=(15,20))
subPlotCount = len(ops)

keyList = list(cmdDict.keys())

for i,v in enumerate(range(subPlotCount)):
	myDict = cmdDict[keyList[v]]
	myKeys = list(myDict.keys())
	#print(myKeys)
	length = len(myKeys)
	counts = list(myDict.values())
	v = v+1
	ax1 = subplot(subPlotCount,1,v)
	ax1.barh(range(length),counts,0.9)
	ax1.set_yticks(range(length))
	ax1.set_yticklabels(myKeys)
	ax1.set_ylabel(keyList[v-1])
	ax1.yaxis.set_label_position("right")

f.savefig('bigPlot.jpg',bbox_inches="tight")