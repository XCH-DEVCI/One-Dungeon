// ====================================================================
//  voxelWorld.js   ←  NO EXPORTS!
//  Attached to window so Babylon can call it normally
// ====================================================================

window.buildVoxelWorld = function (scene, voxelMap, TILE_SIZE, BASE_WORLD_OFFSET, wallShader) {
    
    const invisibleMat = new BABYLON.StandardMaterial("invis", scene);
    invisibleMat.alpha = 0;

    const rows = voxelMap.length;
    const cols = voxelMap[0].length;

    // build collision table
    window.voxelSolid = Array.from({ length: rows }, () =>
        Array(cols).fill(false)
    );

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {

            const cell = voxelMap[i][j];
            if (!cell || !cell.height || cell.height <= 0) continue;

            const H = cell.height;

            const x = (j - cols / 2 + 0.5) * TILE_SIZE;
            const z = (i - rows / 2 + 0.5) * TILE_SIZE;

            window.voxelSolid[i][j] = true;

            for (let y = 0; y < H; y++) {

                const cube = BABYLON.MeshBuilder.CreateBox(
                    `v_${i}_${y}_${j}`,
                    { size: TILE_SIZE },
                    scene
                );

                cube.position = new BABYLON.Vector3(
                    x,
                    BASE_WORLD_OFFSET + (y + 0.5) * TILE_SIZE,
                    z
                );

                // top layer = stoneWall shader
                if (y === H - 1) {
                    cube.material = wallShader;
                } else {
                    cube.material = invisibleMat;
                }
            }
        }
    }
};
