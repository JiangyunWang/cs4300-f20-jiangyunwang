// Examples of func webglUtils.hexToRgb
const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_HEX = "#0000FF"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)


const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const CIRLCLE = "CIRCLE"
const STAR = "STAR"

// add translation,rotation,and scale properties
const origin = {x: 0, y: 0}
const sizeOne = {width: 1, height: 1}

// --- Data model ---
// Configure the color of the initial rectangle in the shapes array
let shapes = [
    {
        type: RECTANGLE,
        position: origin,
        dimensions: sizeOne,
        color: BLUE_RGB,
        translation: {x: 200, y:100},
        rotation: {z: 0},
        scale: {x:50, y:50}
    },
    // Add support for triangles
    // Declaration: a TRIANGLE constant to represent the new shape and add it to shapes Array.
    {
        type: TRIANGLE,
        position: origin,
        dimensions: sizeOne,
        color: RED_RGB,
        translation: {x: 300, y:100},
        rotation: {z: 0},
        scale: {x:50, y:50}
    },

    {
        type: CIRLCLE,
        position: origin,
        dimensions: sizeOne,
        color: {red: Math.random(),
                green: Math.random(),
                blue: Math.random()},
        translation: {x: 200, y:200},
        rotation: {z: 0},
        scale: {x:50, y:50}
    },

    {
        type: STAR,
        position: origin,
        dimensions: sizeOne,
        color: {red: Math.random(),
            green: Math.random(),
            blue: Math.random()},
        translation: {x: 300, y:200},
        rotation: {z: 0},
        scale: {x:50, y:50}
    }

]

//  --- Initialize WebGL ---
let gl
let attributeCoords
let uniformColor
let bufferCoords
let uniformMatrix
let selectedShapeIndex = 0


const addShape = (translation, type) => {
    const colorHex = document.getElementById("color").value
    const colorRgb = webglUtils.hexToRgb(colorHex)
    let tx = 0
    let ty = 0
    if (translation) {
        tx = translation.x
        ty = translation.y
    }
    const shape = {
        type: type,
        position: origin,
        dimensions: sizeOne,
        color: colorRgb,
        translation: {x: tx, y: ty, z: 0},
        rotation: {x: 0, y: 0, z: 0},
        scale: {x: 20, y: 20, z: 20}
    }
    shapes.push(shape)
    render()
}


const updateTranslation = (event, axis) => {
    const value = event.target.value
    shapes[selectedShapeIndex].translation[axis] = value
    render()
}

const updateScale = (event, axis) => {
    const value = event.target.value
    shapes[selectedShapeIndex].scale[axis] = value
    render()
}

const updateRotation = (event, axis) => {
    const value = event.target.value
    const angleInDegrees = (360 - value) * Math.PI / 180;
    shapes[selectedShapeIndex].rotation[axis] = angleInDegrees
    render();
}

const updateColor = (event) => {
    // Use webglUtils.hexToRgb to convert hex color to rgb
    const value = event.target.value
    const colorRgb = webglUtils.hexToRgb(value)
    shapes[selectedShapeIndex].color = colorRgb
    render();
}


// Func: doMouseDown() which
// 1. adds a rectangle or a triangle based on the radio selected
const doMouseDown = (event) => {
    const boundingRectangle = canvas.getBoundingClientRect();
    const x = event.clientX - boundingRectangle.left;
    const y = event.clientY - boundingRectangle.top;
    const translation = {x, y}
    const shape = document.querySelector("input[name='shape']:checked").value

    addShape(translation, shape)
}

// Func: init() which
// 1. contains mousedown event listener on the canvas, so it can add new shapes when the users clicks on the canvas
const init = () => {
    // get a reference to the canvas and WebGL context
    const canvas = document.querySelector("#canvas");

    //contains mousedown event listener on the canvas, so it can add new shapes when the users clicks on the canvas
    canvas.addEventListener("mousedown", doMouseDown, false);

    gl = canvas.getContext("webgl");

    // create and use a GLSL program
    const program = webglUtils.createProgramFromScripts(gl,
        "#vertex-shader-2d", "#fragment-shader-2d");
    gl.useProgram(program);

    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
    uniformMatrix = gl.getUniformLocation(program, "u_matrix");
    const uniformResolution = gl.getUniformLocation(program, "u_resolution");
    uniformColor = gl.getUniformLocation(program, "u_color");

    // initialize coordinate attribute to send each vertex to GLSL program
    gl.enableVertexAttribArray(attributeCoords);

    // initialize coordinate buffer to send array of vertices to GPU
    bufferCoords = gl.createBuffer();

    // configure canvas resolution and clear the canvas
    gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    document.getElementById("tx").onchange = event => updateTranslation(event, "x")
    document.getElementById("ty").onchange = event => updateTranslation(event, "y")

    document.getElementById("sx").onchange = event => updateScale(event, "x")
    document.getElementById("sy").onchange = event => updateScale(event, "y")

    document.getElementById("rz").onchange = event => updateRotation(event, "z")

    document.getElementById("color").onchange = event => updateColor(event)

    selectShape(0)
}




//  --- Render Shapes ---
// Func: render() which
// 1. iterates over the shape array,
// 2. it will invoke renderTriangle() func if the Type is TRIANGLE
const render = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
    gl.vertexAttribPointer(attributeCoords, 2, gl.FLOAT, false, 0, 0);

    const $shapeList = $("#object-list")
    $shapeList.empty()

    shapes.forEach((shape, index) => {
        const $li = $(`
     <li>
        <button onclick="deleteShape(${index})">
          Delete
        </button>

       <label>
           <input
            type="radio"
            id="${shape.type}-${index}"
            name="shape-index"
            ${index === selectedShapeIndex ? "checked" : ""}
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

    shapes.forEach(shape => {
        gl.uniform4f(
            uniformColor,
            shape.color.red,
            shape.color.green,
            shape.color.blue,
            1
        );

        // compute transformation matrix
        let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
        matrix = m3.translate(matrix, shape.translation.x, shape.translation.y);
        matrix = m3.rotate(matrix, shape.rotation.z);
        matrix = m3.scale(matrix, shape.scale.x, shape.scale.y);

        // apply transformation matrix.
        gl.uniformMatrix3fv(uniformMatrix, false, matrix);

        if (shape.type === RECTANGLE) {
            renderRectangle(shape)
        } else if (shape.type === TRIANGLE) {
            renderTriangle(shape)
        } else if (shape.type === CIRLCLE) {
            renderCircle(shape)
        } else if (shape.type === STAR) {
            renderStar(shape)
        }
    });

}

const deleteShape = (shapeIndex) => {
    shapes.splice(shapeIndex, 1)
    render()
}

const selectShape = (selectedIndex) => {
    selectedShapeIndex = selectedIndex
    document.getElementById("tx").value = shapes[selectedIndex].translation.x
    document.getElementById("ty").value = shapes[selectedIndex].translation.y
    // TODO: update the scale and rotation fields
    document.getElementById("sx").value = shapes[selectedIndex].scale.x
    document.getElementById("sy").value = shapes[selectedIndex].scale.y
    document.getElementById("rz").value = shapes[selectedIndex].rotation.z

    const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
    document.getElementById("color").value = hexColor
}

// Func: renderRectangle()
const renderRectangle = (rectangle) => {
    const x1 = rectangle.position.x
        - rectangle.dimensions.width/2;
    const y1 = rectangle.position.y
        - rectangle.dimensions.height/2;
    const x2 = rectangle.position.x
        + rectangle.dimensions.width/2;
    const y2 = rectangle.position.y
        + rectangle.dimensions.height/2;

    const float32Array = new Float32Array([
        x1, y1, x2, y1, x1, y2,
        x1, y2, x2, y1, x2, y2
    ])

    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// Func: renderTriangle() which
// 1. calculates the 3 vertices the triangle,
// 2. creates an array of the vertices,
// 3. convert them into a Float32Array.
// 4. send the array to the GPU for drawing
const renderTriangle = (triangle) => {
    const x1 = triangle.position.x - triangle.dimensions.width / 2
    const y1 = triangle.position.y + triangle.dimensions.height / 2
    const x2 = triangle.position.x + triangle.dimensions.width / 2
    const y2 = triangle.position.y + triangle.dimensions.height / 2
    const x3 = triangle.position.x
    const y3 = triangle.position.y - triangle.dimensions.height / 2

    const float32Array = new Float32Array([x1, y1, x2, y2, x3, y3])

    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

const renderCircle = (circle) => {
    // Insert center of circle
    const xCenter = circle.position.x;
    const yCenter = circle.position.y;
    const points = [xCenter, yCenter]


    // Insert 100 triangles
    // dimension.
    for (i = 0; i <= 100; i++) {
        // the side for each triangle
        const theta = 2 * Math.PI * (i / 100)
        const xPos = xCenter + Math.cos(theta) * circle.dimensions.width / 2
        const yPos = yCenter + Math.sin(theta) * circle.dimensions.height / 2
        points.push(xPos)
        points.push(yPos)

    }

    // Using a triangle fan
    const float32Array = new Float32Array(points)

    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW)

    gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length/2);
}


const renderStar = (star) => {
    // first triangle
    const x1 = star.position.x - star.dimensions.width * 0.6
    const y1 = star.position.y + star.dimensions.height * 0.6
    const x2 = star.position.x + star.dimensions.width * 0.6
    const y2 = star.position.y + star.dimensions.height * 0.6
    const x3 = star.position.x
    const y3 = star.position.y - star.dimensions.height * 0.6
    // second triangle
    const y4 = star.position.y + star.dimensions.height
    const y0 = star.position.y

    const float32Array = new Float32Array([
        x1, y1, x2, y2, x3, y3,
        x1, y0, x2, y0, x3, y4
    ])

    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
