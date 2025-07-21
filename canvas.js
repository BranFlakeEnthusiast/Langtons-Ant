const canvas = document.getElementById("antCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

let cellsize = 6;
let rows = Math.ceil(canvas.height / cellsize)
let cols = Math.ceil(canvas.width / cellsize)
let grid = Array.from({ length: rows }, () => Array(cols).fill(0));

let translateX = 0
let translateY = 0
let scale = 1
let isDragging = false;
let lastX, lastY;

let running = true
const pause = document.getElementById('pausebtn');
const restart = document.getElementById('restartbtn');
const rulesToggle = document.getElementById('rulesToggle');
const rulesBox = document.getElementById('rulesBox')
const startDir = document.getElementById('directionSelect');

const maxbtn = document.getElementById('maxbtn');
const minbtn = document.getElementById('minbtn');
const header = document.querySelector('.header');
const content = document.querySelector('.content');
const rulesEditor = document.querySelector('.rulesEditor')

let steps = 60;
let lastTime = 0;
let accumulator = 0;
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

let rawmin = 10;
let rawmax = 50000;
let logmin = Math.log(rawmin);
let logmax = Math.log(rawmax);
let sliderScale = (logmax - logmin)/(rawmax - rawmin)

let antx = Math.floor(cols/2);
let anty = Math.floor(rows/2);
let direction = 0;
let state = 0

const colours = ['black','white','magenta','yellow','lime','cyan','red','orange','blue','hotpink','orchid','blueviolet'];
let rules = [
    [
        ['R', 1, 0],
        ['L', 0, 0]
    ]
]


rulesToggle.addEventListener('click', () =>{
    if (rulesToggle.checked === true){
        rulesEditor.classList.remove('hidden');
    } else {
        rulesEditor.classList.add('hidden');
    }
});

pause.addEventListener('click', () => {
    running = !running
    pause.innerHTML = running === true ? "⏸":"▶";
});

restart.addEventListener('click', () => {
    rules = JSON.parse(rulesBox.value);
    cellsize = parseInt(document.getElementById('cellSize').value);
    rows = Math.ceil(canvas.height / cellsize);
    cols = Math.ceil(canvas.width / cellsize);
    grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    antx = Math.floor(cols / 2);
    anty = Math.floor(rows / 2);
    direction = parseInt(startDir.value);
    running = true;
    pause.innerHTML = running === true ? "⏸":"▶";
});

maxbtn.addEventListener('click', () => {
    maxbtn.classList.add('hidden');
    header.classList.remove('hidden');
    content.classList.remove('hidden');
});

minbtn.addEventListener('click', () => {
    maxbtn.classList.remove('hidden');
    header.classList.add('hidden');
    content.classList.add('hidden');
});

function stepAnt(){
    const currentColor = grid[anty][antx];
    const turn = rules[state][currentColor][0];

    switch(turn) {
        case 'R':
            direction = (direction + 1) % 4; break;
        case 'L':
            direction = (direction + 3) % 4; break;
        case 'U':
            direction = (direction + 2) % 4; break;
        case 'N': break;
        case '^':
            direction = 0; break;
        case '>':
            direction = 1; break;
        case '⌄':
            direction = 2; break;
        case '<':
            direction = 3; break;
    }

    grid[anty][antx] = rules[state][currentColor][1];

    state = rules [state][currentColor][2];

    switch (direction) {
        case 0: anty--; break;
        case 1: antx++; break;
        case 2: anty++; break;
        case 3: antx--; break;
    }

    antx = (antx + cols) % cols;
    anty = (anty + rows) % rows;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let y=0; y < rows; y++) {
        for(let x=0; x < cols; x++) {
            ctx.fillStyle = colours[grid[y][x]];
            ctx.fillRect(x * cellsize, y * cellsize, cellsize, cellsize);
        }
    }
    ctx.fillStyle = 'red';
    ctx.fillRect(antx * cellsize, anty * cellsize, cellsize, cellsize);
}

speedSlider.addEventListener('input', () => {
    rawSteps = parseInt(speedSlider.value);
    logSteps = logmin + sliderScale*(rawSteps-rawmin);
    steps = 1000/Math.floor(Math.exp(logSteps));
});

function update(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  if (running) {
    accumulator += delta;

    while (accumulator >= steps) {
      stepAnt();
      accumulator -= steps;
    }

    draw();
  }

  requestAnimationFrame(update);
}

function updateTransform() {
  canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        translateX += dx;
        translateY += dy;
        lastX = e.clientX
        lastY = e.clientY
        updateTransform();
    }
});

window.addEventListener('mouseup', () => isDragging = false);

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.001;
    const zoom = 1 - e.deltaY * zoomIntensity;
    scale *= zoom;
    updateTransform();
}, {passive: false});

draw();
requestAnimationFrame(update);
