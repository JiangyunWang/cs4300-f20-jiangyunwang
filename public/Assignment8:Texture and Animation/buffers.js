const initializeBuffers = (gl) => {

    const positionBuffer = initializePositionBuffer(gl);

    return {
        position: positionBuffer,
    };
}


const initializePositionBuffer = (gl) => {
    const positionBuffer = gl.createBuffer();                // create a buffer for the square's positions.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);          // make it current for subsequent
    const positions = [                                      // create array of positions for square
        -1.0, 1.0,   1.0, 1.0,   -1.0, -1.0,   1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER,                           // pass positions to WebGL to build shape
        new Float32Array(positions),
        gl.STATIC_DRAW);
    return positionBuffer;
}
