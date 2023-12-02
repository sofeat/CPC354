var gl; // WebGL context
var points = []; // Declare points array at a global scope
var NumTimesToSubDivide = 5;


// Function to initialize WebGL
function initWebGL() {
    //Get Canvas Element
    var canvas = document.getElementById("game-surface");

     // Check if the canvas element exists
     if (!canvas) {
        console.error("Canvas element not found. Make sure the 'game-surface' canvas exists.");
        return;
    }
    // Get the WebGL rendering context
var gl = canvas.getContext("webgl");

 // Check if the WebGL context is successfully obtained
 if (!gl) {
    console.error("Unable to initialize WebGL. Your browser may not support it.");
    return;
}



// Initialize buffer
var bufferId = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

// Initial Triangle
var vertices = [
    vec3(0.0, 0.0, -1.0),
    vec3(0.0, 0.9428, 0.3333),
    vec3(-0.8165, -0.4714, 0.3333),
    vec3(0.8165, -0.4714, 0.3333)
];
tetrahedron(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubDivide);

// Initialize shaders and program
var program = initShaders(gl, "vertex-shader", "fragment-shader");
gl.useProgram(program);

// Create and bind buffer
var bufferId = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

// Set buffer data
gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

// Get attribute location
var vPosition = gl.getAttribLocation(program, "vPosition");
gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vPosition);

// Render the scene
render(gl);
}

function render(gl) {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
   gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

// Ensure that the WebGL initialization code is called after the page has fully loaded
window.onload = function () {
    initWebGL();
};

function triangle(a, b, c) {
    points.push(a, b, c);
}

function tetrahedron(a, b, c, d, n) {
    divideTetrahedron(a, b, c, d, n);
}

function divideTetrahedron(a, b, c, d, count) {
    if (count === 0) {
        triangle(a, b, c);
        triangle(a, c, d);
        triangle(a, d, b);
        triangle(b, d, c);
    } else {
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var ad = mix(a, d, 0.5);
        var bc = mix(b, c, 0.5);
        var bd = mix(b, d, 0.5);
        var cd = mix(c, d, 0.5);

        --count;

        divideTetrahedron(a, ab, ac, ad, count);
        divideTetrahedron(ab, b, bc, bd, count);
        divideTetrahedron(ac, bc, c, cd, count);
        divideTetrahedron(ad, bd, cd, d, count);
    }
}
