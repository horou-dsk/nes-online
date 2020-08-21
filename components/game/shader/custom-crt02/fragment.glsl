#version 300 es
precision mediump float;
out vec4 FragColor;
//in vec3 ourColor;
in vec4 TEX0;

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
    /*vec2 tc = TEX0.xy;

    // Distance from the center
    float dx = abs(0.5-tc.x);
    float dy = abs(0.5-tc.y);

    // Square it to smooth the edges
    dx *= dx;
    dy *= dy;

    tc.x -= 0.5;
    tc.x *= 1.0 + (dy * 0.4);
    tc.x += 0.5;

    tc.y -= 0.5;
    tc.y *= 1.0 + (dx * 0.2);
    tc.y += 0.5;*/

    // Get texel, and add in scanline if need be
    /*vec4 cta = texture(Texture, vec2(tc.x, tc.y));

    cta.rgb += sin(tc.y * SCAN_LINE_MULT) * 0.12;

    // Cutoff
    if(tc.y > 1.0 || tc.x < 0.0 || tc.x > 1.0 || tc.y < 0.0)
        cta = vec4(0.0);*/
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
    /*if ( crtUV.x < 0.0 || crtUV.x > 1.0 || crtUV.y < 0.0 || crtUV.y > 1.0 )
    {
        crtUV = vec2(0.5, 0.5);
    }
    FragColor = vec4(crtUV, 0.0, 1.0);*/
//    FragColor = texture(Texture, TEX0);
//    FragColor = vec4(TEX0.x, 0.0, 0.0, 1.0);
//    FragColor = texture(Texture, TEX0);
    /*vec3 oricol = texture( Texture, vec2(q.x,q.y) ).xyz;
    vec3 col;
    float x =  sin(0.3*iTime+uv.y*21.0)*sin(0.7*iTime+uv.y*29.0)*sin(0.3+0.33*iTime+uv.y*31.0)*0.0017;

    col.r = texture(Texture,vec2(x+uv.x+0.001,uv.y+0.001)).x+0.05;
    col.g = texture(Texture,vec2(x+uv.x+0.000,uv.y-0.002)).y+0.05;
    col.b = texture(Texture,vec2(x+uv.x-0.002,uv.y+0.000)).z+0.05;
    col.r += 0.08*texture(Texture,0.75*vec2(x+0.025, -0.027)+vec2(uv.x+0.001,uv.y+0.001)).x;
    col.g += 0.05*texture(Texture,0.75*vec2(x+-0.022, -0.02)+vec2(uv.x+0.000,uv.y-0.002)).y;
    col.b += 0.08*texture(Texture,0.75*vec2(x+-0.02, -0.018)+vec2(uv.x-0.002,uv.y+0.000)).z;

    col = clamp(col*0.6+0.4*col*col*1.0,0.0,1.0);

    float vig = (0.0 + 1.0*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
    col *= vec3(pow(vig,0.3));

    col *= vec3(0.95,1.05,0.95);
    col *= 2.8;

    float scans = clamp( 0.35+0.35*sin(3.5*iTime+uv.y*iResolution.y*1.5), 0.0, 1.0);

    float s = pow(scans,1.7);
    col = col*vec3( 0.4+0.7*s) ;

    col *= 1.0+0.01*sin(110.0*iTime);
    if (uv.x < 0.0 || uv.x > 1.0)
    col *= 0.0;
    if (uv.y < 0.0 || uv.y > 1.0)
    col *= 0.0;

    col*=1.0-0.65*vec3(clamp((mod(fragCoord.x, 2.0)-1.0)*2.0,0.0,1.0));

    float comp = smoothstep( 0.1, 0.9, sin(iTime) );

    // Remove the next line to stop cross-fade between original and postprocess
    //	col = mix( col, oricol, comp );

    fragColor = vec4(col,1.0);*/
}
