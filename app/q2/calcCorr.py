import numpy as np
import matplotlib.pyplot as plt
import json
import operator
from scipy.stats.stats import pearsonr

with open('intermediateOutput.json') as f:
    vals = json.load(f)
	
triggerList = []
stageCountList = []

for v in vals:
	triggerList.append(v['triggers'])
	stageCountList.append(v['stages'])

corrCoef = round(pearsonr(triggerList,stageCountList)[0],2)

with open('finalOutput.json','r+',encoding="utf8") as f:
	full = json.load(f)
	full["corelation_coefficient"] = corrCoef
	f.seek(0)
	json.dump(full,f,indent=4)
	f.truncate()

xy = [[0]*(max(stageCountList)) for i in range(max(triggerList)+1)]
for i in range(len(stageCountList)):
    #print(i)
    xy[triggerList[i]][stageCountList[i]-1] += 10
	
triggerBinCount = len(set(triggerList))
stageBinCount = len(set(stageCountList))
fig = plt.figure(figsize=(triggerBinCount+2,stageBinCount))
plt.scatter(triggerList, stageCountList,s=np.array(xy).flatten())
plt.locator_params(axis='x', nbins=triggerBinCount)
plt.locator_params(axis='y', nbins=stageBinCount)
imageTitle = 'Correlation coefficient: '+ str(corrCoef)
plt.title(imageTitle)
plt.xlabel('Number of triggers')
plt.ylabel('Number of stages')
fig.savefig('trig_stage_corr.jpg')