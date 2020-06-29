/**** DEFINING A RANDOM NUMBER GENERATOR ****/

var m_w = 123456789;
var m_z = 987654321;
var mask = 0xffffffff;

// Takes any integer
function seed(i) {
    m_w = i;
    m_z = 987654321;
}

// Returns number between 0 (inclusive) and 1.0 (exclusive),
// just like Math.random().
function my_random()
{
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    var result = ((m_z << 16) + m_w) & mask;
    result /= 4294967296;
    return result + 0.5;
}

function randint(n)
{
    return Math.floor(my_random() * n)
}

/***************/


function setup()
{
    // PARAMETERS
    base_radius = 100;

    n_points = 100;
    stepsize = 4;
    palette = Math.floor(100*random()) % 4

    path_length = 100;

    // create canvas
    createCanvas(windowWidth-20, windowHeight-20);
    frameRate(5)
    
    //draw_random_circles();
    //draw_random_path();
    //draw_random_lines();

    //seed(17);
    seed(random());
}

function get_random_pixel()
{
    x = randint(windowWidth-20)
    y = randint(windowHeight-20)
    pair = [x,y]
    return pair
}

function random_step()
{
    return 7.0*(-2 + randint(5))
}

function random_radius(r)
{
    s = 0.75
    ratio = s + 2*(1-s)*my_random()
    return r*ratio
}

function random_colour(p)
{
    colours = [["#f95480","#894c70","#438f6e","#90a259","#fa9c6f"],
                ["#d8e2dc","#ffe5d9","#ffcad4","#f4acb7","#9d8189"],
                ["#fb3640","#605f5e","#1d3461","#1f487e","#247ba0"],
                ["#011936","#465362","#82a3a1","#9fc490","#c0dfa1"]];

    cols = colours[p];
    return cols[randint(5)]
}

function draw_random_circles()
{
    noStroke();
    for( i=0; i<n_points; i++ )
    {
        pair = get_random_pixel()
        x = pair[0]
        y = pair[1]

        colour = random_colour(palette)
        radius = random_radius(base_radius)
        //pixel = img.get(x,y)

        fill(colour);
        rect(x,y,radius,radius);
        //circle(x,y,radius)
    
    }
}

function draw_random_path()
{

    noStroke();
    for( i=0; i<n_points; i++ )
    {
        pair = get_random_pixel()
        x = pair[0]
        y = pair[1]

        for( j=0; j<path_length; j++)
        {
            x = x + random_step()
            y = y + random_step()

            colour = random_colour(palette)
            radius = random_radius(base_radius)

            fill(colour);
            rect(x,y,radius,radius);
        }
    
    }
}


function draw_random_lines()
{
    noStroke();
    for( i=0; i<n_points; i++ )
    {
        pair = get_random_pixel()
        x = pair[0]
        y = pair[1]

        //dx = 10-randint(2*10)
        //dy = 10-randint(2*10)
        dx = stepsize-randint(2*stepsize)
        dy = stepsize-randint(2*stepsize)

        while( 1>0 )
        {
            x = x + dx
            y = y + dy

            if ((x > windowWidth-20) | (y>windowHeight-20) | (x<0) | (y<0) )
            {
                break
            }
            else
            {
                colour = random_colour(palette)
                radius = random_radius(base_radius)

                fill(colour);
                ellipse(x,y,radius,radius)
            }
        }
    
    }
}


function draw_one_line()
{    
    noStroke();
    pair = get_random_pixel()
    x = pair[0]
    y = pair[1]

    dx = stepsize-randint(2*stepsize)
    dy = stepsize-randint(2*stepsize)

    // one (random) palette per line
    palette = randint(4);

    while( true )
    {
        dx = dx + 2*(0.5-random())
        dy = dy + 2*(0.5-random())

        x = x + dx
        y = y + dy

        if ((x > windowWidth-20) | (y>windowHeight-20) | (x<0) | (y<0) )
        {
            break
        }
        else
        {
            // change palette
            //palette = randint(4);
            colour = random_colour(palette)
            radius = random_radius(base_radius)

            fill(colour);
            ellipse(x,y,radius,radius)
        }
    }


}



function draw()
{
    draw_one_line();    
}
