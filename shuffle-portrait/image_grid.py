from PIL import Image
import random
from datetime import datetime

# Load the image
image_path = "2023-09-03-103712.jpg"

N = 5

#------------------------------------------------------#

def partial_shuffle(lst, percentage=25):
    # Calculate how many elements to shuffle
    num_to_shuffle = int(len(lst) * (percentage / 100))

    # Randomly choose the indices of the elements to shuffle
    indices_to_shuffle = random.sample(range(len(lst)), num_to_shuffle)

    # Extract those elements from the list
    elements_to_shuffle = [lst[i] for i in indices_to_shuffle]

    # Shuffle them
    random.shuffle(elements_to_shuffle)

    # Put them back into the list at their original positions
    new_list = lst
    for i, new_val in zip(indices_to_shuffle, elements_to_shuffle):
        new_list[i] = new_val

    return new_list


def randomly_remove_channels(image):
    # Split the image into its R, G, B channels
    r, g, b = image.split()

    # Create a "black" channel for replacing any removed channels
    k = Image.new("L", (sub_image.width, sub_image.height), 0)
   
    # Randomly remove some channels
    choice = random.choice([
        (r, k, k),
        (k, g, k),
        (k, k, b),
        (r, g, k),
        (r, k, b),
        (k, g, b),
        (r, g, b)
    ])
    # Merge the remaining channels back into an image
    return Image.merge("RGB", choice)

def point_mutation(image):
    r, g, b = image.split()
    choice = [ i.point(lambda x: x * random.random()) for i in (r,g,b) ]
    return Image.merge("RGB", choice)

# enhances one channel per sub-image
def enhance_one_channel(image):
	r, g, b = image.split()
	enhance = random.uniform(1.1,1.3)
	which_to_enhance = random.randint(0,2)
	choice  = [r,g,b]
	choice[which_to_enhance] = choice[which_to_enhance].point(lambda x: x*enhance)
	return Image.merge("RGB", choice)

# enhances two channels, on all sub-images
def global_shift(image):
	r, g, b = image.split()

	# Get a seed that changes by the second
	# this should usually stay the same during the running of this script
	random.seed(datetime.now().second)

	a1, a2 = 1.1, 1.3
	b1, b2 = 1.3, 1.5
	enhance = [ random.uniform(a1,a2), random.uniform(b1,b2), 1 ]
	random.shuffle(enhance)
	choice  = [ c.point(lambda x: x*e) for c,e in zip((r,g,b),enhance) ]

	return Image.merge("RGB", choice)


def random_filter(sub_image):

	# The fact that I'm using a random seed in the global_shift function
	# ends up making some of the random choices below less random.
	# That creates pleasing results though, so it's interesting to have it.
	# ...so let's turn that effect on and off, randomly.
	if random.choice([True, False]):
		random.seed(datetime.now().microsecond)

	filters = [randomly_remove_channels, point_mutation, enhance_one_channel, global_shift]
	f = random.choice(filters)
	return f(sub_image)


#-----------------------------------------#


original_image = Image.open(image_path)
# Image dimensions
width, height = original_image.size

# Sub-image dimensions
sub_width = width // N
sub_height = height // N

# Create a list to hold the 16 sub-images
sub_images = []

# Split the image into 16 sub-images (NxN grid)
for i in range(0, N):
    for j in range(0, N):
        left = j * sub_width
        upper = i * sub_height
        right = left + sub_width
        lower = upper + sub_height
        sub_image = original_image.crop((left, upper, right, lower))
        # Apply random filter to each sub-image
        filtered_sub_image = random_filter(sub_image)
        sub_images.append(filtered_sub_image)

# Maybe shuffle all sub-images
shuffle_method = random.choice(['none','a little','a lot'])

if shuffle_method == 'none':
	pass
elif shuffle_method == 'a little':
	sub_images = partial_shuffle(sub_images, percentage=25)
elif shuffle_method == 'a lot':
	random.shuffle(sub_images)


# Create a new empty image
shuffled_image = Image.new("RGB", (width, height))

# Place the shuffled sub-images back into the new image
for i in range(0, N):
    for j in range(0, N):
        left = j * sub_width
        upper = i * sub_height
        shuffled_image.paste(sub_images.pop(0), (left, upper))

# Save the new shuffled image
outfolder = 'out_images/'
ts = int(datetime.now().timestamp()) 
shuffled_image.save(f"{outfolder}shuffled_image_{ts}.jpg")
shuffled_image.show()
