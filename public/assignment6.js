// Examples of func webglUtils.hexToRgb
const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_HEX = "#0000FF"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)
const GREEN_HEX = "#00FF00"
const GREEN_RGB = webglUtils.hexToRgb(GREEN_HEX)
const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const LETTER_F = "LETTER_F"
const STAR = "STAR"
const CIRCLE = "CIRCLE"
const CUBE = "CUBE"
const origin = {x: 0, y: 0, z: 0}
const sizeOne = {width: 1, height: 1, depth: 1}


// --- Data model ---
// Configure the color of the initial rectangle in the shapes array
let camera = {
    translation: {x: -45, y: -35, z: 21},
    rotation: {x: 40, y: 235, z: 0}
}

let lightSource = [0.4, 0.3, 0.5]

let shapes = [
    {
        type: CUBE,
        position: origin,
        dimensions: sizeOne,
        color: BLUE_RGB,
        translation: {x:  0, y: 0, z: 0},
        scale:       {x:   0.5, y:   0.5, z:   0.5},
        rotation:    {x:   0, y:  0, z:   0},
    },
    {
        type: CUBE,
        position: origin,
        dimensions: sizeOne,
        color: GREEN_RGB,
        translation: {x: 20, y: 0, z: 0},
        scale:       {x:   0.5, y:   0.5, z:   0.5},
        rotation:    {x:   0, y:  0, z:   0},
    },
    {
        type: CUBE,
        position: origin,
        dimensions: sizeOne,
        color: RED_RGB,
        translation:  {x: -20, y: 0, z: 0},
        scale:       {x:   0.5, y:   0.5, z:   0.5},
        rotation:     {x: 0, y: 0, z: 0}
    },
    // {
    //   type: LETTER_F,
    //   position: origin,
    //   dimensions: sizeOne,
    //   color: BLUE_RGB,
    //   translation: {x: -150, y: 0, z: -360},
    //   scale: {x: 1, y: 1, z: 1},
    //   rotation: {x: m4.degToRad(190), y: m4.degToRad(40), z: m4.degToRad(320)},
    // },
    // {
    //   type: LETTER_F,
    //   position: origin,
    //   dimensions: sizeOne,
    //   color: RED_RGB,
    //   translation: {x: -100, y: 0, z: -400},
    //   scale: {x: 1, y: 1, z: 1},
    //   rotation: {x: m4.degToRad(190), y: m4.degToRad(40), z: m4.degToRad(320)},
    // },
    // {
    //   type: RECTANGLE,
    //   position: origin,
    //   dimensions: sizeOne,
    //   color: BLUE_RGB,
    //   translation: {x: -15, y: 0, z: -20},
    //   scale: {x: 10, y: 10, z: 10},
    //   rotation: {x: 0, y: 0, z: 0}
    // },
    // {
    //   type: TRIANGLE,
    //   position: origin,
    //   dimensions: sizeOne,
    //   color: RED_RGB,
    //   translation: {x: 15, y: 0, z: -20},
    //   scale: {x: 10, y: 10, z: 10},
    //   rotation: {x: 0, y: 0, z: 180}
    // },
    // {
    //   type: CUBE,
    //   position: origin,
    //   dimensions: sizeOne,
    //   color: RED_RGB,
    //   translation: {x:   -20, y: 0, z: 0},
    //   scale:       {x:   0.5, y:   0.5, z:   0.5},
    //   rotation:    {x:   0, y:  0, z:   0},
    // },

    // {
    //   type: CUBE,
    //   position: origin,
    //   dimensions: sizeOne,
    //   color: BLUE_RGB,
    //   translation: {x: -50, y: 0, z: -100},
    //   scale: {x: 1, y: 1, z: 1},
    //   rotation: {x: 45, y: 45, z: 45},
    // },
    // {
    //   type: CUBE,
    //   position: origin,
    //   dimensions: sizeOne,
    //   color: GREEN_RGB,
    //   translation: {x: 0, y: 0, z: -100},
    //   scale: {x: 1, y: 1, z: 1},
    //   rotation: {x: 45, y: 45, z: 45},
    // }
]

//  --- Initialize WebGL ---
let gl
let attributeCoords
let uniformColor
let bufferCoords
let uniformMatrix
let selectedShapeIndex = 0
let fieldOfViewRadians = m4.degToRad(60)
const up = [0, 1, 0]        // declare up to be in +y direction
let target = [0, 0, 0]      // declare the origin as the target we'll look at
let lookAt = true           // we'll toggle lookAt on and off



// Func: init() which
// 1. contains mousedown event listener on the canvas, so it can add new shapes when the users clicks on the canvas
const init = () => {
    // get a reference to the canvas and WebGL context
    const canvas = document.querySelector("#canvas");

    //contains mousedown event listener on the canvas, so it can add new shapes when the users clicks on the canvas
    canvas.addEventListener("mousedown", webglUtils.doMouseDown, false);

    gl = canvas.getContext("webgl");

    // create and use a GLSL program

    const program = webglUtils.createProgramFromScripts(gl,
        "#vertex-shader-3d", "#fragment-shader-3d");

    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
    uniformMatrix = gl.getUniformLocation(program, "u_matrix");
    const uniformResolution = gl.getUniformLocation(program, "u_resolution");
    uniformColor = gl.getUniformLocation(program, "u_color");

    gl.useProgram(program);

    // initialize coordinate attribute to send each vertex to GLSL program
    gl.enableVertexAttribArray(attributeCoords);

    // initialize coordinate buffer to send array of vertices to GPU
    bufferCoords = gl.createBuffer();

    // configure canvas resolution and clear the canvas
    gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    document.getElementById("tz").onchange = event => webglUtils.updateTranslation(event, "z")
    document.getElementById("ty").onchange = event => webglUtils.updateTranslation(event, "y")
    document.getElementById("tx").onchange = event => webglUtils.updateTranslation(event, "x")

    document.getElementById("sx").onchange = event => webglUtils.updateScale(event, "x")
    document.getElementById("sy").onchange = event => webglUtils.updateScale(event, "y")
    document.getElementById("sz").onchange = event => webglUtils.updateScale(event, "z")

    document.getElementById("rx").onchange = event => webglUtils.updateRotation(event, "x")
    document.getElementById("ry").onchange = event => webglUtils.updateRotation(event, "y")
    document.getElementById("rz").onchange = event => webglUtils.updateRotation(event, "z")

    document.getElementById("fv").onchange = event => webglUtils.updateFieldOfView(event)

    document.getElementById("color").onchange = event => updateColor(event)

    document.getElementById("lookAt").onchange = event => webglUtils.toggleLookAt(event)
    document.getElementById("ctx").onchange = event => webglUtils.updateCameraTranslation(event, "x")
    document.getElementById("cty").onchange = event => webglUtils.updateCameraTranslation(event, "y")
    document.getElementById("ctz").onchange = event => webglUtils.updateCameraTranslation(event, "z")
    document.getElementById("crx").onchange = event => webglUtils.updateCameraRotation(event, "x")
    document.getElementById("cry").onchange = event => webglUtils.updateCameraRotation(event, "y")
    document.getElementById("crz").onchange = event => webglUtils.updateCameraRotation(event, "z")
    document.getElementById("ltx").onchange = event => webglUtils.updateLookAtTranslation(event, 0)
    document.getElementById("lty").onchange = event => webglUtils.updateLookAtTranslation(event, 1)
    document.getElementById("ltz").onchange = event => webglUtils.updateLookAtTranslation(event, 2)

    document.getElementById("lookAt").checked = lookAt
    document.getElementById("ctx").value = camera.translation.x
    document.getElementById("cty").value = camera.translation.y
    document.getElementById("ctz").value = camera.translation.z
    document.getElementById("crx").value = camera.rotation.x
    document.getElementById("cry").value = camera.rotation.y
    document.getElementById("crz").value = camera.rotation.z

    webglUtils.selectShape(0)
}




//  --- Render Shapes ---
// Func: render() which
// 1. iterates over the shape array,
// 2. it will invoke renderTriangle() func if the Type is TRIANGLE
const render = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
    gl.vertexAttribPointer(attributeCoords, 3, gl.FLOAT, false, 0, 0); //size = 3 floats per vertex

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;
    let cameraMatrix = m4.identity()            // initialize camera with identity

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);


    if(lookAt) {

        cameraMatrix = m4.translate(                // translate camera to it's x, y, z
            cameraMatrix,
            camera.translation.x,
            camera.translation.y,
            camera.translation.z)
        const cameraPosition = [                    // get camera's position after translation
            cameraMatrix[12],                       // x position after translation
            cameraMatrix[13],                       // y position after translation
            cameraMatrix[14]]                       // z position after translation
        cameraMatrix = m4.lookAt(                   // point camera
            cameraPosition,                         // from camera's position
            target,                                 // towards target = [x, y, z]
            up)                                     // where up=[0, 1, 0] (+y)
        cameraMatrix = m4.inverse(cameraMatrix)     // invert the cameraMatrix to apply to the world
        // const projectionMatrix = m4.perspective(    // create perspective projection matrix
        //     fieldOfViewRadians, aspect, zNear, zFar)// multiply perspective matrix and camera matrix
        // const viewProjectionMatrix = m4.multiply(   // to get view projection matrix to apply to object world
        //     projectionMatrix, cameraMatrix)
    } else {
        cameraMatrix = m4.zRotate(
            cameraMatrix,
            m4.degToRad(camera.rotation.z));
        cameraMatrix = m4.xRotate(
            cameraMatrix,
            m4.degToRad(camera.rotation.x));
        cameraMatrix = m4.yRotate(
            cameraMatrix,
            m4.degToRad(camera.rotation.y));
        cameraMatrix = m4.translate(
            cameraMatrix,
            camera.translation.x,
            camera.translation.y,
            camera.translation.z);
    }

    const projectionMatrix = m4.perspective(
        fieldOfViewRadians, aspect, zNear, zFar);
    const viewProjectionMatrix = m4.multiply(
        projectionMatrix, cameraMatrix);


    const $shapeList = $("#object-list")
    $shapeList.empty()
    shapes.forEach((shape, index) => {

        gl.uniform4f(
            uniformColor,
            shape.color.red,
            shape.color.green,
            shape.color.blue,
            1
        );



        let M = computeModelViewMatrix(shape, viewProjectionMatrix)          // apply view projection matrix to all the shapes

        gl.uniformMatrix4fv(uniformMatrix, false, M)

        if (shape.type === RECTANGLE) {
            webglUtils.renderRectangle(shape)
        } else if (shape.type === TRIANGLE) {
            webglUtils.renderTriangle(shape)
        } else if (shape.type === CIRCLE) {
            webglUtils.renderCircle(shape)
        } else if (shape.type === STAR) {
            webglUtils.renderStar(shape)
        } else if (shape.type === CUBE) {
            webglUtils.renderCube(shape)
        }


        const $li = $(`
      <li>
        <button onclick="webglUtils.deleteShape(${index})">
          Delete
        </button>

        <label>
          <input
          type="radio"
          id="${shape.type}-${index}"
          name="shape-index"
          ${index === selectedShapeIndex ? "checked": ""}
          onclick="selectShape(${index})"
          value="${index}"/>

          ${shape.type};
          X: ${shape.translation.x};
          Y: ${shape.translation.y}
        </label>
      </li>
    `)

        $shapeList.append($li)
    })


}



const computeModelViewMatrix = (shape, viewProjectionMatrix) => {           // pass shape and view matrix
    M = m4.translate(viewProjectionMatrix,                                  // apply view matrix to shape's translation
        shape.translation.x,
        shape.translation.y,
        shape.translation.z)
    M = m4.translate(M, shape.translation.x, shape.translation.y, shape.translation.z)
    M = m4.xRotate(M, m4.degToRad(shape.rotation.x))
    M = m4.yRotate(M, m4.degToRad(shape.rotation.y))
    M = m4.zRotate(M, m4.degToRad(shape.rotation.z))
    M = m4.scale(M, shape.scale.x, shape.scale.y, shape.scale.z)
    return M
}











