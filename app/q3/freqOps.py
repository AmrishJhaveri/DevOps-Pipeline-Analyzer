import numpy as np
import matplotlib.pyplot as plt
import json
import operator

with open('intermediateOutput.json') as f:
    allOps = json.load(f)

ops = {'init':0, 'build':0, 'test':0, 'deploy':0, 'checkout':0,'check':0, 'report':0, 'release':0, 'delete':0,'cleanup':0}

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
	
myKeys = list(ops.keys())
counts = list(ops.values())
len = len(myKeys)

fig = plt.figure(clear=True,figsize=(len*1.5,max(counts)/1.5))
plt.bar(np.arange(len),counts)
plt.xticks(np.arange(len),myKeys)
plt.xlabel('Stage operations')
plt.ylabel('Frequency')
#plt.autoscale_view()

fig.savefig('freq_ops.jpg')