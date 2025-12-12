BABYLON.Effect.ShadersStore["procWallVertexShader"] = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 worldViewProjection;
varying vec2 vUV;
void main(void){
    vUV = uv * 5.0;   // 放大 UV 讓磚較小
    gl_Position = worldViewProjection * vec4(position,1.0);
}
`;

BABYLON.Effect.ShadersStore["procWallFragmentShader"] = `
precision highp float;
varying vec2 vUV;

void main() {
    vec2 uv = vUV;

    // ========================================
    // BRICK GEOMETRY
    // ========================================
    float brickW = 1.0;
    float brickH = 0.5;

    float row = floor(uv.y / brickH);
    float offset = mod(row, 2.0) * (brickW * 0.5);
    uv.x += offset;

    float bx = fract(uv.x / brickW);
    float by = fract(uv.y / brickH);

    // ========================================
    // COLOR DEFINITIONS
    // ========================================
    vec3 HARD_MORTAR = vec3(0.0);      // pure black
    vec3 SOFT_MORTAR = vec3(0.10);     // dark gray
    vec3 BRICK       = vec3(0.05);     // LIGHTER gray interior

    // ========================================
    // HARD MORTAR BORDER (BLACK)
    // ========================================
    float border = 0.03;
    float hardBorder =
        step(bx, border) +
        step(1.0 - bx, border) +
        step(by, border) +
        step(1.0 - by, border);

    // ========================================
    // SOFT BEVEL (INNER SHADING)
    // DARK -> LIGHT → toward center
    // ========================================
    float distX = min(bx, 1.0 - bx);
    float distY = min(by, 1.0 - by);
    float inner = min(distX, distY);

    float bevel = smoothstep(0.18, 0.0, inner);

    vec3 brickWithBevel = mix(SOFT_MORTAR, BRICK, bevel);

    // ========================================
    // HARD BORDER OVERWRITES EVERYTHING
    // ========================================
    vec3 finalColor = mix(brickWithBevel, HARD_MORTAR, clamp(hardBorder, 0.0, 1.0));

    gl_FragColor = vec4(finalColor, 1.0);
}
`;


BABYLON.Effect.ShadersStore["procFloorVertexShader"] = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 worldViewProjection;
varying vec2 vUV;

void main(void){
    // Scale UV but LESS than wall → bricks look LARGER
    vUV = uv * 2.0;   // ← try 1.5, 2.0, 3.0 depending on size you want
    gl_Position = worldViewProjection * vec4(position,1.0);
}
`;

BABYLON.Effect.ShadersStore["procFloorFragmentShader"] = `
precision highp float;
varying vec2 vUV;

float hash(vec2 p){
    return fract(sin(dot(p, vec2(23.1, 91.7))) * 43758.5453);
}

float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    for (int i=0; i<4; i++){
        v += a * noise(p);
        p = p * 2.0 + 3.1;
        a *= 0.5;
    }
    return v;
}

void main(){
    vec2 uv = vUV;

    // Larger brick tiles
    float brickW = 2.0;
    float brickH = 2.0;

    float bx = fract(uv.x / brickW);
    float by = fract(uv.y / brickH);

    // Base stone color
    vec3 brickColor = vec3(0.15, 0.16, 0.17);
    vec2 brickID = floor(vec2(uv.x / brickW, uv.y / brickH));

    float var = fbm(brickID * 1.8);
    brickColor *= 0.85 + var * 0.25;

    float edgeX = min(bx, 1.0 - bx);
    float edgeY = min(by, 1.0 - by);
    float edge = smoothstep(0.0, 0.25, edgeX * edgeY);
    brickColor *= mix(0.8, 1.1, edge);

    gl_FragColor = vec4(brickColor, 1.0);
}
`;
