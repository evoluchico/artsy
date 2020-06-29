function setup() {
  // create canvas
  createCanvas(windowWidth, windowHeight);
  fill(242, 230, 213);
  textFont("sans",30);
  frameRate(30);

  // create sliders
  p1Slider = createSlider(0, 100, 50);
  p1Slider.position(100, 40);
  p2Slider = createSlider(0, 100, 50);
  p2Slider.position(100, 100);
  p3Slider = createSlider(0, 100, 50);
  p3Slider.position(100, 160);
  p4Slider = createSlider(0, 100, 50);
  p4Slider.position(400, 40);
  p5Slider = createSlider(0, 100, 50);
  p5Slider.position(400, 100);
  p6Slider = createSlider(0, 100, 50);
  p6Slider.position(400, 160);
  p7Slider = createSlider(0, 100, 50);
  p7Slider.position(700, 40);

  setup_hypercube(4);
}
var p1Slider, p2Slider, p3Slider, p4Slider, p5Slider, p6Slider, p7Slider;


function make_axes(x1,y1,x2,y2){
	// Axes
	push();
	stroke(242, 230, 213)
	line(x1+50,y1+50,x1+50,y2-50);
	line(x1+50,y2-50,x2,y2-50);

	line(x2,y1+50,x2,y2-50);
	line(x1+50,y1+50,x2,y1+50);
	pop();
}

function draw_sphere(x1,y1,x2,y2)
{
  	var r = p1Slider.value();
	text("radius", 245, 55);

	translate(x1+(x2-x1)/2, y1+(y2-y1)/2);
	ellipse(0,0,r,r);
}

function draw_square(x1,y1,x2,y2)
{
  var x = p1Slider.value();	
  var y = p2Slider.value();
  text("x", 245, 55); 
  text("y", 245, 115);

  translate((x2+x1)/5, (y2-y1)/2);
  var L = 200;
  rect(x,y,L,L)

}

// 3D rotation matrices

function Rx_3D(theta)
{
	return math.matrix([[1,0,0],
						[0,math.cos(theta),-math.sin(theta)],
						[0,math.sin(theta),math.cos(theta)]]);
}

function Ry_3D(theta)
{
	return math.matrix([[math.cos(theta),0,math.sin(theta)],
						[0,1,0],
						[-math.sin(theta),0,math.cos(theta)]]);
}

function Rz_3D(theta)
{
	return math.matrix([[math.cos(theta),-math.sin(theta),0],
						[math.sin(theta),math.cos(theta),0],
						[0,0,1]]);
}

// 2D rotation matrix, the building block of any rotation
function rot_matrix(d,d1,d2,theta)
{
	m = math.eye(d)
	m._data[d1][d1] = math.cos(theta)
	m._data[d1][d2] = -math.sin(theta)
	m._data[d2][d2] = math.cos(theta)
	m._data[d2][d1] = math.sin(theta)
	return m
}

var hypercube_edges = [];

function setup_hypercube(N)
{
  var twotoN = 2**N;
  var coords = make_cube_coordinates(N)

  // Identify edges
  var edges_count = 0;
  for(i=0; i<twotoN; i++)
  	for(j=(i+1); j<twotoN; j++)
    {
    	shared_coords = 0;
  		for(k=0; k<N; k++)
  		{
  			if(coords[i][k]==coords[j][k])
  				shared_coords++;
  		}

  		if(shared_coords == (N-1))
  		{
  			hypercube_edges[edges_count] = [i,j]
  			edges_count++;
  		}
    }

}

// this function is if we want to draw a (3D) cube, not a hypercube
function draw_cube_shadow(x1,y1,x2,y2,draw_cube_parts)
{
  var theta_x = p1Slider.value()*2*PI/100.0;	
  var theta_y = p2Slider.value()*2*PI/100.0;
  var theta_z = p3Slider.value()*2*PI/100.0;
  var z       = 5*(50-p4Slider.value());
  var L       = 100+2*(p4Slider.value())
  //var L       = 200;
  text("theta_x", 245, 55); 
  text("theta_y", 245, 115);
  text("theta_z", 245, 175);
  text("z",       545, 55); 
  
  translate((x2+x1)/5, (y2-y1)/2);
  x = 400;
  y = 200;
  translate(x,y);
  

  //var coordinates = [ [-0.5,-0.5,-0.5], [-0.5,-0.5,0.5], [-0.5,0.5,-0.5], [-0.5,0.5,0.5],
  //					   [0.5,-0.5,-0.5], [0.5,-0.5,0.5], [0.5,0.5,-0.5], [0.5,0.5,0.5] ];
  var coordinates = make_cube_coordinates(3)

  var R = math.multiply(math.multiply(Rz_3D(theta_z),Ry_3D(theta_y)),Rx_3D(theta_x));

  var projected_coords = [];
  for(i=0; i<8; i++)
  {
   	projected_coords[i] = math.multiply(R,coordinates[i]);
  }
  var radius = 20;

  // draw vertices
  for(i=0; i<8; i++)
  {
  	xi = L*projected_coords[i]._data[0]
  	yi = L*projected_coords[i]._data[1]
	zi = L*projected_coords[i]._data[2] + z
	push()
	if(zi>0)
		fill(242,0,0,100)
	if(draw_cube_parts)
  		ellipse(xi,yi,radius,radius);
  	pop()
  }

  // draw edges
  push();
  stroke(242, 230, 213);
  strokeWeight(5);

  vertices_z0 = []
  for(i=0; i<hypercube_edges.length; i++)
  {
  	i1 = hypercube_edges[i][0]
  	i2 = hypercube_edges[i][1]
  	i3 = hypercube_edges[i][2]

  	x1 = L*projected_coords[i1]._data[0]
  	x2 = L*projected_coords[i2]._data[0]
  	y1 = L*projected_coords[i1]._data[1]
  	y2 = L*projected_coords[i2]._data[1]
  	z1 = L*projected_coords[i1]._data[2] + z
  	z2 = L*projected_coords[i2]._data[2] + z

  	if(z1*z2<0)
  	{
  		s = (z2)/(z2-z1)
  		xver = s*x1 + (1-s)*x2
  		yver = s*y1 + (1-s)*y2
  		vertices_z0[vertices_z0.length] = [xver, yver]
  	}
  	if(draw_cube_parts)
  		line(x1,y1,x2,y2);
  }

  // Draw intersection
  draw_2D_intersection(vertices_z0)
}

function make_cube_coordinates(dimension)
{
	var twotoD = 2**dimension;
	var coordinates = []
	for(i=0; i<twotoD; i++)
	{
		coord = []
		n = i + twotoD
		for(j=0; j<dimension; j++)
		{
			coord[j] = (n%2)-0.5
			n = (n-n%2)/2
		}
		coordinates[i] = coord
	}
	return coordinates
}

function make_cube_faces(dimension, L)
{
	D = dimension // total dimension of the hypercube
	d = 2
	var twotoDmd = 2**(D-d);
	var twotod   = 2**d


	// since d=2 for 2D faces (squares),
        // every face is identified by two indices.
	// hence two nested loops.
	count = 0
	var face_indices = []
	for(i=0; i<dimension; i++)
		for(j=(i+1); j<dimension; j++)
		{
			face_indices[count] = [i,j];
			count++;
		}

	var faces = []
	count_faces = 0
	face_indices.forEach(indices => {
		for(i=0; i<twotod; i++)
		{
			other_indices = []
			count = 0
			for(j=0; j<D; j++)
				if((j!=indices[0])&(j!=indices[1]))
				{
					other_indices[count] = j;
					count++;
				}

			face = []
			for(j=0; j<twotoDmd; j++)
			{
				coords = math.zeros(D)
				coords._data[indices[0]] =  ( (i%2)-0.5 ) * L
				coords._data[indices[1]] = ( (i-(i%2))/2 - 0.5) * L 
				n = j + twotoDmd
				for(k=0; k<other_indices.length; k++)
				{
					coords._data[other_indices[k]] = ( (n%2)-0.5 ) * L
					n = (n-n%2)/2
				}
				face[j] = coords
				//console.log(coords)
			}
			faces[count_faces] = face
			count_faces++;
		}
	 });

	return faces
}

function paint_hypercube_faces(dimension, R, L, c)
{
	var faces = make_cube_faces(dimension,L);

	faces.forEach(face => {
		projected_coords = []
		for(i=0; i<face.length; i++)
			projected_coords[i] = math.multiply(R,face[i])._data;

		draw_2D_intersection(projected_coords, c)
	});

}

function draw_2D_intersection(vertices_z0, c)
{
	points = []
	for(i=0; i<vertices_z0.length; i++)
		points[points.length] = {x:vertices_z0[i][0], y:vertices_z0[i][1]}

	// centroids
	cx = 0
	cy = 0
	for(i=0; i<points.length; i++)
	{
		cx += points[i].x
		cy += points[i].y
	}
	cx /= points.length
	cy /= points.length
	var center = {x:cx, y:cy}

	// Starting angle used to reference other angles
	var startAng;
	points.forEach(point => {
	    var ang = math.atan2(point.y - center.y,point.x - center.x);
	    if(!startAng){ startAng = ang }
	    else {
	         if(ang < startAng){ 
                 // ensure that all points are clockwise of the start point
	             ang += Math.PI * 2;
	         }
	    }
	    point.angle = ang; // add the angle to the point
	 });
	 // Sort clockwise;
	points.sort((a,b)=> a.angle - b.angle);
	//console.log(points)

	// draw
	push()
	noStroke()
	fill(c)
	beginShape()
	points.forEach(point => {
		vertex(point.x,point.y)
	});
	endShape(CLOSE)

	pop()
}

function draw_hypercube_shadow(x1,y1,x2,y2,draw_cube_parts)
{
  dimension = 4;
  n = dimension;
  var twotoD = 2**dimension;

  var colors_tab20c = [[49, 130, 189], [107, 174, 214], [158, 202, 225], [198, 219, 239], [230, 85, 13], [253, 141, 60], [253, 174, 107], [253, 208, 162], [49, 163, 84], [116, 196, 118], [161, 217, 155], [199, 233, 192], [117, 107, 177], [158, 154, 200], [188, 189, 220], [218, 218, 235]];
  var colors_Set20  = [[102, 194, 165], [252, 141, 98], [141, 160, 203], [231, 138, 195]]

  var nodes_palette = []
  for(i=0; i<twotoD; i++)
  {
    idx = i % 4;
    nodes_palette[i] = colors_Set20[idx];
  }


  var sliders = [p1Slider, p2Slider, p3Slider, p4Slider, p5Slider, p6Slider, p7Slider];
  thetas = []
  for(i=0; i<(n*(n-1)/2); i++)
  {
  	thetas[i] = sliders[i].value()*2*PI/100.0
  }

  var z       = 5*(50-p7Slider.value());  // Z-coordinate of the cube
  var L       = 100+2*(p7Slider.value())  // cube size, which depends on its Z
 
  text("XY [W/S]", 245, 55); 
  text("XZ [A/D]", 245, 115);
  text("XW [Q/E]", 245, 175);
  text("YZ [I/K]", 545, 55);
  text("YW [J/L]", 545, 115); 
  text("ZW [U/O]", 545, 175); 
  text("Z  [R/F]", 845, 55); 
  
  translate((x2+x1)/5, (y2-y1)/2);
  x = 400;
  y = 200;
  translate(x,y);
  
  var coordinates = make_cube_coordinates(dimension);

  // make the rotation matrix a multiplication of rotation matrices in each plane:
  // XY, XZ, ZW, etc

  rot_matrices = []
  k = 0
  for(i=0; i<dimension; i++)
  	for(j=(i+1); j<dimension; j++)
  	{
  		rot_matrices[k] = rot_matrix(dimension,i,j,thetas[k]);
  		k++;
  	}
   var R = rot_matrices[0];
   for(i=1; i<rot_matrices.length; i++)
   	 R = math.multiply(rot_matrices[i],R);

  // Finished rotating matrices. Now project them

  var projected_coords = [];
  for(i=0; i<twotoD; i++)
  {
   	projected_coords[i] = math.multiply(R,coordinates[i]);
  }
  var radius = 25;

  // draw vertices
  for(i=0; i<twotoD; i++)
  {
  	xi = L*projected_coords[i]._data[0]
  	yi = L*projected_coords[i]._data[1]
	zi = L*projected_coords[i]._data[2] + z

	push()

	//if(zi>0) fill(242,0,0,100)
	fill(nodes_palette[i],100)

	if(draw_cube_parts)
  		ellipse(xi,yi,radius,radius);
  	pop()
  }

  // draw edges
  push();
  stroke(242, 230, 213);
  strokeWeight(5);

  vertices_z0 = []
  for(i=0; i<hypercube_edges.length; i++)
  {
  	i1 = hypercube_edges[i][0]
  	i2 = hypercube_edges[i][1]
  	i3 = hypercube_edges[i][2]

  	x1 = L*projected_coords[i1]._data[0]
  	x2 = L*projected_coords[i2]._data[0]
  	y1 = L*projected_coords[i1]._data[1]
  	y2 = L*projected_coords[i2]._data[1]
  	z1 = L*projected_coords[i1]._data[2] + z
  	z2 = L*projected_coords[i2]._data[2] + z

  	if(z1*z2<0)
  	{
  		s = (z2)/(z2-z1)
  		xver = s*x1 + (1-s)*x2
  		yver = s*y1 + (1-s)*y2
  		vertices_z0[vertices_z0.length] = [xver, yver]
  	}

  	if(draw_cube_parts)
  		line(x1,y1,x2,y2);
  }
  pop();

  // paint faces
  c = color('rgba(0,142,142,0.1)')
  paint_hypercube_faces(dimension, R, L, c)

  // Draw intersection with Z=0
  //c = color('rgba(242,0,0,20)')
  //draw_2D_intersection(vertices_z0, c)
}


function draw() {

  var x1=50;
  var y1=205;
  var x2=width-100;
  var y2=height-100;

  background(100);

  noStroke();
  make_axes(x1,y1,x2,y2);
  
  // KEY PRESSES
  keycodes = ['s','w','d','a','e','q',
              'k','i','l','j','o','u',
              'r','f']
  pSliders = [p1Slider,p1Slider,p2Slider,p2Slider,p3Slider,p3Slider,
              p4Slider,p4Slider,p5Slider,p5Slider,p6Slider,p6Slider,
              p7Slider,p7Slider]
  increment = [1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1]

  for(i=0; i<14; i++)
  	if(key==keycodes[i])
  	{
  		newvalue = (100 + pSliders[i].value() + increment[i])%100;
  		pSliders[i].value(newvalue)
  	}

  draw_cube_lines = true;
  draw_hypercube_shadow(x1,y1,x2,y2,draw_cube_lines);
}

// more in:
//https://en.wikipedia.org/wiki/Spherinder
//https://imgur.com/gallery/ORY5G
//http://hi.gher.space/wiki/Spherinder
//http://hi.gher.space/wiki/Dicone
//https://imgur.com/gallery/vv7fG
//https://imgur.com/t/hypershape
