#!/bin/bash
#

for f in *Ab*.mp3
do
    a="$(echo $f | sed s/G/6/)";  mv "$f" "$a"
done
