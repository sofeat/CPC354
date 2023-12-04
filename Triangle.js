var canvas;
var gl;
var points = [];
var colors = [];
var baseColors = [
  vec4(1.00, 0.65, 0.19, 1.0),
  vec4(0.91, 0.22, 0.27, 1.0),
  vec4(0.45, 0.42, 0.69, 1.0),
  vec4(0.89, 0.54, 0.73, 1.0),
];

window.onload = function init() {
  // WebGL functions
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert("WebGL isn't available");
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 0.93, 1.0);
  gl.enable(gl.DEPTH_TEST);
  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // shader controls
  const controls = {};
  controls.vColor = gl.getAttribLocation(program, "vColor");
  controls.vPosition = gl.getAttribLocation(program, "vPosition");
  controls.thetaLoc = gl.getUniformLocation(program, "theta");
  controls.scaleLoc = gl.getUniformLocation(program, "scale");
  controls.transLoc = gl.getUniformLocation(program, "trans");

  // 3D gasket properties
  const gasket = {
    vertices: [
      vec3(0.0, 0.0, -0.25),
      vec3(0.0, 0.2357, 0.0833),
      vec3(-0.2041, -0.1179, 0.0833),
      vec3(0.2041, -0.1179, 0.0833),
    ],
    division: 3,
    speed: 4,
    theta: [0, 0, 0],
    degree: 180,
    rotateXYZ: [false, false, true],
    scale: 1.5,
    scaleFac: 3,
    trans: [0.0, 0.0],
    transMode: 0,
    pause: false,
  };

  // animation list for 3D gasket
  const animsRegistry = obj => [
    // rotation Z (default)
    rotation.bind(null, obj, -obj.degree, 2),
    rotation.bind(null, obj, obj.degree, 2),
    rotation.bind(null, obj, 0, 2),
    // rotation X if enabled
    rotation.bind(null, obj, -obj.degree, 0),
    rotation.bind(null, obj, obj.degree, 0),
    rotation.bind(null, obj, 0, 0),
    // rotation Y if enabled
    rotation.bind(null, obj, -obj.degree, 1),
    rotation.bind(null, obj, obj.degree, 1),
    rotation.bind(null, obj, 0, 1),
    // enlarge and shrink
    scaling.bind(null, obj, obj.scaleFac),
    scaling.bind(null, obj, obj.scale),
    // random hit and bounce
    setDelta.bind(null, obj),
    translation.bind(null, obj),
  ];

  // input settings for 3D gasket (quick and dirty way for input with same names)
  const settings = Array.from(document.querySelectorAll(".settings"));
  settings.forEach(setting => {
    setting.addEventListener("change", () => {
      gasket[setting.name] = Number(setting.value);
      let textbox = document.querySelector(
        `[class="textbox"][name="${setting.name}"]`
      );

      if (textbox !== null) {
        textbox.value = setting.value;
      }

      renderObject(controls, gasket);
      gasket.anims = animsRegistry(gasket);
      gasket.currentAnim = gasket.anims.shift();
    });
  });

 // initial display of static 3D gasket
 renderObject(controls, gasket);
 // obtain animation list
 gasket.anims = animsRegistry(gasket);
 gasket.currentAnim = gasket.anims.shift();

 // Start the animation immediately
 //animate(gasket, controls);
  

  const colorPickers = Array.from(document.querySelectorAll(".colorpicker"));
  colorPickers.forEach((cP, i) => {
    cP.addEventListener("change", () => {
      baseColors[i] = hex2rgb(cP.value);
      renderObject(controls, gasket);
    });
  });

  const checkboxes = Array.from(
    document.querySelectorAll('input[type="checkbox"]')
  );
  checkboxes.forEach((checkbox, i) => {
    checkbox.checked = false;
    checkbox.addEventListener("change", e => {
      gasket.rotateXYZ[i] = e.target.checked;
    });
  });

  // Update speed slider event listener
const speedSlider = document.getElementById("speed");
speedSlider.addEventListener("input", () => {
  gasket.speed = parseFloat(speedSlider.value);
  // Update the speed display if needed
  document.querySelector('[name="speed"]').value = gasket.speed;
  // Render the object with the updated speed
  renderObject(controls, gasket);
});

  const inputs = settings.concat(checkboxes);

const startBtn = document.getElementById("start-button");
startBtn.addEventListener("click", () => {
    gasket.pause = !gasket.pause;

    console.log("obj.anims:", gasket.anims);
    console.log("obj.currentAnim:", gasket.currentAnim);
    
    if (!gasket.pause) {
        // Start the animation directly
        gasket.currentAnim = gasket.anims.shift();
        animate(gasket, controls);
    }

    // Update button state and disable other buttons during animation
    startBtn.value = gasket.pause ? "Start" : "Stop";
    startBtn.style.background = gasket.pause ? "#D25E8F" : "#D25E8F";
    inputs.forEach(i => (i.disabled = !gasket.pause));
});
  
// Function to enable/disable rotation and movement buttons
function toggleButtons(disable) {
    const rotateBtn = document.getElementById("rotate-button");
    const moveBtn = document.getElementById("move-button");

    if (rotateBtn) {
        rotateBtn.disabled = disable;
    }

    if (moveBtn) {
        moveBtn.disabled = disable;
    }
}

  const restartBtn = document.getElementById("restart-button");
  restartBtn.addEventListener("click", () => {
    gasket.pause = true;
    gasket.theta = [0, 0, 0];
    gasket.trans = [0.0, 0.0];
    renderObject(controls, gasket);
    gasket.anims = animsRegistry(gasket);
    gasket.currentAnim = gasket.anims.shift();
    inputs.forEach(i => {
      i.disabled = false;
    });
    startBtn.value = "Start";
    startBtn.style.background = "#D25E8F";
  });
  

  // initial display of static 3D gasket
  renderObject(controls, gasket);
  // obtain animation list and start 3D gasket animation
  gasket.anims = animsRegistry(gasket);
  gasket.currentAnim = gasket.anims.shift();
};

function animate(obj, controls) {
  if (obj.pause === true) {
      return;
  }

  // Log theta[0] before animation function
  console.log("Theta[0] before animation:", obj.theta[0]);

  // Call the current animation function
  const animationCompleted = obj.currentAnim(obj);

  // If the current animation is completed, move to the next one
  if (animationCompleted) {
      obj.currentAnim = obj.anims.shift();

      // Check if obj.anims is still empty after shifting
      if (!obj.currentAnim) {
          obj.anims = animsRegistry(obj);
          obj.currentAnim = obj.anims.shift();
      }

      // Add this check to handle the case when obj.anims is still empty
      if (!obj.currentAnim) {
          console.error("No animation functions available.");
          return;
      }
  }

  for (let i = 0; i < obj.vertices.length; i++) {
      if (obj.theta) {
          const { vertex, theta } = rotateVertex(obj.vertices[i], obj.theta, obj.rotateXYZ);
          obj.vertices[i] = vertex;
          obj.theta = theta;
      }
  }

  // Update the object's properties
  renderObject(controls, obj);

  // Request the next animation frame
  requestAnimationFrame(() => animate(obj, controls));
}

function scaling(obj, scale) {
    obj.scale = scale;
    return true;
}

function rotateVertex(vertex, theta, rotateAxes) {
    if (!theta) {
        theta = [0, 0, 0];
    }

    const radiansX = theta[0];
    const radiansY = theta[1];
    const radiansZ = theta[2];

    let transformedVertex = vertex;

    if (rotateAxes[0]) {
        transformedVertex = rotateX(transformedVertex, radiansX);
    }
    if (rotateAxes[1]) {
        transformedVertex = rotateY(transformedVertex, radiansY);
    }
    if (rotateAxes[2]) {
        transformedVertex = rotateZ(transformedVertex, radiansZ);
    }

    return { vertex: transformedVertex, theta };
}
  

  function rotateX(vertex, radians) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    const x = vertex[0];
    const y = vertex[1];
    const z = vertex[2];

    return vec3(
        x,
        c * y - s * z,
        s * y + c * z
    );
}

function rotateY(vertex, radians) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    const x = vertex[0];
    const y = vertex[1];
    const z = vertex[2];

    return vec3(
        c * x + s * z,
        y,
        -s * x + c * z
    );
}

function rotateZ(vertex, radians) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    const x = vertex[0];
    const y = vertex[1];
    const z = vertex[2];

    return vec3(
        c * x - s * y,
        s * x + c * y,
        z
    );
}

function rotation(obj, degree, axis) {
    // Convert degree to radians
    const radians = Math.PI * degree / 180;

    // Perform rotation based on the specified axis
    if (axis === 0) {
        // Rotate about X-axis
        obj.theta[0] += radians;
    } else if (axis === 1) {
        // Rotate about Y-axis
        obj.theta[1] += radians;
    } else if (axis === 2) {
        // Rotate about Z-axis
        obj.theta[2] += radians;
    }

    return true;
  }



function translation(obj) {
  // rotating, rotate about z axis
  if (obj.transMode === 1) {
    obj.theta[2] -= obj.speed;
  } // dancing, rotate about y axis
  else if (obj.transMode === 2) {
    obj.theta[1] += obj.speed;
  } // flipping. rotate about x axis
  else if (obj.transMode === 3) {
    obj.theta[0] += obj.speed;
  } // paralysing, rotate about all axes
  else if (obj.transMode === 4) {
    // alternate between 2 directions
    if (Math.random() > 0.5) {
      obj.theta[0] += obj.speed;
      obj.theta[1] += obj.speed;
      obj.theta[2] -= obj.speed;
    } else {
      obj.theta[0] -= obj.speed;
      obj.theta[1] -= obj.speed;
      obj.theta[2] += obj.speed;
    }
  }
  // reverse x when any vertex hits left/right
  if (
    obj.vertices.some(
      v => Math.abs(v[0] + obj.trans[0] / obj.scale) > 0.97 / obj.scale
    )
  ) {
    obj.deltaX = -obj.deltaX;
  }
  // reverse y when any vertex hits top/bottom
  if (
    obj.vertices.some(
      v => Math.abs(v[1] + obj.trans[1] / obj.scale) > 0.97 / obj.scale
    )
  ) {
    obj.deltaY = -obj.deltaY;
  }
  obj.trans[0] += obj.deltaX;
  obj.trans[1] += obj.deltaY;
  return false;
}

// convert colour picker hex code to vec4
function hex2rgb(hex) {
  let bigint = parseInt(hex.substring(1), 16);
  let R = ((bigint >> 16) & 255) / 255;
  let G = ((bigint >> 8) & 255) / 255;
  let B = (bigint & 255) / 255;
  return vec4(R, G, B, 1.0);
}

// adjust delta (displacement) based on object's speed
function setDelta(obj) {
  obj.deltaX = obj.speed * Math.cos(Math.PI / 3) * 0.004;
  obj.deltaY = obj.speed * Math.sin(Math.PI / 3) * 0.004;
  return true;
}

// 3D gasket generation functions
function renderObject(controls, obj) {
  points = [];
  colors = [];
  divideTetra(
    obj.vertices[0],
    obj.vertices[1],
    obj.vertices[2],
    obj.vertices[3],
    obj.division
  );

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  gl.vertexAttribPointer(controls.vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(controls.vColor);

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  gl.vertexAttribPointer(controls.vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(controls.vPosition);

  gl.uniform3fv(controls.thetaLoc, flatten(obj.theta));
  gl.uniform1f(controls.scaleLoc, obj.scale);
  gl.uniform2fv(controls.transLoc, obj.trans);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

function triangle(a, b, c, color) {
  colors.push(baseColors[color]);
  points.push(a);
  colors.push(baseColors[color]);
  points.push(b);
  colors.push(baseColors[color]);
  points.push(c);
}

function tetra(a, b, c, d) {
  triangle(a, c, b, 0);
  triangle(a, c, d, 1);
  triangle(a, b, d, 2);
  triangle(b, c, d, 3);
}

function divideTetra(a, b, c, d, count) {
    if (count === 0) {
        tetra(a, b, c, d);
    } else if (a && b && c && d) {
        let ab = mix(a, b, 0.5);
        let ac = mix(a, c, 0.5);
        let ad = mix(a, d, 0.5);
        let bc = mix(b, c, 0.5);
        let bd = mix(b, d, 0.5);
        let cd = mix(c, d, 0.5);

        --count;
        divideTetra(a, ab, ac, ad, count);
        divideTetra(ab, b, bc, bd, count);
        divideTetra(ac, bc, c, cd, count);
        divideTetra(ad, bd, cd, d, count);
    }
}
