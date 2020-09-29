// Convert a hex string to equivalent RGB components
const hexToRgb = (hex) => {
    let parseRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let rgb = {
      red: parseInt(parseRgb[1], 16),
      green: parseInt(parseRgb[2], 16),
      blue: parseInt(parseRgb[3], 16),
    }
    rgb.red /= 256
    rgb.green /= 256
    rgb.blue /= 256
    return rgb
  }
  
  // Examples of func hexToRgb
  const RED_HEX = "#FF0000"
  const RED_RGB = hexToRgb(RED_HEX)
  const BLUE_HEX = "#0000FF"
  const BLUE_RGB = hexToRgb(BLUE_HEX)
  
  const createProgramFromScripts = (gl, vertexShaderElementId, fragmentShaderElementId) => {
      // Get the strings for our GLSL shaders
      const vertexShaderSource   = document.querySelector(vertexShaderElementId).text;
      const fragmentShaderSource = document.querySelector(fragmentShaderElementId).text;
  
      // Create GLSL shaders, upload the GLSL source, compile the shaders
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);
  
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);
  
      // Link the two shaders into a program
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
  
      return program
    }
  
  // --- Data model ---
  // Configure the color of the initial rectangle in the shapes array
  const RECTANGLE = "RECTANGLE"
  const TRIANGLE = "TRIANGLE"
  let shapes = [
    {
      type: RECTANGLE,
      position: {
        x: 200,
        y: 100
      },
      dimensions: {
        width: 50,
        height: 50
      },
      color: {
        red: BLUE_RGB.red,
        green: BLUE_RGB.green,
        blue: BLUE_RGB.blue
      }
    },
    // Add support for triangles
    // Declaration: a TRIANGLE constant to represent the new shape and add it to shapes Array.
    {
      type: TRIANGLE,
      position: {
        x: 300,
        y: 100
      },
      dimensions: {
        width: 50,
        height: 50
      },
      color: {
          red: RED_RGB.red,
          green: RED_RGB.blue,
          blue: RED_RGB.green
        }
    }
  ]
  
  //  --- Initialize WebGL ---
  let gl
  let attributeCoords
  let uniformColor
  let bufferCoords
  
  // Func: init() which
  // 1. contains mousedown event listener on the canvas, so it can add new shapes when the users clicks on the canvas
  const init = () => {
    // get a reference to the canvas and WebGL context
    const canvas = document.querySelector("#canvas");
  
    //contains mousedown event listener on the canvas, so it can add new shapes when the users clicks on the canvas
    canvas.addEventListener("mousedown", doMouseDown, false);
  
    gl = canvas.getContext("webgl");
  
    // create and use a GLSL program
    const program = createProgramFromScripts(gl,
      "#vertex-shader-2d", "#fragment-shader-2d");
    gl.useProgram(program);
  
    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
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
  }
  
  // Func: doMouseDown() which
  // 1. adds a rectangle or a triangle based on the radio selected
  const doMouseDown = (event) => {
      const boundingRectangle = canvas.getBoundingClientRect();
      const x = event.clientX - boundingRectangle.left;
      const y = event.clientY - boundingRectangle.top;
      const center = { position: { x, y } }
      const shape = document.querySelector("input[name='shape']:checked").value
    
      if (shape === "RECTANGLE") {
        addRectangle(center)
      } else if (shape === "TRIANGLE") {
        addTriangle(center)
      }
    }
  
  
  //  --- Render Shapes ---
  // Func: render() which
  // 1. iterates over the shape array,
  // 2. it will invoke renderTriangle() func if the Type is TRIANGLE
  const render = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
    gl.vertexAttribPointer(attributeCoords, 2, gl.FLOAT, false, 0, 0);
  
    shapes.forEach(shape => {
      gl.uniform4f(
        uniformColor,
        shape.color.red,
        shape.color.green,
        shape.color.blue,
        1
      );
  
      if (shape.type === RECTANGLE) {
        renderRectangle(shape)
      } else if (shape.type === TRIANGLE) {
        renderTriangle(shape)
      }
    })
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
  
  
  // Func: addRectangle() which
  // 1. accepts the center of the rectangle
  const addRectangle = (center) => {
      let x = parseInt(document.getElementById("x").value)
      let y = parseInt(document.getElementById("y").value)
      const width = parseInt(document.getElementById("width").value)
      const height = parseInt(document.getElementById("height").value)
      const colorHex = document.getElementById("color").value
      const colorRgb = hexToRgb(colorHex)
      if (center) {
        x = center.position.x
        y = center.position.y
      }
  
      const rectangle = {
        type: RECTANGLE,
        position: {
          x: x,
          y: y
        },
        dimensions: {
          width,
          height
        },
        color: colorRgb
      }
      shapes.push(rectangle)
      render()
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
  
  // Func: addTriangle() which
  // 1. accepts the center of the triangle
  const addTriangle = (center) => {
    let x = parseInt(document.getElementById("x").value)
    let y = parseInt(document.getElementById("y").value)
    const colorHex = document.getElementById("color").value
    const colorRgb = hexToRgb(colorHex)
    const width = parseInt(document.getElementById("width").value)
    const height = parseInt(document.getElementById("height").value)
    if (center) {
      x = center.position.x
      y = center.position.y
    }
    const triangle = {
      type: TRIANGLE,
      position: { x, y },
      dimensions: { width, height },
      color: colorRgb
    }
    shapes.push(triangle)
    render()
  }