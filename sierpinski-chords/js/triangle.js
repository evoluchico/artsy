var width  = document.getElementById('chart').offsetWidth - 30;
var height = (window.innerHeight || html.clientHeight || body.clientHeight || screen.availHeight) - document.getElementById('footer').offsetHeight - 100;
var height_triangle =  Math.min(height, width);
var sin30 = Math.pow(3,1/2)/2;
var cos30 = .5;
var side_triangle = height_triangle*2/Math.pow(3,1/2)    //triangle side length

var keyboard_visible = false;

var basenote = 0; // 0 for C
var n_notes = 7;
var n_semitones = 12;
var semitones  = [ 0, 2, 4, 5, 7, 9, 11, 12 ];
var note_names = [ 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb','G', 'Ab', 'A', 'Bb', 'B'];  

var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

var piano_path   = "audio/theremin.music.uiowa.edu/Piano.ff.";
var piano_format = ".mp3";

var mouse = {x: 0, y: 0};


/********************************************/
/*        Background functions              */
/********************************************/

//adds svg & g elements to page so zooming will work
var svg = d3.select("#chart")
.append("svg:svg")
.attr("width", width)
.attr("height", height)
.attr("pointer-events", "all")
.append('svg:g')
//.call(d3.behavior.zoom().on("zoom", redraw))
//.append('svg:g');

svg.append('svg:rect')
.attr('width', width)
.attr('height', height)
.attr('fill', 'white');


/********************************************/
/*              Note functions              */
/********************************************/

function correct(i)
{
    var ii = (basenote + semitones[i])%n_semitones;
    //console.log(i,'->',ii);
    return ii;
}

function play_note(i,j)
{
    var audioElement1 = document.createElement('audio');
    var note   = note_names[correct(i)];
    var octave = (j+1).toString();
    var pitch = piano_path.concat(note,octave,piano_format);
    //console.log('playing',pitch);

    var snd1  = new Audio();
    var src1  = document.createElement("source");
    src1.type = "audio/mpeg";
    src1.src  = pitch;
    snd1.appendChild(src1);
    snd1.play();
}

function close_notes(level,node)
{
    if(level<8 && notes_tree.getNode(level,node)!=0)
    {
        close_notes( level+1, 3*(node+1)-3 );
        close_notes( level+1, 3*(node+1)-2 );
        close_notes( level+1, 3*(node+1)-1 );
    }
    notes_tree.setNode(0,level,node);	
    centroidX_tree.setNode(0,level,node);	
    centroidY_tree.setNode(0,level,node);	
}

function play_notes_tree()
{
    var i, j, value, note, octave;
    var note_octave_list = []

    for(i=0; i<7; i++)
        for(j=0; j<Math.pow(3,i); j++)
        {
            value = notes_tree.getNode(i,j);
            if( value>0 )
            {
                note = value%n_notes;
                octave = (value - note)/n_notes;
                note_octave_list.push([note,octave])
            }
        }

    notes_counter = 0;
    function play_notes_list()
    {
        note   = note_octave_list[notes_counter][0];
        octave = note_octave_list[notes_counter][1];
        play_note(note,octave)
        notes_counter++;
    }

    for(i=0; i<note_octave_list.length; i++)
        setTimeout(function(){play_notes_list();}, i*100)
}

/********************************************/
/*             Color functions              */
/********************************************/

function recolor()
{
    svg.selectAll("polygon").each(function(d, i) {
            points = d3.select(this).attr("points");
            if(points[0] > 5){ d3.select(this).attr('fill', 'orange'); }
            });
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function byte2Hex(n)
{
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function ij2Color(i,j) // 'i' is the note, 'j' is its octave
{
    var h = ((30*(i-2))%360)*1.0/360 // hue
    var l = Math.min(0.35+j*0.07,1); // lightness
    var rgb = hslToRgb(h,1,l);
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
    //var basenote = 0;
    //return floodColor(basenote*30 + (360+h*360) % 360);
}

/********************************************/
/*              Tree functions              */
/********************************************/

function TernaryTree()
{ 
    this.Nodes = new Array();

    this.btSMF=function(level,node){
        return node+(Math.pow(3,level)-1)/2; }

    this.setNode=function(value,level,node){
        this.Nodes[this.btSMF(level,node)]=value; }

    this.getNode=function(level,node){
        return this.Nodes[this.btSMF(level,node)]; }
}


function init_tree(tree)
{
    var i, j;
    for(i=0; i<7; i++)
        for(j=0; j<Math.pow(3,i); j++)
            tree.setNode(0,i,j);
}


function fill_centroid(treeX,treeY,cx,cy,r,level,node)
{
    if(level==7) return;

    treeX.setNode(cx,level,node);
    treeY.setNode(cy,level,node);

    setTimeout(function() { fill_centroid( treeX, treeY, cx,             cy - r/2,       r/2, level+1, 3*(node+1)-3 ); },500);
    setTimeout(function() { fill_centroid( treeX, treeY, cx + r*sin30/2, cy + r*cos30/2, r/2, level+1, 3*(node+1)-2 ); },500);
    setTimeout(function() { fill_centroid( treeX, treeY, cx - r*sin30/2, cy + r*cos30/2, r/2, level+1, 3*(node+1)-1 ); },500);
}


/********************************************/
/*          Triangle functions              */
/********************************************/

function centroidx(points)
{
    return ( points[0].x + points[1].x + points[2].x )/3;
}

function centroidy(points)
{
    return ( points[0].y + points[1].y + points[2].y )/3;
}

// Repaints the tree with a palette starting on a different tone
function change_tone(newtone)
{
    console.log('Changing tone to',note_names[newtone]);

    ep = 0.01;
    basenote = newtone;

    svg.selectAll("polygon").each(function(d, i) {

    var i, j;
    var level, node;
    for(level=0; level<7; level++)
        for(node=0; node<Math.pow(3,level); node++)
        {
            nodevalue = notes_tree.getNode(level,node);
            if( nodevalue != 0 )
            {
                // nodevalue is j*n_notes + i
                i =  Math.abs(nodevalue)%n_notes;
                j = (Math.abs(nodevalue)-i)/n_notes;

                // refill the triangle with the new color
                    //points = d3.select(this).attr(points);
                    points = d3.select(this);
                    cx = centroidx(points[0][0].points);
                    cy = centroidy(points[0][0].points);
                    Cx = centroidX_tree.getNode(level,node);
                    Cy = centroidY_tree.getNode(level,node);
                    if( Math.abs(Cx-cx)<ep && Math.abs(Cy-cy)<ep )
                    { 
                        newcolour =  ij2Color( correct(i), j );
                        d3.select(this).attr('fill', newcolour); 
                        //console.log('recolouring ',nodevalue,i,j,' - ',correct(i),j)
                    }
            }
        }

    });
}

function unhighlight() {
    d3.selectAll("circle.dot").classed("highlighted", false);
}

function highlight(ids) {
    // First unhighlight all the polygons.
    unhighlight();

    // Find the polygons that have an id
    // in the array of ids given, and 
    // highlight those.
    d3.selectAll("polygon").filter(function(d, i)
                            { return ids.indexOf(d.id) > -1; })
    .classed("highlighted", true);
}


//triangle centered at (cx, cy) with circumradius r
function addTriangle(cx, cy, r, i, j, level, node, play){

    if(play) play_note(i,j);

    notes_tree.setNode(i+n_notes*j,level,node);
    centroidX_tree.setNode(cx,level,node);
    centroidY_tree.setNode(cy,level,node);

    svg.append('polygon')
        .on(mobile ? "click" : "click", function(d){
                notes_tree.setNode(-i-n_notes*j,level,node); // a negative value to a node means it has been closed
                //console.log("Clicked on",i,j,level,node)
                setTimeout(function() {addTriangle( cx,             cy - r/2, 	    r/2, (i+0)%n_notes, j+1, level+1, 3*(node+1)-3, true ); }, 100);
                setTimeout(function() {addTriangle( cx + r*sin30/2, cy + r*cos30/2, r/2, (i+2)%n_notes, j+1, level+1, 3*(node+1)-2, true ); }, 100);
                setTimeout(function() {addTriangle( cx - r*sin30/2, cy + r*cos30/2, r/2, (i+4)%n_notes, j+1, level+1, 3*(node+1)-1, true ); }, 100);

                d3.select(this).on('click', function(){
                    close_notes(level,node);
                    //console.log("Clicked on",i,j,level,node)
                    addTriangle(cx, cy, r, i, j, level, node, true);});
                })

    .attr('fill', 'white')
        .attr('points', (cx) +','+ (cy)	+' '+ (cx) +','+ (cy) +' '+ (cx) +','+(cy))
        .transition()
        .duration(500)
        .delay(0)
        .attr('fill', ij2Color( correct(i) ,j))

        .attr('points', (cx)	     +','+ (cy-r)	  +' '+ 
                (cx-r*sin30) +','+ (cy + r*cos30) +' '+
                (cx+r*sin30) +','+ (cy + r*cos30) )
        //console.log("Painting", level, node, "with color", i+basenote, j);
}

function show_keyboard()
{
    // Erase instruction
    $('.instructions')[0].innerHTML='';

    if(keyboard_visible)
    {
        x=document.getElementById("keyboard")
        x.style.visibility="hidden";
        keyboard_visible = false;
    }
    else
    {
        x=document.getElementById("keyboard")
        x.style.visibility="visible";
        keyboard_visible = true;
    }
}

// event = keyup or keydown
document.addEventListener('keyup', event => {
    switch (event.key)
    {
        case ' ': play_notes_tree(); break;
        case 'q': change_tone(0); break;
        case '2': change_tone(1); break;
        case 'w': change_tone(2); break;
        case '3': change_tone(3); break;
        case 'e': change_tone(4); break;
        case 'r': change_tone(5); break;
        case '5': change_tone(6); break;
        case 't': change_tone(7); break;
        case '6': change_tone(8); break;
        case 'y': change_tone(9); break;
        case '7': change_tone(10); break;
        case 'u': change_tone(11); break;
        case 'Shift': show_keyboard(); break;
        default: break;
    }
})


//add the first triangle

cx0 = width/2;
cy0 = height*2/3
r0  = side_triangle/2;
notes_tree  = new TernaryTree()
init_tree(notes_tree)

centroidX_tree = new TernaryTree()
centroidY_tree = new TernaryTree()
fill_centroid(centroidX_tree, centroidY_tree, cx0, cy0, r0, 0, 0)

addTriangle(cx0, cy0, r0, 0, 1, 0, 0, false)
change_tone(0);