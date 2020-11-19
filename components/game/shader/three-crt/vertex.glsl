precision mediump float;

//layout (location = 0) in vec2 VertexCoord;
//COMPAT_ATTRIBUTE vec4 COLOR;
//layout (location = 2) in vec4 TexCoord;

//in vec3 position;
//in vec4 TexCoord;

//varying vec4 COL0;
//varying vec4 TEX0;
out vec4 COL0;
out vec4 TEX0;

//uniform mat4 modelViewMatrix; // optional
//uniform mat4 projectionMatrix; // optional
//attribute vec3 position;
//attribute vec4 TexCoord;

void main()
{
    COL0 = vec4(0.0, 0.0, 0.0, 1.0);
    TEX0.xy = vec2(uv.x, uv.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
