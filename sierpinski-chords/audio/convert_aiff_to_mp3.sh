#!/bin/bash
#

for f in *.aiff
do
    a="$(echo $f | sed s/aiff/mp3/)"
    avconv -i "$f" -f mp3 -acodec libmp3lame -ab 192000 -ar 44100 "$a"
done
