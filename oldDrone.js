

function createOldDroneMesh() {
const mesh = new THREE.Object3D();

	// Body
	const matBody = new THREE.MeshPhongMaterial({ color: Colors.gray, flatShading: true, side: THREE.DoubleSide });

	const frontUR = [40, 10, -10];
	const frontUL = [40, 10, 10];
	const frontLR = [40, -10, -10];
	const frontLL = [40, -10, 10];
	const backUR = [-40, 8, -8];
	const backUL = [-40, 8, 8];
	const backLR = [-40, -8, -8];
	const backLL = [-40, -8, 8];

	const vertices = new Float32Array(
		utils.makeTetrahedron(frontUL, frontUR, frontLL, frontLR).concat(   // front
		utils.makeTetrahedron(backUL, backUR, backLL, backLR)).concat(      // back
		utils.makeTetrahedron(backUR, backLR, frontUR, frontLR)).concat(    // side
		utils.makeTetrahedron(backUL, backLL, frontUL, frontLL)).concat(    // side
		utils.makeTetrahedron(frontUL, backUL, frontUR, backUR)).concat(    // top
		utils.makeTetrahedron(frontLL, backLL, frontLR, backLR))            // bottom
	);

	const geomBody = new THREE.BufferGeometry();
	geomBody.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

	const body = new THREE.Mesh(geomBody, matBody);
	body.castShadow = true;
	body.receiveShadow = true;
	mesh.add(body);

	// Engine (Back part of the drone)
	const geomEngine = new THREE.BoxGeometry(15, 40, 40, 1, 1, 1);
	const matEngine = new THREE.MeshPhongMaterial({ color: Colors.darkGray, flatShading: true });
	const engine = new THREE.Mesh(geomEngine, matEngine);
	engine.position.set(-45, 0, 0);
	engine.castShadow = true;
	engine.receiveShadow = true;
	mesh.add(engine);

	// Wings
	const geomWing = new THREE.BoxGeometry(10, 5, 150, 1, 1, 1);
	const matWing = new THREE.MeshPhongMaterial({ color: Colors.gray, flatShading: true });
	const wing = new THREE.Mesh(geomWing, matWing);
	wing.position.set(0, 0, 0);
	wing.castShadow = true;
	wing.receiveShadow = true;
	mesh.add(wing);

	// Tail
	const geomTail = new THREE.BoxGeometry(10, 30, 5, 1, 1, 1);
	const matTail = new THREE.MeshPhongMaterial({ color: Colors.gray, flatShading: true });
	const tail = new THREE.Mesh(geomTail, matTail);
	tail.position.set(-40, 10, 0);
	tail.castShadow = true;
	tail.receiveShadow = true;
	mesh.add(tail);

	// Propeller
	const geomPropeller = new THREE.BoxGeometry(10, 5, 5, 1, 1, 1);
	geomPropeller.attributes.position.array[4 * 3 + 1] -= 2.5;
	geomPropeller.attributes.position.array[4 * 3 + 2] += 2.5;
	geomPropeller.attributes.position.array[5 * 3 + 1] -= 2.5;
	geomPropeller.attributes.position.array[5 * 3 + 2] -= 2.5;
	geomPropeller.attributes.position.array[6 * 3 + 1] += 2.5;
	geomPropeller.attributes.position.array[6 * 3 + 2] += 2.5;
	geomPropeller.attributes.position.array[7 * 3 + 1] += 2.5;
	geomPropeller.attributes.position.array[7 * 3 + 2] -= 2.5;
	const matPropeller = new THREE.MeshPhongMaterial({ color: Colors.black, flatShading: true });
	const propeller = new THREE.Mesh(geomPropeller, matPropeller);

	propeller.castShadow = true;
	propeller.receiveShadow = true;

	const geomBlade = new THREE.BoxGeometry(1, 60, 5, 1, 1, 1);
	const matBlade = new THREE.MeshPhongMaterial({ color: Colors.black, flatShading: true });
	const blade1 = new THREE.Mesh(geomBlade, matBlade);
	blade1.position.set(5, 0, 0);

	blade1.castShadow = true;
	blade1.receiveShadow = true;

	const blade2 = blade1.clone();
	blade2.rotation.x = Math.PI / 2;

	blade2.castShadow = true;
	blade2.receiveShadow = true;

	propeller.add(blade1);
	propeller.add(blade2);
	propeller.position.set(-55, 0, 0);
	mesh.add(propeller);

	// Adding shadows to the main mesh
	mesh.castShadow = true;
	mesh.receiveShadow = true;

	// Placeholder for pilot compatibility (military drones do not have visible pilots)
	const pilot = { mesh: new THREE.Object3D() };

	return [mesh, propeller, pilot];
	
}

