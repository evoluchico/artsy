import imageio
import glob

outfolder = 'out_images/'

# Get all the image file names in sorted order
filenames = sorted(glob.glob(f"{outfolder}shuffled_image_*.jpg"))

# Initialize variables
fps = 12  # Frames per second, change as needed

# Create the MP4 video
with imageio.get_writer(f"{outfolder}shuffled_video.mp4", fps=fps) as writer:
    for filename in filenames:
        img = imageio.imread(filename)
        writer.append_data(img)

# Create the GIF
with imageio.get_writer(f"{outfolder}shuffled_video.gif", mode='I', fps=fps) as writer:
    for filename in filenames:
        img = imageio.imread(filename)
        writer.append_data(img)

print("MP4 and GIF creation complete!")
