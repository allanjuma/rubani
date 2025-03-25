var exports = module.exports = {};

// Import Colors from game.js
var Colors = {
    red: 0xf25346,
    orange: 0xffa500,
    white: 0xd8d0d1,
    brown: 0x59332e,
    brownDark: 0x23190f,
    pink: 0xF5986E,
    yellow: 0xf4ce93,
    blue: 0x68c3c0,
};

// Add utils object
const utils = {
    makeTetrahedron: function (a, b, c, d) {
        return [
            a[0], a[1], a[2],
            b[0], b[1], b[2],
            c[0], c[1], c[2],
            b[0], b[1], b[2],
            c[0], c[1], c[2],
            d[0], d[1], d[2],
        ]
    }
};

// Add Pilot class
class Pilot {
    constructor() {
        this.mesh = new THREE.Object3D()
        this.angleHairs = 0

        var bodyGeom = new THREE.BoxGeometry(15,15,15)
        var bodyMat = new THREE.MeshPhongMaterial({
            color: Colors.brown,
            flatShading: true,
        })
        var body = new THREE.Mesh(bodyGeom, bodyMat)
        body.position.set(2, -12, 0)
        this.mesh.add(body)

        var faceGeom = new THREE.BoxGeometry(10,10,10)
        var faceMat = new THREE.MeshLambertMaterial({color: Colors.pink})
        var face = new THREE.Mesh(faceGeom, faceMat)
        this.mesh.add(face)

        var hairGeom = new THREE.BoxGeometry(4,4,4)
        var hairMat = new THREE.MeshLambertMaterial({color:Colors.brown})
        var hair = new THREE.Mesh(hairGeom, hairMat)
        hair.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0,2,0))
        var hairs = new THREE.Object3D()

        this.hairsTop = new THREE.Object3D()

        for (var i=0; i<12; i++) {
            var h = hair.clone();
            var col = i%3;
            var row = Math.floor(i/3);
            var startPosZ = -4;
            var startPosX = -4;
            h.position.set(startPosX + row*4, 0, startPosZ + col*4);
            h.geometry.applyMatrix4(new THREE.Matrix4().makeScale(1,1,1));
            this.hairsTop.add(h);
        }
        hairs.add(this.hairsTop);

        var hairSideGeom = new THREE.BoxGeometry(12,4,2);
        hairSideGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-6,0,0));
        var hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
        var hairSideL = hairSideR.clone();
        hairSideR.position.set(8,-2,6);
        hairSideL.position.set(8,-2,-6);
        hairs.add(hairSideR);
        hairs.add(hairSideL);

        var hairBackGeom = new THREE.BoxGeometry(2,8,10);
        var hairBack = new THREE.Mesh(hairBackGeom, hairMat);
        hairBack.position.set(-1,-4,0)
        hairs.add(hairBack);
        hairs.position.set(-5,5,0);

        this.mesh.add(hairs);

        var glassGeom = new THREE.BoxGeometry(5,5,5);
        var glassMat = new THREE.MeshLambertMaterial({color:Colors.brown});
        var glassR = new THREE.Mesh(glassGeom,glassMat);
        glassR.position.set(6,0,3);
        var glassL = glassR.clone();
        glassL.position.z = -glassR.position.z

        var glassAGeom = new THREE.BoxGeometry(11,1,11);
        var glassA = new THREE.Mesh(glassAGeom, glassMat);
        this.mesh.add(glassR);
        this.mesh.add(glassL);
        this.mesh.add(glassA);

        var earGeom = new THREE.BoxGeometry(2,3,2);
        var earL = new THREE.Mesh(earGeom,faceMat);
        earL.position.set(0,0,-6);
        var earR = earL.clone();
        earR.position.set(0,0,6);
        this.mesh.add(earL);
        this.mesh.add(earR);
    }
}

exports.createAirplaneMesh = function createAirplaneMesh() {
	const mesh = new THREE.Object3D()

	// Cabin
	var matCabin = new THREE.MeshPhongMaterial({color: Colors.red, flatShading: true, side: THREE.DoubleSide})

	const frontUR = [ 40,  25, -25]
	const frontUL = [ 40,  25,  25]
	const frontLR = [ 40, -25, -25]
	const frontLL = [ 40, -25,  25]
	const backUR  = [-40,  15,  -5]
	const backUL  = [-40,  15,   5]
	const backLR  = [-40,   5,  -5]
	const backLL  = [-40,   5,   5]

	const vertices = new Float32Array(
		utils.makeTetrahedron(frontUL, frontUR, frontLL, frontLR).concat(   // front
		utils.makeTetrahedron(backUL, backUR, backLL, backLR)).concat(      // back
		utils.makeTetrahedron(backUR, backLR, frontUR, frontLR)).concat(    // side
		utils.makeTetrahedron(backUL, backLL, frontUL, frontLL)).concat(    // side
		utils.makeTetrahedron(frontUL, backUL, frontUR, backUR)).concat(    // top
		utils.makeTetrahedron(frontLL, backLL, frontLR, backLR))            // bottom
	)
	const geomCabin = new THREE.BufferGeometry()
	geomCabin.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

	var cabin = new THREE.Mesh(geomCabin, matCabin)
	cabin.castShadow = true
	cabin.receiveShadow = true
	mesh.add(cabin)

	// Engine

	var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
	var matEngine = new THREE.MeshPhongMaterial({color:Colors.white, flatShading:true,});
	var engine = new THREE.Mesh(geomEngine, matEngine);
	//Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
	engine.position.x = 50;
	engine.castShadow = true;
	engine.receiveShadow = true;
	mesh.add(engine);

	// Tail Plane
	var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
	var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:true,});
	var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
	//Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
	tailPlane.position.set(-40,20,0);
	tailPlane.castShadow = true;
	tailPlane.receiveShadow = true;
	mesh.add(tailPlane);

	// Wings

	var geomSideWing = new THREE.BoxGeometry(30,5,120,1,1,1);
	var matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:true,});
	var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
	//Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
	sideWing.position.set(0,15,0);
	sideWing.castShadow = true;
	sideWing.receiveShadow = true;
	mesh.add(sideWing);

	var geomWindshield = new THREE.BoxGeometry(3,15,20,1,1,1);
	var matWindshield = new THREE.MeshPhongMaterial({color:Colors.white,transparent:true, opacity:.3, flatShading:true,});;
	var windshield = new THREE.Mesh(geomWindshield, matWindshield);
	windshield.position.set(20,27,0);

	windshield.castShadow = true;
	windshield.receiveShadow = true;

	mesh.add(windshield);

	var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
	geomPropeller.attributes.position.array[4*3+1] -= 5
	geomPropeller.attributes.position.array[4*3+2] += 5
	geomPropeller.attributes.position.array[5*3+1] -= 5
	geomPropeller.attributes.position.array[5*3+2] -= 5
	geomPropeller.attributes.position.array[6*3+1] += 5
	geomPropeller.attributes.position.array[6*3+2] += 5
	geomPropeller.attributes.position.array[7*3+1] += 5
	geomPropeller.attributes.position.array[7*3+2] -= 5
	var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, flatShading:true,});
	const propeller = new THREE.Mesh(geomPropeller, matPropeller);

	propeller.castShadow = true;
	propeller.receiveShadow = true;

	var geomBlade = new THREE.BoxGeometry(1,80,10,1,1,1);
	var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, flatShading:true,});
	var blade1 = new THREE.Mesh(geomBlade, matBlade);
	//Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
	blade1.position.set(8,0,0);

	blade1.castShadow = true;
	blade1.receiveShadow = true;

	var blade2 = blade1.clone();
	blade2.rotation.x = Math.PI/2;

	blade2.castShadow = true;
	blade2.receiveShadow = true;

	propeller.add(blade1);
	propeller.add(blade2);
	propeller.position.set(60,0,0);
	mesh.add(propeller);

	var wheelProtecGeom = new THREE.BoxGeometry(30,15,10,1,1,1);
	var wheelProtecMat = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:true,});
	var wheelProtecR = new THREE.Mesh(wheelProtecGeom,wheelProtecMat);
	//Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
	wheelProtecR.position.set(25,-20,25);
	mesh.add(wheelProtecR);

	var wheelTireGeom = new THREE.BoxGeometry(24,24,4);
	var wheelTireMat = new THREE.MeshPhongMaterial({color:Colors.brownDark, flatShading:true,});
	var wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
	//Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
	wheelTireR.position.set(25,-28,25);

	var wheelAxisGeom = new THREE.BoxGeometry(10,10,6);
	var wheelAxisMat = new THREE.MeshPhongMaterial({color:Colors.brown, flatShading:true,});
	var wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
	wheelTireR.add(wheelAxis);

	mesh.add(wheelTireR);

	var wheelProtecL = wheelProtecR.clone();
	wheelProtecL.position.z = -wheelProtecR.position.z ;
	mesh.add(wheelProtecL);

	var wheelTireL = wheelTireR.clone();
	wheelTireL.position.z = -wheelTireR.position.z;
	mesh.add(wheelTireL);

	var wheelTireB = wheelTireR.clone();
	wheelTireB.scale.set(.5,.5,.5);
	//Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
	wheelTireB.position.set(-35,-5,0);
	mesh.add(wheelTireB);

	var suspensionGeom = new THREE.BoxGeometry(4,20,4);
	suspensionGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0,10,0))
	var suspensionMat = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:true,});
	var suspension = new THREE.Mesh(suspensionGeom,suspensionMat);
	suspension.position.set(-35,-5,0);
	suspension.rotation.z = -.3;
	mesh.add(suspension)

	const pilot = new Pilot()
	pilot.mesh.position.set(5,27,0)
	mesh.add(pilot.mesh)

	mesh.castShadow = true
	mesh.receiveShadow = true

	return [mesh, propeller, pilot]
}