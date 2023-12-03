var gl;
var points = [];
var NumTimesToSubDivide = 5;

function initWebGL() {
    var canvas = document.getElementById("game-surface");
    gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    var vertices = [
        vec2(-1.0, -1.0),
        vec2(0.0, 1.0),
        vec2(1.0, -1.0)
    ];

    divideTriangle(vertices[0], vertices[1], vertices[2], NumTimesToSubDivide);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var uColor = gl.getUniformLocation(program, "uColor");
    gl.uniform4fv(uColor, vec4(1.0, 0.0, 0.0, 1.0)); // Red color

    render();
}

function triangle(a, b, c) {
    points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {
    if (count === 0) {
        triangle(a, b, c);
    } else {
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

// Ensure that the WebGL initialization code is called after the page has fully loaded
window.onload = function () {
    initWebGL();
};