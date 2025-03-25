
var exports = module.exports = {};

exports.createColorDroneMesh = function createColorDroneMesh() {
 const mesh = new THREE.Object3D();

    // Colors
    const Colors = {
        gray: 0x777777,
        blue: 0x0000ff,
        red: 0xff0000,
        green: 0x00ff00,
        yellow: 0xffff00,
        white: 0xffffff,
        black: 0x000000,
    };

    // Body
    var matBody = new THREE.MeshPhongMaterial({color: Colors.blue, flatShading: true, side: THREE.DoubleSide});
    var geomBody = new THREE.CylinderGeometry(20, 30, 50, 16);
    var body = new THREE.Mesh(geomBody, matBody);
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    mesh.add(body);

    // Arms
    var geomArm = new THREE.BoxGeometry(10, 10, 80);
    var matArm = new THREE.MeshPhongMaterial({color: Colors.red, flatShading: true});
    var armLeft = new THREE.Mesh(geomArm, matArm);
    armLeft.position.set(0, 0, 50);
    armLeft.castShadow = true;
    armLeft.receiveShadow = true;
    mesh.add(armLeft);

    var armRight = armLeft.clone();
    armRight.position.set(0, 0, -50);
    mesh.add(armRight);

    // Propeller
    var geomPropeller = new THREE.CylinderGeometry(5, 5, 5, 8);
    var matPropeller = new THREE.MeshPhongMaterial({color: Colors.black, flatShading: true});
    const propeller = new THREE.Mesh(geomPropeller, matPropeller);
    propeller.rotation.x = Math.PI / 2;
    propeller.castShadow = true;
    propeller.receiveShadow = true;

    var geomBlade = new THREE.BoxGeometry(2, 40, 5);
    var matBlade = new THREE.MeshPhongMaterial({color: Colors.green, flatShading: true});
    var blade1 = new THREE.Mesh(geomBlade, matBlade);
    blade1.position.set(0, 20, 0);
    blade1.castShadow = true;
    blade1.receiveShadow = true;

    var blade2 = blade1.clone();
    blade2.rotation.y = Math.PI / 2;
    blade2.position.set(20, 0, 0);
    blade2.castShadow = true;
    blade2.receiveShadow = true;

    propeller.add(blade1);
    propeller.add(blade2);
    propeller.position.set(0, 50, 0);
    mesh.add(propeller);

    // Landing Skids
    var geomLeg = new THREE.BoxGeometry(4, 20, 4);
    var matLeg = new THREE.MeshPhongMaterial({color: Colors.yellow, flatShading: true});
    var legLeft = new THREE.Mesh(geomLeg, matLeg);
    legLeft.position.set(15, -30, 20);
    legLeft.castShadow = true;
    legLeft.receiveShadow = true;
    mesh.add(legLeft);

    var legRight = legLeft.clone();
    legRight.position.set(15, -30, -20);
    mesh.add(legRight);

    var geomFoot = new THREE.BoxGeometry(30, 4, 4);
    var matFoot = new THREE.MeshPhongMaterial({color: Colors.white, flatShading: true});
    var footLeft = new THREE.Mesh(geomFoot, matFoot);
    footLeft.position.set(15, -40, 20);
    footLeft.castShadow = true;
    footLeft.receiveShadow = true;
    mesh.add(footLeft);

    var footRight = footLeft.clone();
    footRight.position.set(15, -40, -20);
    mesh.add(footRight);

    const pilot = { mesh: new THREE.Object3D() }; // Placeholder for compatibility

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return [mesh, propeller, pilot];

}