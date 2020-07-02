import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
sns.set(style="white")												 
paper_rc = {'lines.linewidth': 1, 'lines.markersize': 10, 'axes.grid':False} 
sns.set_context("paper", rc = paper_rc)
from matplotlib.colors import ListedColormap

def weighted_choice_sub(weights):
	rnd = np.random.random() * sum(weights)
	for i, w in enumerate(weights):
		rnd -= w
		if rnd < 0:
			return i

def sample_npoints(M, npoints=1000):
	dims = M.shape
	Mflat = -(np.flipud(M).flatten() - 255)

	outpoints = []
	for i in range(npoints):
		pt = weighted_choice_sub(Mflat)
		xy_pt = [ np.floor(pt/dims[0]), pt % dims[0] ]
		outpoints += [ xy_pt ]
		if (i+1) % 100 == 0:
			print('Sampled {}/{} points'.format(i+1,npoints))

	return np.array(outpoints)


def plot_kde(prefix, bw=0.1):
	img = Image.open(prefix+'.pbm')
	M = np.flipud(np.array(img.getdata(),np.uint8).reshape(img.size[1], img.size[0]))>0

	y,x = np.where(~M)
	greycmap = ListedColormap('darkgrey')

	fig, ax = plt.subplots(1, figsize=(6,6))

	sns.kdeplot(x,y, bw=bw, cmap=greycmap, ax=ax)

	maxx = M.shape[1]
	maxy = M.shape[0]
	ax.axis([-0.05*maxx,1.05*maxx,-0.05*maxy,1.05*maxy])
	ax.axis('off')
	plt.show()


# This is SLOW. It's much faster to re-stipple it using Gimp.
def plot_subsample_kde(prefix, bw=0.1, npoints=1000):
	img = Image.open(prefix+'.pbm')
	M = np.flipud(np.array(img.getdata(),np.uint8).reshape(img.size[1], img.size[0]))>0

	z = sample_npoints(M, npoints=npoints)

	x,y = z[:,1],z[:,0]
	greycmap = ListedColormap('darkslategrey')
	greycmap = ListedColormap('darkgrey')

	fig, ax = plt.subplots(1, figsize=(6,6))

	sns.kdeplot(x,y, bw=bw, cmap=greycmap)
	plt.show()


