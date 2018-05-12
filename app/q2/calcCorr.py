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

pearsonr(triggerList,stageCountList)[0]