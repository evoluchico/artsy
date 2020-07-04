# sierpinski-chords

The [Sierpiński triangle](https://en.wikipedia.org/wiki/Sierpi%C5%84ski_triangle) is a fractal. Here's how to make it:
1. Start with an equilateral triangle.
2. Subdivide it into four smaller equilateral triangles and remove the central triangle.
3. Repeat step 2 with each of the remaining smaller triangles, infinitely.

This script makes an interactive Sierpiński triangle, by pairing it with chords on a piano. Each colour represents a note, and every triangle represents a major triad (I-III-V, as in C-E-G), as shown below. You can open and close multiple triangles using the mouse. Every triangle, once opened into three, replaces a note by its major chord one octave above. So **C2** becomes **C3-E3-G3**. You can then play those notes using the space bar, and shift all notes on the scale using the keyboard.

The initial code was taken from (roadtolarissa.com)[https://roadtolarissa.com/zoomable-sierpinski-triangle-with-d3-js/], and audio samples were downloaded from (theremin.music.uiowa.edu)[theremin.music.uiowa.edu].


## Triangles and chords:

- - - -
<p align="center">
<img src="images/screenshot_C2.png" alt="Triangle corresponding to the C2 note" width="50%"/>
</p>
**<p align="center">Initial triangle, corresponding to the C2 note.**

<p align="center">
<img src="images/screenshot_C3_E3_G3.png" alt="Triangle corresponding to C3-E3-G3" width="50%"/>
</p>
**<p align="center">First chord, found by opening the first note: C3-E3-G3**

<p align="center">
<img src="images/screenshot_E3_G3_D4_G4_B4.png" alt="Triangle corresponding to E3-G3-D4-G4-B4" width="50%"/>
</p>
**<p align="center">Opening the triangle corresponding to C3, the resulting chord is E3-G3-D4-G4-B4**

<p align="center">
<img src="images/screenshot_many_notes_C.png" alt="Triangle corresponding to a chord with many notes in the key of C" width="50%"/>
</p>
**<p align="center">Another chord with many notes, based on C**

<p align="center">
<img src="images/screenshot_many_notes_c_sharp.png" alt="Triangle corresponding to a chord with many notes in the key of C sharp" width="50%"/>
</p>
**<p align="center">The same chord as above, but transposed to C#**

<p align="center">
<img src="images/screenshot_many_notes_A.png" alt="Triangle corresponding to a chord with many notes in the key of A" width="50%"/>
</p>
**<p align="center">The same chord as above, but transposed to A**


- - - -

