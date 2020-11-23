precision mediump float;

out vec4 FragColor;
//in vec3 ourColor;
in vec4 TEX0;
//varying vec4 TEX0;

uniform sampler2D Texture;
uniform vec3 iResolution;
//uniform sampler2D texture2;
//uniform float visible;

/*void main() {
//    FragColor = mix(texture(texture1, TEX0), texture(texture2, vec2(1.0 - TEX0.x, TEX0.y)), visible);
    FragColor = texture(texture1, TEX0);
//    FragColor = vec4(1.0f, 0.5f, 0.2f, 1.0f);
}*/
#define SCAN_LINE_MULT 1250.0

vec2 curve(vec2 uv)
{
    uv = (uv - 0.5) * 2.0;
    uv *= 1.1;
    uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
    uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
    uv  = (uv / 2.0) + 0.5;
    uv =  uv *0.92 + 0.04;
    return uv;
}

vec2 CRTCurveUV( vec2 uv )
{
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs( uv.yx ) / vec2( 7.0, 7.0 );
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
}
void DrawVignette( inout vec3 color, vec2 uv )
{
    float vignette = uv.x * uv.y * ( 1.0 - uv.x ) * ( 1.0 - uv.y );
    vignette = clamp( pow( abs(16.0 * vignette), 0.3 ), 0.0, 1.0 );
    color *= vignette;
}

void DrawScanline( inout vec3 color, vec2 uv )
{
    float scanline 	= clamp( 0.95 + 0.05 * cos( 3.14 * ( uv.y + 0.008 ) * 240.0 * 1.0 ), 0.0, 1.0 );
    float grille 	= 0.85 + 0.15 * clamp( 1.5 * cos( 3.14 * uv.x * 640.0 * 1.0 ), 0.0, 1.0 );
    color *= scanline * grille * 1.2;
}

/*void blurry(inout vec3 color, vec2 uv) {
    if (color.r == 0.0 && color.g == 0.0 && color.b == 0.0) {

    }
}*/

/*vec2 warp=vec2(1.0/32.0, 1.0/24.0);

vec2 Warp(vec2 pos){
    pos=pos*2.0-1.0;
    pos*=vec2(1.0+(pos.y*pos.y)*warp.x, 1.0+(pos.x*pos.x)*warp.y);
    return pos*0.5+0.5;
}*/

void main()
{
    vec2 uv = TEX0.xy;
    vec2 crtUV = CRTCurveUV( uv );
    vec4 t = texture(Texture, crtUV);
    vec3 color = t.xyz;
    if ( crtUV.x < 0.0 || crtUV.x > 1.0 || crtUV.y < 0.0 || crtUV.y > 1.0 )
    {
        color = vec3( 0.0, 0.0, 0.0 );
    }
    DrawVignette( color, crtUV );
    DrawScanline( color, uv );
    FragColor = vec4(color, t.w);
//    FragColor = vec4(1, 1, 1, 1);
//    FragColor = texture(Texture, TEX0.xy);
}
