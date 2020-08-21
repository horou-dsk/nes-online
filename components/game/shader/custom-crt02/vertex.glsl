#version 300 es
precision mediump float;

layout (location = 0) in vec2 VertexCoord;
//COMPAT_ATTRIBUTE vec4 COLOR;
layout (location = 2) in vec4 TexCoord;
out vec4 COL0;
out vec4 TEX0;

uniform mat4 MVPMatrix;

void main()
{
    gl_Position = MVPMatrix * vec4(VertexCoord, 0.0, 1.0);
    COL0 = vec4(0.0, 0.0, 0.0, 1.0);
    TEX0.xy = vec2(TexCoord.x, 1.0 - TexCoord.y);
}
