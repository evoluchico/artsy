/**** DEFINING A RANDOM NUMBER GENERATOR ****/

var m_w = 123456789;
var m_z = 987654321;
var mask = 0xffffffff;

max_n_pendulums = 20;
coords_new_pendulum = false;
pendulums = [];
omegas = [];
phis  = [];
random_omegas = true;

var time, x0, amplitude;
var button1, button2, button3;

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

function preload()
{
    soundFormats('wav');
    bongos = []
    min_bongo_speed = 0.5;
    max_bongo_speed = 3;
    for(i=1; i<=max_n_pendulums; i++)
    {
        bongos[i] = loadSound('files/bongo1.wav');
        bongo_speed = map(i, 1, max_n_pendulums, min_bongo_speed, max_bongo_speed)
        bongos[i].rate(bongo_speed);
    }

}

function setup()
{
    // PARAMETERS
    time = 0
    base_radius = 40;
    bar_start   = { x:70, y:10 }  
    bar_length  = 300;
    bar_separation = 60;

    n_pendulums = 12;
    sound_duration = 10;

    // let user start and stop audio
    button1 = createButton('Start');
    button1.size(60,40);
    button1.style('font-size', '20px');
    button1.position(19, 19);
    button1.mousePressed(start_movement);

    button2 = createButton('Stop');
    button2.size(60,40);
    button2.style('font-size', '20px');
    button2.position(89, 19);
    button2.mousePressed(stop_movement);

    button3 = createButton('Random speed');
    button3.size(160,40);
    button3.style('font-size', '20px');
    button3.position(159, 19);
    button3.mousePressed(set_omegas);

    push();
    translate(0,20);

    // Initial condition
    decay = [];
    moving = false;
    x0 = bar_start.x + (0.5*bar_length);
    amplitude = (0.5*bar_length);
    for(i=1; i<=n_pendulums; i++)
    {
        pendulums[i] = {x: x0-amplitude, y:(bar_start.y + bar_separation*i)}
        decay[i] = 0;
    }

    // set pendulum speeds
    base_omega = 0.05;
    ratio = 0.75;
    increment = PI/100;
    omegas[0] = base_omega;
    set_omegas();
    for(i=1; i<=n_pendulums; i++)
    {
        phis[i] = 0;
    }        
    pop();

    // create canvas
    createCanvas(windowWidth-20, windowHeight-20);
    frameRate(10)
    
    //seed(17);
    seed(random());
}

function set_omegas()
{
    if( random_omegas )
    {
        for(idx=1; idx<=n_pendulums; idx++)
        {
            omegas[idx] = base_omega*ratio*idx;

            // adjust movement
            x = pendulums[idx].x
            omega = omegas[idx];
            phi = omega*time - acos((x0-x)/amplitude)
            phis[idx] = phi
        }        
        random_omegas = false
        button3.style("background-color","#fff");
    }
    else
    {
        for(idx=1; idx<=n_pendulums; idx++)
        {
            omegas[idx] = 4*base_omega + my_random()/200;

            // adjust movement
            x = pendulums[idx].x
            omega = omegas[idx];
            phi = omega*time - acos((x0-x)/amplitude)
            phis[idx] = phi            
        }
        random_omegas = true
        button3.style("background-color","#aaa");
    }
}

function start_movement(){
    moving = true;
    userStartAudio();
}

function stop_movement(){
    moving = false;
}

function draw_one_pendulum(idx)
{
    xline = bar_start.x
    yline = pendulums[idx].y

    stroke(100)
    strokeWeight(2)
    line(xline,yline,xline+bar_length,yline);

    noStroke()
    if( hits_the_wall(j) )
    {
        fill("#DB7093")
    }    
    else
    {
        fill(255)
    }
    radius  = base_radius
    ycircle = yline
    xcircle = pendulums[idx].x
    ellipse(xcircle,ycircle,radius,radius)
}

function hits_the_wall(j)
{
    gap = 1 // in pixels

    omega = omegas[j]
    if( (abs(pendulums[j].x - bar_start.x) < gap) || (abs(pendulums[j].x - (bar_start.x + bar_length)) < gap) )
    {
        return true;
    }
    else
    {
        return false;
    }
}

function move_all_pendulums()
{
    time += 1;
    for(j=1; j<=n_pendulums; j++)
    {
        omega = omegas[j];
        phi   = phis[j];
        pendulums[j].x = x0 - amplitude*cos(omega*time - phi)

        if( hits_the_wall(j) && (decay[j]==0) )
        {
            //console.log("Playing",j)
            bongos[j].play();
            decay[j] = sound_duration;
        }
        if( decay[j] > 0 )
        {
            decay[j] -= 1;
        }
    }
}


function trackMouse()
{
    coords_new_pendulum = false;
    xgap = base_radius // in pixels;
    if( mouseX > (bar_start.x-xgap) && mouseX < (bar_start.x+bar_length+xgap) ){
        if( mouseY > 30+bar_start.y && mouseY < (20 + bar_start.y + (1+n_pendulums)*bar_separation) ){
            fill(0,255,255,100)
            radius  = base_radius
            xcircle = constrain(mouseX, bar_start.x, bar_start.x+bar_length)

            // find closest pendulum for ycircle
            gap = 5000;
            idx = 1;
            for(i=1; i<=(n_pendulums); i++)
            {
                newgap = abs(mouseY - (bar_start.y + i*bar_separation))
                if(newgap < gap)
                {
                    gap = newgap;
                    ycircle = bar_start.y + i*bar_separation 
                    idx = i;
                }
            }
            ellipse(xcircle, ycircle, radius, radius)
            coords_new_pendulum = {idx:idx, x:xcircle}
        }
    }
    return coords_new_pendulum;
}

function mousePressed() {
    if(coords_new_pendulum != false)
    {
        idx = coords_new_pendulum.idx
        x   = coords_new_pendulum.x

        pendulums[idx].x = x

        omega = omegas[idx];
        phi = omega*time - acos((x0-x)/amplitude)
        phis[idx] = phi
    }
}

function draw_all_pendulums()
{
    for(j=1; j<=n_pendulums; j++)
    {
        draw_one_pendulum(j)
    }
}

function draw_lines()
{
    colours = ["#FB3640","#FA8072","#F9A602"]
    strokeWeight(4)

    for(i=0;i<3;i++)
    {
        stroke(colours[i]);
        gap = i+1;
        for(j=1; j<=n_pendulums-gap; j++)
        {
            line(pendulums[j].x, pendulums[j].y, pendulums[j+gap].x, pendulums[j+gap].y)
        }
    }
}

function draw()
{
    background(50);
    
    if(moving)
    {
        move_all_pendulums();
    }
    push();
        translate(0,20);
        coords_new_pendulum = trackMouse();
        draw_lines();
        draw_all_pendulums();
    pop();
}
