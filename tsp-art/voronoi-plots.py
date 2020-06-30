import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from scipy.spatial import Voronoi, ConvexHull

def pbm2tsp(prefix):
	infile  = prefix+'.pbm'
	outfile = prefix+'.tsp'

	im = Image.open(infile)
	M  = ~np.array(im)
	x  = np.array(np.where(M)).T

	out_str  = "NAME: tmp\nTYPE: TSP\nCOMMENT: tmp\nDIMENSION: {}\n".format(len(x))
	out_str += "EDGE_WEIGHT_TYPE: EUC_2D\nNODE_COORD_SECTION\n"
	for i,xi in enumerate(x):
		out_str += "{:d} {:.1f} {:.1f}\n".format(i+1,xi[0],xi[1])
	out_str += "EOF\n"

	with open(outfile,'w') as f:
		f.write(out_str)


def voronoi_volumes(points):
    v = Voronoi(points)
    vol = np.zeros(v.npoints)
    for i, reg_num in enumerate(v.point_region):
        indices = v.regions[reg_num]
        if -1 in indices: # some regions can be opened
            vol[i] = np.inf
        else:
            vol[i] = ConvexHull(v.vertices[indices]).volume
    return vol

def voronoi_plot(prefix, min_s=0.01, max_s=3, nonlinear=True):
	infile = prefix+'.pbm'
	im = Image.open(infile)
	M  = ~np.array(im)
	x  = np.array(np.where(M)).T

	# get voronoi volumes
	vol = voronoi_volumes(x)

	# marker sizes
	sizes = (1.0/vol) 
	sizes = (sizes-min(sizes))/(max(sizes)-min(sizes)) # normalise

	if nonlinear: # apply nonlinear scaling
		nonlin_factor = 0.99
		lin_factor = 1-nonlin_factor
		sizes = (nonlin_factor*sizes + lin_factor)*sizes

	sizes = sizes*max_s + min_s

	plt.scatter(x[:,1],-x[:,0],c='k',s=sizes)
	plt.show()
