var exports = module.exports = {};

exports.createNewDroneMesh = function createNewDroneMesh() {
 const mesh = new THREE.Object3D();

    // Body
    var matBody = new THREE.MeshPhongMaterial({color: Colors.gray, flatShading: true, side: THREE.DoubleSide});
    var geomBody = new THREE.CylinderGeometry(15, 25, 60, 12);
    var body = new THREE.Mesh(geomBody, matBody);
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    mesh.add(body);

    // Wings
    var geomWing = new THREE.BoxGeometry(120, 5, 20);
    var matWing = new THREE.MeshPhongMaterial({color: Colors.gray, flatShading: true});
    var wingLeft = new THREE.Mesh(geomWing, matWing);
    wingLeft.position.set(0, 0, 40);
    wingLeft.castShadow = true;
    wingLeft.receiveShadow = true;
    mesh.add(wingLeft);

    var wingRight = wingLeft.clone();
    wingRight.position.set(0, 0, -40);
    mesh.add(wingRight);

    // Tail
    var geomTail = new THREE.BoxGeometry(30, 10, 5);
    var matTail = new THREE.MeshPhongMaterial({color: Colors.gray, flatShading: true});
    var tail = new THREE.Mesh(geomTail, matTail);
    tail.position.set(-50, 10, 0);
    tail.castShadow = true;
    tail.receiveShadow = true;
    mesh.add(tail);

    // Propeller
    var geomPropeller = new THREE.BoxGeometry(10, 10, 2, 1, 1, 1);
    var matPropeller = new THREE.MeshPhongMaterial({color: Colors.black, flatShading: true});
    const propeller = new THREE.Mesh(geomPropeller, matPropeller);
    propeller.castShadow = true;
    propeller.receiveShadow = true;

    var geomBlade = new THREE.BoxGeometry(1, 80, 10);
    var matBlade = new THREE.MeshPhongMaterial({color: Colors.black, flatShading: true});
    var blade1 = new THREE.Mesh(geomBlade, matBlade);
    blade1.position.set(8, 0, 0);
    blade1.castShadow = true;
    blade1.receiveShadow = true;

    var blade2 = blade1.clone();
    blade2.rotation.x = Math.PI / 2;
    blade2.castShadow = true;
    blade2.receiveShadow = true;

    propeller.add(blade1);
    propeller.add(blade2);
    propeller.position.set(70, 0, 0);
    mesh.add(propeller);

    // Landing Gear
    var geomLeg = new THREE.BoxGeometry(4, 20, 4);
    var matLeg = new THREE.MeshPhongMaterial({color: Colors.gray, flatShading: true});
    var legLeft = new THREE.Mesh(geomLeg, matLeg);
    legLeft.position.set(15, -30, 20);
    legLeft.castShadow = true;
    legLeft.receiveShadow = true;
    mesh.add(legLeft);

    var legRight = legLeft.clone();
    legRight.position.set(15, -30, -20);
    mesh.add(legRight);

    var geomFoot = new THREE.BoxGeometry(10, 2, 10);
    var matFoot = new THREE.MeshPhongMaterial({color: Colors.black, flatShading: true});
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
