#!/usr/bin/env python

import os

# A dict with keys being the old filenames and values being the new filenames
mapping = {}

# Read through the mapping file line-by-line and populate 'mapping'
with open('mapping.txt') as mapping_file:
    for line in mapping_file:
        # Split the line along whitespace
        # Note: this fails if your filenames have whitespace
        new_name, old_name = line.split()
        mapping[old_name] = new_name

prefix = 'Piano.ff.'

# List the files in the current directory
for filename in os.listdir('.'):
    root, extension = os.path.splitext(filename)
    if root.startswith(prefix):
    # Strip off the number of characters that make up suffix
        stripped_root = root[len(prefix):]
        if stripped_root in mapping:
            os.rename(filename, ''.join(prefix + mapping[stripped_root] + extension)) 
