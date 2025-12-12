BABYLON.Effect.ShadersStore["noiseSkyboxVertexShader"] = `
precision highp float;

attribute vec3 position;
uniform mat4 worldViewProjection;

varying vec3 vPosition;

void main(void) {
    vPosition = position;
    gl_Position = worldViewProjection * vec4(position, 1.0);
}
`;

BABYLON.Effect.ShadersStore["noiseSkyboxFragmentShader"] = `
precision highp float;

uniform float time;
varying vec3 vPosition;

// hash
float hash(vec3 p){
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// noise
float noise(vec3 p){
    vec3 i = floor(p);
    vec3 f = fract(p);

    return mix(
        mix(
            mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x),
        f.y),
        mix(
            mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x),
        f.y),
    f.z);
}

float fbm(vec3 p){
    float v = 0.0;
    float a = 0.5;
    for(int i=0; i<5; i++){
        v += a * noise(p);
        p = p * 2.5 + vec3(1.3, 2.4, 0.7);
        a *= 0.5;
    }
    return v;
}

// vortex
float vortex(vec2 uv, float spin){
    float angle = atan(uv.y, uv.x);
    float r = length(uv);

    angle += spin * (1.0 / max(r, 0.05));
    vec2 p = vec2(cos(angle), sin(angle)) * r;

    float n1 = fbm(vec3(p*3.0, time*0.2));
    float n2 = fbm(vec3(p*6.0 + vec2(1.0,2.0), time*0.4));

    return n1*0.6 + n2*0.4;
}

vec2 riftPos[3];
void initRifts() {
    riftPos[0] = vec2(-0.4, 0.25);
    riftPos[1] = vec2( 0.35, -0.2);
    riftPos[2] = vec2( 0.15, 0.55);
}

void main(){
    initRifts();

    vec3 dir = normalize(vPosition);
    vec2 uv = dir.xz;
    float t = time * 0.3;

    float neb = fbm(vec3(dir*3.0 + time*0.05));

    vec3 deep = vec3(0.01, 0.0, 0.03);
    vec3 purple = vec3(0.45, 0.0, 0.6);
    vec3 blue = vec3(0.2, 0.3, 1.0);

    vec3 col = mix(deep, purple, neb);
    col = mix(col, blue, pow(neb, 2.5));

    for(int i=0; i<3; i++){
        float dist = length(uv - riftPos[i]);
        float pulse = 0.15 + 0.1 * sin(time*4.0 + float(i)*1.7);
        float riftMask = smoothstep(0.35 + pulse, 0.12, dist);

        float spin = (i==0 ? 1.5 : (i==1 ? -2.2 : 0.8));
        float galaxy = vortex((uv - riftPos[i]) * 3.0, spin);

        vec3 universeColor = mix(
            vec3(0.05, 0.1, 0.25),
            vec3(0.8, 0.3, 1.7),
            pow(galaxy, 2.0)
        );

        col = mix(col, universeColor, riftMask);

        float edge = smoothstep(0.18, 0.12, dist);
        col += vec3(1.2, 0.4, 2.0) * edge * 0.7;
    }

    gl_FragColor = vec4(col, 1.0);
}
`;
