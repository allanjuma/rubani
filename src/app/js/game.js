var exports = module.exports = {};
let addExtraGun = true;
let world;

var ui;
var Colors;
let wakeLock = null;

// Global variables
let scene, camera, renderer;
let sea, sea2, airplane;
let game;
let worldConfig;

//var cam = require('../js/colorDrone');
//var cam = require('../js/newDrone');
//var cam = require('../js/oldDrone');
var cam = require('../js/airplane');

const utils = {
	normalize: function (v, vmin, vmax, tmin, tmax) {
		var nv = Math.max(Math.min(v,vmax), vmin)
		var dv = vmax-vmin
		var pc = (nv-vmin)/dv
		var dt = tmax-tmin
		var tv = tmin + (pc*dt)
		return tv
	},

	findWhere: function (list, properties) {
		for (const elem of list) {
			let all = true
			for (const key in properties) {
				if (elem[key] !== properties[key]) {
					all = false
					break
				}
			}
			if (all) {
				return elem
			}
		}
		return null
	},

	randomOneOf: function (choices) {
		return choices[Math.floor(Math.random() * choices.length)]
	},

	randomFromRange: function (min, max) {
		return min + Math.random() * (max - min)
	},

	collide: function (mesh1, mesh2, tolerance) {
		const diffPos = mesh1.position.clone().sub(mesh2.position.clone())
		const d = diffPos.length()
		return d < tolerance
	},

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
}


function getBitsOpt(aKey) {
    var pairs = window.location.hash.slice(1).split("&");
    for (var i = 0, aKey = aKey; i < pairs.length; ++i) {
        var key = pairs[i].split("=")[0];
        var value = pairs[i].split("=")[1];
        if (key == aKey) {
            return value;
        }
    }
}









class SceneManager {
	constructor() {
		this.list = new Set()
	}

	add(obj) {
		scene.add(obj.mesh)
		this.list.add(obj)
	}

	remove(obj) {
		scene.remove(obj.mesh)
		this.list.delete(obj)
	}

	clear() {
		for (const entry of this.list) {
			this.remove(entry)
		}
	}

	tick(deltaTime) {
		for (const entry of this.list) {
			if (entry.tick) {
				entry.tick(deltaTime)
			}
		}
	}
}



const sceneManager = new SceneManager()




class LoadingProgressManager {
	constructor() {
		this.promises = []
	}

	add(promise) {
		this.promises.push(promise)
	}

	then(callback) {
		return Promise.all(this.promises).then(callback)
	}

	catch(callback) {
		return Promise.all(this.promises).catch(callback)
	}
}

const loadingProgressManager = new LoadingProgressManager()




class AudioManager {
	constructor() {
		this.buffers = {}
		this.loader = new THREE.AudioLoader()
		this.listener = new THREE.AudioListener()
		this.categories = {}
	}

	setCamera(camera) {
		camera.add(this.listener)
	}

	load(soundId, category, path) {
		const promise = new Promise((resolve, reject) => {
			this.loader.load(path,
				(audioBuffer) => {
					this.buffers[soundId] = audioBuffer
					if (category !== null) {
						if (!this.categories[category]) {
							this.categories[category] = []
						}
						this.categories[category].push(soundId)
					}
					resolve()
				},
				() => {},
				reject
			)
		})
		loadingProgressManager.add(promise)
	}

	play(soundIdOrCategory, options) {
		options = options || {}

		let soundId = soundIdOrCategory
		const category = this.categories[soundIdOrCategory]
		if (category) {
			soundId = utils.randomOneOf(category)
		}

		const buffer = this.buffers[soundId]
		const sound = new THREE.Audio(this.listener)
		sound.setBuffer(buffer)
		if (options.loop) {
			sound.setLoop(true)
		}
		if (options.volume) {
			sound.setVolume(options.volume)
		}
		sound.play()
	}
}

const audioManager = new AudioManager()




class ModelManager {
	constructor(path) {
		this.path = path
		this.models = {}
	}

	load(modelName) {
		const promise = new Promise((resolve, reject) => {
			const loader = new THREE.OBJLoader()
			loader.load(this.path+'/'+modelName+'.obj', (obj) => {
				this.models[modelName] = obj
				resolve()
			}, function() {}, reject)
		})
		loadingProgressManager.add(promise)
	}

	get(modelName) {
		if (typeof this.models[modelName] === 'undefined') {
			throw new Error("Can't find model "+modelName)
		}
		return this.models[modelName]
	}
}

const modelManager = new ModelManager('/assets/models')








Colors = {
	red: 0xf25346,
	orange: 0xffa500,
	white: 0xd8d0d1,
	brown: 0x59332e,
	brownDark: 0x23190f,
	pink: 0xF5986E,
	yellow: 0xf4ce93,
	blue: 0x68c3c0,
}

const COLOR_COINS = 0xFFD700 // 0x009999
const COLOR_COLLECTIBLE_BUBBLE = COLOR_COINS



///////////////
// GAME VARIABLES
var canDie = true
var newTime = new Date().getTime()
var oldTime = new Date().getTime()




let sky


//SCREEN & MOUSE VARIABLES
var MAX_WORLD_X=1000




//INIT THREE JS, SCREEN AND MOUSE EVENTS
function createScene() {



	ui = new UI(exports.startMap)
	loadingProgressManager
		.catch((err) => {
			ui.showError(err.message)
		})
		
    //
	// 
	scene = new THREE.Scene()
	camera = new THREE.PerspectiveCamera(50, ui.width/ui.height, 0.1, 10000)
	audioManager.setCamera(camera)
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950)

	renderer = new THREE.WebGLRenderer({canvas: ui.canvas, alpha: true, antialias: true})
	renderer.setSize(ui.width, ui.height)
	renderer.setPixelRatio(window.devicePixelRatio? window.devicePixelRatio : 1)

	renderer.shadowMap.enabled = true


	function setupCamera() {
		renderer.setSize(ui.width, ui.height)
		camera.aspect = ui.width / ui.height
		camera.updateProjectionMatrix()

		// setTimeout(() => {
		// 	const rayCaster = new THREE.Raycaster()
		// 	rayCaster.setFromCamera(new THREE.Vector2(1, 1), camera)
		// 	const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
		// 	const intersectPoint = new THREE.Vector3()
		// 	rayCaster.ray.intersectPlane(plane, intersectPoint)
		// 	console.log('max world x:', intersectPoint.x)
		// 	// MAX_WORLD_X = intersectPoint.x  doesn't work with first person view
		// }, 500)
	}

	setupCamera()
	ui.onResize(setupCamera)

	// const controls = new THREE.OrbitControls(camera, renderer.domElement)
	// controls.minPolarAngle = -Math.PI / 2
	// controls.maxPolarAngle = Math.PI
	// controls.addEventListener('change', () => {
	// 	console.log('camera changed', 'camera=', camera.position, ', airplane=', airplane.position, 'camera.rotation=', camera.rotation)
	// })
	// setTimeout(() => {
	// 	camera.lookAt(airplane.mesh.position)
	// 	controls.target.copy(airplane.mesh.position)
	// }, 100)

	// controls.noZoom = true
	//controls.noPan = true

	// handleWindowResize()
}




// LIGHTS
var ambientLight

function createLights() {
	const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	ambientLight = new THREE.AmbientLight(0xdc8874, .5)
	const shadowLight = new THREE.DirectionalLight(0xffffff, .9)
	shadowLight.position.set(150, 350, 350)
	shadowLight.castShadow = true
	shadowLight.shadow.camera.left = -400
	shadowLight.shadow.camera.right = 400
	shadowLight.shadow.camera.top = 400
	shadowLight.shadow.camera.bottom = -400
	shadowLight.shadow.camera.near = 1
	shadowLight.shadow.camera.far = 1000
	shadowLight.shadow.mapSize.width = 4096
	shadowLight.shadow.mapSize.height = 4096

	scene.add(hemisphereLight)
	scene.add(shadowLight)
	scene.add(ambientLight)
}




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


	updateHairs(deltaTime) {
		var hairs = this.hairsTop.children
		var l = hairs.length
		for (var i=0; i<l; i++) {
			var h = hairs[i]
			h.scale.y = .75 + Math.cos(this.angleHairs+i/3)*.25
		}
		this.angleHairs += game.speed * deltaTime * 40
	}
}





// GUNS
class SimpleGun {
	constructor() {
		this.mesh = SimpleGun.createMesh()
		this.mesh.position.z = 28
		this.mesh.position.x = 25
		this.mesh.position.y = -8
	}

	static createMesh() {
		const metalMaterial = new THREE.MeshStandardMaterial({color: 0x222222, flatShading: true, roughness: 0.5, metalness: 1.0})
		const BODY_RADIUS = 3
		const BODY_LENGTH = 20
		const full = new THREE.Group()
		const body = new THREE.Mesh(
			new THREE.CylinderGeometry(BODY_RADIUS, BODY_RADIUS, BODY_LENGTH),
			metalMaterial,
		)
		body.rotation.z = Math.PI/2
		full.add(body)

		const barrel = new THREE.Mesh(
			new THREE.CylinderGeometry(BODY_RADIUS/2, BODY_RADIUS/2, BODY_LENGTH),
			metalMaterial,
		)
		barrel.rotation.z = Math.PI/2
		barrel.position.x = BODY_LENGTH
		full.add(barrel)
		return full
	}

	downtime() {
		return 0.1
	}

	damage() {
		return 1
	}

	shoot(direction) {
		const BULLET_SPEED = 0.5
		const RECOIL_DISTANCE = 4
		const RECOIL_DURATION = this.downtime() / 1.5

		const position = new THREE.Vector3()
		this.mesh.getWorldPosition(position)
		position.add(new THREE.Vector3(15, 0, 0))
		spawnProjectile(this.damage(), position, direction, BULLET_SPEED, 0.3, 3)

		// Little explosion at exhaust
		spawnParticles(position.clone().add(new THREE.Vector3(2,0,0)), 1, Colors.orange, 0.2)

		// audio
		audioManager.play('shot-soft')

		// Recoil of gun
		const initialX = this.mesh.position.x
		TweenMax.to(this.mesh.position, {
			duration: RECOIL_DURATION/2,
			x: initialX - RECOIL_DISTANCE,
			onComplete: () => {
				TweenMax.to(this.mesh.position, {
					duration: RECOIL_DURATION/2,
					x: initialX,
				})
			},
		})
	}
}




class DoubleGun {
	constructor() {
		this.gun1 = new SimpleGun()
		this.gun2 = new SimpleGun()
		this.gun2.mesh.position.add(new THREE.Vector3(0, 14, 0))
		this.mesh = new THREE.Group()
		this.mesh.add(this.gun1.mesh)
		this.mesh.add(this.gun2.mesh)
	}

	downtime() {
		return 0.15
	}

	damage() {
		return this.gun1.damage() + this.gun2.damage()
	}

	shoot(direction) {
		this.gun1.shoot(direction)
		this.gun2.shoot(direction)
	}
}




class BetterGun {
	constructor() {
		this.mesh = BetterGun.createMesh()
		this.mesh.position.z = 28
		this.mesh.position.x = -3
		this.mesh.position.y = -5
	}

	static createMesh() {
		const metalMaterial = new THREE.MeshStandardMaterial({color: 0x222222, flatShading: true, roughness: 0.5, metalness: 1.0})
		const BODY_RADIUS = 5
		const BODY_LENGTH = 30
		const full = new THREE.Group()
		const body = new THREE.Mesh(
			new THREE.CylinderGeometry(BODY_RADIUS, BODY_RADIUS, BODY_LENGTH),
			metalMaterial,
		)
		body.rotation.z = Math.PI/2
		body.position.x = BODY_LENGTH/2
		full.add(body)

		const BARREL_RADIUS = BODY_RADIUS/2
		const BARREL_LENGTH = BODY_LENGTH * 0.66
		const barrel = new THREE.Mesh(
			new THREE.CylinderGeometry(BARREL_RADIUS, BARREL_RADIUS, BARREL_LENGTH),
			metalMaterial,
		)
		barrel.rotation.z = Math.PI/2
		barrel.position.x = BODY_LENGTH + BARREL_LENGTH/2
		full.add(barrel)

		const TIP_RADIUS = BARREL_RADIUS * 1.3
		const TIP_LENGTH = BODY_LENGTH/4
		const tip = new THREE.Mesh(
			new THREE.CylinderGeometry(TIP_RADIUS, TIP_RADIUS, TIP_LENGTH),
			metalMaterial,
		)
		tip.rotation.z = Math.PI/2
		tip.position.x = BODY_LENGTH + BARREL_LENGTH + TIP_LENGTH/2
		full.add(tip)
		return full
	}

	downtime() {
		return 0.1
	}

	damage() {
		return 5
	}

	shoot(direction) {
		const BULLET_SPEED = 0.5
		const RECOIL_DISTANCE = 4
		const RECOIL_DURATION = this.downtime() / 3

		// position = position.clone().add(new THREE.Vector3(11.5, -1.3, 7.5))
		const position = new THREE.Vector3()
		this.mesh.getWorldPosition(position)
		position.add(new THREE.Vector3(12, 0, 0))
		spawnProjectile(this.damage(), position, direction, BULLET_SPEED, 0.8, 6)

		// Little explosion at exhaust
		spawnParticles(position.clone().add(new THREE.Vector3(2,0,0)), 3, Colors.orange, 0.5)

		// audio
		audioManager.play('shot-hard')

		// Recoil of gun
		const initialX = this.mesh.position.x
		TweenMax.to(this.mesh.position, {
			duration: RECOIL_DURATION,
			x: initialX - RECOIL_DISTANCE,
			onComplete: () => {
				TweenMax.to(this.mesh.position, {
					duration: RECOIL_DURATION,
					x: initialX,
				})
			},
		})
	}
}




class Airplane {
	constructor() {
		//const [mesh, propeller, pilot] = createAirplaneMesh()
		const [mesh, propeller, pilot] = cam.createAirplaneMesh()
		//const [mesh, propeller, pilot] = createOldDroneMesh()
		
		this.mesh = mesh
		this.propeller = propeller
		this.pilot = pilot
		this.weapon = null
		this.lastShot = 0
	}


	equipWeapon(weapon) {
		if (this.weapon) {
			this.mesh.remove(this.weapon.mesh)
		}
		this.weapon = weapon
		if (this.weapon) {
			this.mesh.add(this.weapon.mesh)
			
			// Add recoil when gun loaded
			
			 const recoilForce = this.weapon.damage()
		TweenMax.to(this.mesh.position, {
			duration: 0.05,
			x: this.mesh.position.x - recoilForce,
		})

			
		}
	}


	shoot() {
		if (!this.weapon) {
			return
		}

		// rate-limit the shooting
		const nowTime = new Date().getTime() / 1000
		const ready = nowTime-this.lastShot > this.weapon.downtime()
		if (!ready) {
			return
		}
		this.lastShot = nowTime

		// fire the shot
		let direction = new THREE.Vector3(10, 0, 0)
		direction.applyEuler(airplane.mesh.rotation)
		this.weapon.shoot(direction)

		// recoil airplane
		try{
		    const recoilForce = this.weapon.damage()
		TweenMax.to(this.mesh.position, {
			duration: 0.05,
			x: this.mesh.position.x - recoilForce,
		})
		}catch(e){
		    // no weapon
		    // already removed
		}
		
	}


	tick(deltaTime) {
		this.propeller.rotation.x += 0.2 + game.speed * deltaTime*.005

		//Math.PI/2

		

		if (game.status === 'playing') {
			game.planeSpeed = utils.normalize(ui.mousePos.x, -0.5, 0.5, worldConfig.planeMinSpeed, worldConfig.planeMaxSpeed)
			let targetX = utils.normalize(ui.mousePos.x, -1, 1, -worldConfig.planeAmpWidth*0.7, -worldConfig.planeAmpWidth)
			let targetY = utils.normalize(ui.mousePos.y, -0.75, 0.75, worldConfig.planeDefaultHeight-worldConfig.planeAmpHeight, worldConfig.planeDefaultHeight+worldConfig.planeAmpHeight)

			game.planeCollisionDisplacementX += game.planeCollisionSpeedX
			targetX += game.planeCollisionDisplacementX

			game.planeCollisionDisplacementY += game.planeCollisionSpeedY
			targetY += game.planeCollisionDisplacementY

			//this.mesh.position.z += (targetX - this.mesh.position.z) * deltaTime * world.planeMoveSensivity
			this.mesh.position.x += (targetX - this.mesh.position.x) * deltaTime * worldConfig.planeMoveSensivity
			this.mesh.position.y += (targetY - this.mesh.position.y) * deltaTime * worldConfig.planeMoveSensivity

			this.mesh.rotation.x = (this.mesh.position.y - targetY) * deltaTime * worldConfig.planeRotZSensivity
			this.mesh.rotation.z = (targetY - this.mesh.position.y) * deltaTime * worldConfig.planeRotXSensivity

			if (game.fpv) {
				
				camera.position.y = this.mesh.position.y + 20
				camera.position.z = this.mesh.position.z - 0
				 camera.setRotationFromEuler(new THREE.Euler(-1.490248, -1.4124514, -1.48923231))
				 camera.updateProjectionMatrix ()
				 
			} else {
				camera.fov = utils.normalize(ui.mousePos.x, -30, 1, 40, 80)
				camera.updateProjectionMatrix()
				camera.position.y += (this.mesh.position.y - camera.position.y) * deltaTime * worldConfig.cameraSensivity
			}
		}

		game.planeCollisionSpeedX += (0-game.planeCollisionSpeedX)*deltaTime * 0.03;
		game.planeCollisionDisplacementX += (0-game.planeCollisionDisplacementX)*deltaTime *0.01;
		game.planeCollisionSpeedY += (0-game.planeCollisionSpeedY)*deltaTime * 0.03;
		game.planeCollisionDisplacementY += (0-game.planeCollisionDisplacementY)*deltaTime *0.01;

		try{
			this.pilot.updateHairs(deltaTime)
		}catch(err){
			//console.log(err)
		}
		
	}


	gethit(position) {
		const diffPos = this.mesh.position.clone().sub(position)
		const d = diffPos.length()
		game.planeCollisionSpeedX = 100 * diffPos.x / d
		game.planeCollisionSpeedY = 100 * diffPos.y / d
		ambientLight.intensity = 2
		audioManager.play('airplane-crash')
	}
}




function rotateAroundSea(object, deltaTime, speed) {
	object.angle += deltaTime * game.speed * speed
	if (object.angle > Math.PI*2) {
		object.angle -= Math.PI*2
	}
	object.mesh.position.x = Math.cos(object.angle) * object.distance
	object.mesh.position.y = -worldConfig.seaRadius + Math.sin(object.angle) * object.distance
}




class Collectible {
	constructor(mesh, onApply) {
		this.angle = 0
		this.distance = 0
		this.onApply = onApply

		this.mesh = new THREE.Object3D()
		const bubble = new THREE.Mesh(
			new THREE.SphereGeometry(10, 100, 100),
			new THREE.MeshPhongMaterial({
				color: COLOR_COLLECTIBLE_BUBBLE,
				transparent: true,
				opacity: .4,
				flatShading: true,
			})
		)
		this.mesh.add(bubble)
		this.mesh.add(mesh)
		this.mesh.castShadow = true

		// for the angle:
		//   Math.PI*2 * 0.0  => on the right side of the sea cylinder
		//   Math.PI*2 * 0.1  => on the top right
		//   Math.PI*2 * 0.2  => directly in front of the plane
		//   Math.PI*2 * 0.3  => directly behind the plane
		//   Math.PI*2 * 0.4  => on the top left
		//   Math.PI*2 * 0.5  => on the left side
		this.angle = Math.PI*2 * 0.1
		this.distance = worldConfig.seaRadius + worldConfig.planeDefaultHeight + (-1 + 2*Math.random()) * (worldConfig.planeAmpHeight-20)
		this.mesh.position.y = -worldConfig.seaRadius + Math.sin(this.angle) * this.distance
		this.mesh.position.x = Math.cos(this.angle) * this.distance
		
		sceneManager.add(this)
	}


	tick(deltaTime) {
		rotateAroundSea(this, deltaTime, worldConfig.collectiblesSpeed)

		// rotate collectible for visual effect
		this.mesh.rotation.y += deltaTime * 0.002 * Math.random()
		this.mesh.rotation.z += deltaTime * 0.002 * Math.random()

		// collision?
		if (utils.collide(airplane.mesh, this.mesh, worldConfig.collectibleDistanceTolerance)) {
			this.onApply()
			this.explode()
		}
		// passed-by?
		else if (this.angle > Math.PI) {
			sceneManager.remove(this)
		}
	}


	explode() {
		spawnParticles(this.mesh.position.clone(), 15, COLOR_COLLECTIBLE_BUBBLE, 3)
		sceneManager.remove(this)
		audioManager.play('bubble')

		const DURATION = 1

		setTimeout(() => {
			const itemMesh = new THREE.Group()
			for (let i=1; i<this.mesh.children.length; i+=1) {
				itemMesh.add(this.mesh.children[i])
			}
			scene.add(itemMesh)
			itemMesh.position.y = 120
			itemMesh.position.z = 50

			const initialScale = itemMesh.scale.clone()
			TweenMax.to(itemMesh.scale, {
				duration: DURATION / 2,
				x: initialScale.x * 4,
				y: initialScale.y * 4,
				z: initialScale.z * 4,
				ease: 'Power2.easeInOut',
				onComplete: () => {
					TweenMax.to(itemMesh.scale, {
						duration: DURATION / 2,
						x: 0,
						y: 0,
						z: 0,
						ease: 'Power2.easeInOut',
						onComplete: () => {
							scene.remove(itemMesh)
						},
					})
				},
			})
		}, 200)
	}
}


function spawnSimpleGunCollectible() {
	const gun = SimpleGun.createMesh()
	gun.scale.set(0.25, 0.25, 0.25)
	gun.position.x = -2

	new Collectible(gun, () => {
		airplane.equipWeapon(new SimpleGun())
		audioManager.play('guncock1') 
		
	})
}


function spawnBetterGunCollectible() {
	const gun = BetterGun.createMesh()
	gun.scale.set(0.25, 0.25, 0.25)
	gun.position.x = -7

	new Collectible(gun, () => {
		airplane.equipWeapon(new BetterGun())
		audioManager.play('guncock3') 
		game.statistics.shotsFired = 0
	})
}


function spawnDoubleGunCollectible() {
	const guns = new THREE.Group()

	const gun1 = SimpleGun.createMesh()
	gun1.scale.set(0.25, 0.25, 0.25)
	gun1.position.x = -2
	gun1.position.y = -2
	guns.add(gun1)

	const gun2 = SimpleGun.createMesh()
	gun2.scale.set(0.25, 0.25, 0.25)
	gun2.position.x = -2
	gun2.position.y = 2
	guns.add(gun2)

	new Collectible(guns, () => {
		airplane.equipWeapon(new DoubleGun())
		audioManager.play('guncock2') 
	})
}


function spawnLifeCollectible() {
	const heart = modelManager.get('heart')
	heart.traverse(function (child) {
		if (child instanceof THREE.Mesh) {
			child.material.color.setHex(0xFF0000)
		}
	})
	heart.position.set(0, -1, -3)
	heart.scale.set(5, 5, 5)

	new Collectible(heart, () => {
		addLife()
		//audioManager.play('heart') 
	})
}






class Cloud {
	constructor() {
		this.mesh = new THREE.Object3D()
		const geom = new THREE.BoxGeometry(20, 20, 20)
		const mat = new THREE.MeshPhongMaterial({
			color: Colors.white,
		})
		const nBlocs = 3+Math.floor(Math.random()*3)
		for (let i=0; i<nBlocs; i++) {
			const m = new THREE.Mesh(geom.clone(), mat)
			m.position.x = i*15
			m.position.y = Math.random()*10
			if(game.fpv){
			m.position.z = randomInteger(-45, -105)
		}else{
			m.position.z = Math.random()*10
		}
			
			m.rotation.y = Math.random()*Math.PI*2
			m.rotation.z = Math.random()*Math.PI*2
			const s = 0.1 + Math.random()*0.9
			m.scale.set(s, s, s)
			this.mesh.add(m)
			m.castShadow = true
			m.receiveShadow = true

		}
	}

	tick(deltaTime) {
		const l = this.mesh.children.length
		for(let i=0; i<l; i++) {
			let m = this.mesh.children[i]
			m.rotation.y += Math.random() * 0.002*(i+1)
			m.rotation.z += Math.random() * 0.005*(i+1)
		}
	}
}







const COLOR_SEA_LEVEL = [
	0x68c3c0,  // hsl(178deg 43% 59%)
	0x47b3af,  // hsl(178deg 43% 49%)
	0x398e8b,  // hsl(178deg 43% 39%)
	0x2a6a68,  // hsl(178deg 43% 29%)
	0x1c4544,  // hsl(178deg 43% 19%)
	0x0d2120,  // hsl(178deg 43% 09%)
]





function spawnParticles(pos, count, color, scale) {
	for (let i=0; i<count; i++) {
		const geom = new THREE.TetrahedronGeometry(3, 0)
		const mat = new THREE.MeshPhongMaterial({
			color: 0x009999,
			shininess: 0,
			specular: 0xffffff,
			flatShading: true,
		})
		const mesh = new THREE.Mesh(geom, mat)
		scene.add(mesh)

		mesh.visible = true
		mesh.position.copy(pos)
		mesh.material.color = new THREE.Color(color)
		mesh.material.needsUpdate = true
		mesh.scale.set(scale, scale, scale)
		const targetX = pos.x + (-1 + Math.random()*2)*50
		const targetY = pos.y + (-1 + Math.random()*2)*50
		const targetZ = pos.z + (-1 + Math.random()*2)*50
		const speed = 0.6 + Math.random()*0.2
		TweenMax.to(mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12})
		TweenMax.to(mesh.scale, speed, {x:.1, y:.1, z:.1})
		TweenMax.to(mesh.position, speed, {x:targetX, y:targetY, z: targetZ, delay:Math.random() *.1, ease:Power2.easeOut, onComplete: () => {
			scene.remove(mesh)
		}})
	}
}



// ENEMIES
class Enemy {
	constructor() {
		var geom = new THREE.TetrahedronGeometry(8, 2)
		var mat = new THREE.MeshPhongMaterial({
			color: Colors.red,
			shininess: 0,
			specular: 0xffffff,
			flatShading: true,
		})
		this.mesh = new THREE.Mesh(geom, mat)
		this.mesh.castShadow = true
		this.angle = 0
		this.distance = 0
		this.hitpoints = 3
		sceneManager.add(this)
	}


	tick(deltaTime) {
		rotateAroundSea(this, deltaTime, worldConfig.enemiesSpeed)
		this.mesh.rotation.y += Math.random() * 0.1
		this.mesh.rotation.z += Math.random() * 0.1

		// collision?
		if (utils.collide(airplane.mesh, this.mesh, worldConfig.enemyDistanceTolerance) && game.status!=='finished') {
			this.explode()
			airplane.gethit(this.mesh.position)
			removeLife()
		}
		// passed-by?
		else if (this.angle > Math.PI) {
			sceneManager.remove(this)
		}

		const thisAabb = new THREE.Box3().setFromObject(this.mesh)
		for (const projectile of allProjectiles) {
			const projectileAabb = new THREE.Box3().setFromObject(projectile.mesh)
			if (thisAabb.intersectsBox(projectileAabb)) {
				spawnParticles(projectile.mesh.position.clone(), 5, Colors.brownDark, 1)
				projectile.remove()
				this.hitpoints -= projectile.damage
				audioManager.play('bullet-impact', {volume: 0.3})
			}
		}
		if (this.hitpoints <= 0) {
			this.explode()
		}
	}


	explode() {
		audioManager.play('rock-shatter', {volume: 3});
		if ("vibrate" in navigator) {
  //
		navigator.vibrate([100, 30, 100, 30, 200])
		}
		spawnParticles(this.mesh.position.clone(), 15, Colors.red, 3)
		sceneManager.remove(this)
		game.statistics.enemiesKilled += 1
	}
}


function spawnEnemies(count) {
	for (let i=0; i<count; i++) {
		const enemy = new Enemy()
		enemy.angle = - (i*0.1)
		enemy.distance = worldConfig.seaRadius + worldConfig.planeDefaultHeight + (-1 + Math.random() * 2) * (worldConfig.planeAmpHeight-20)
		//
		enemy.mesh.position.x = Math.cos(enemy.angle) * enemy.distance
		enemy.mesh.position.y = -worldConfig.seaRadius + Math.sin(enemy.angle)*enemy.distance

	}
	game.statistics.enemiesSpawned += count
	
	
}





// COINS
class Coin {
	constructor() {
		var geom = new THREE.CylinderGeometry(4, 4, 1, 10)
		var mat = new THREE.MeshPhongMaterial({
			color: COLOR_COINS,
			shininess: 1,
			specular: 0xffffff,
			flatShading: true,
		});
		this.mesh = new THREE.Mesh(geom, mat)
		this.mesh.castShadow = true
		this.angle = 0
		this.dist = 0
		sceneManager.add(this)
	}


	tick(deltaTime) {
		rotateAroundSea(this, deltaTime, worldConfig.coinsSpeed)

		this.mesh.rotation.z += Math.random() * 0.1
		this.mesh.rotation.y += Math.random() * 0.1

		// collision?
		if (utils.collide(airplane.mesh, this.mesh, worldConfig.coinDistanceTolerance)) {
			spawnParticles(this.mesh.position.clone(), 5, COLOR_COINS, 0.8);
			addCoin()
			audioManager.play('coin', {volume: 0.5})
			if ("vibrate" in navigator) {
  //
		    navigator.vibrate(100)
			}
			sceneManager.remove(this)
		}
		// passed-by?
		else if (this.angle > Math.PI) {
			sceneManager.remove(this)
		}
	}
}



function spawnCoins() {
    
    // READ AS VALUE SPAWNED
    // max spawned
    //
    if(game.statistics.coinsSpawned >= game.maxCoins){
        
        //cant spawn more coins!!
        
					game.status = 'finished'
					setFollowView()
					ui.showScoreScreen()
		if ("vibrate" in navigator) {
  //
					navigator.vibrate([100, 30, 100, 30, 200, 100, 30, 200, 100, 30, 500])
		}
    }else{
    
    
	//const nCoins = 1 + Math.floor(Math.random()*2);
	const nCoins = randomInteger(1, 3);
	const d = worldConfig.seaRadius + worldConfig.planeDefaultHeight + utils.randomFromRange(-1,1) * (worldConfig.planeAmpHeight-20);
	const amplitude = 10 + Math.round(Math.random()*10);
	
	for (let i=0; i<nCoins; i++) {
		const coin = new Coin()
		coin.angle = - (i*0.05)
		coin.distance = d + Math.cos(i*0.7)*amplitude
		coin.mesh.position.y = -worldConfig.seaRadius + Math.sin(coin.angle)*coin.distance
		coin.mesh.position.x = Math.cos(coin.angle) * coin.distance
		
	}
	
	// Add value of coin based on the level multiplier
	game.statistics.coinsSpawned += (nCoins*game.level);
	
    }
}




// SHOOTING
let allProjectiles = []


class Projectile {
	constructor(damage, initialPosition, direction, speed, radius, length) {
		const PROJECTILE_COLOR = Colors.orange  // 0x333333

		this.damage = damage
		this.mesh = new THREE.Mesh(
			new THREE.CylinderGeometry(radius, radius, length),
			new THREE.LineBasicMaterial({color: PROJECTILE_COLOR})
		)
		this.mesh.position.copy(initialPosition)
		this.mesh.rotation.z = Math.PI/2
		this.direction = direction.clone()
		this.direction.setLength(1)
		this.speed = speed
		sceneManager.add(this)

		game.statistics.shotsFired += 1
		
		
	if (game.statistics.shotsFired == 15){
		    
	    airplane.equipWeapon(null)
	
	    game.statistics.shotsLeft = 10 - game.statistics.shotsFired
	
	    game.statistics.shotsFired = 0
		    
	}
	
	}

	tick(deltaTime) {
		this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * deltaTime))
		this.mesh.position.z *= 0.9
		// out of screen? => remove
		if (this.mesh.position.x > MAX_WORLD_X) {
			this.remove()
		}
	}

	remove() {
		sceneManager.remove(this)
		allProjectiles.splice(allProjectiles.indexOf(this), 1)
	}
}


function spawnProjectile(damage, initialPosition, direction, speed, radius, length) {
	allProjectiles.push(new Projectile(damage, initialPosition, direction, speed, radius, length))
}




// 3D Models
function createPlane() {
	airplane = new Airplane()
	airplane.mesh.scale.set(.25,.25,.25)
	airplane.mesh.position.y = worldConfig.planeDefaultHeight
	scene.add(airplane.mesh)
}


function createSea() {

	class Sea {
		constructor() {
			var geom = new THREE.CylinderGeometry(worldConfig.seaRadius, worldConfig.seaRadius, worldConfig.seaLength, 40, 10)
			geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2))
			this.waves = [];
			const arr = geom.attributes.position.array
			for (let i=0; i<arr.length/3; i++) {
				this.waves.push({
					x: arr[i*3+0],
					y: arr[i*3+1],
					z: arr[i*3+2],
					ang: Math.random()*Math.PI*2,
					amp: worldConfig.wavesMinAmp + Math.random()*(worldConfig.wavesMaxAmp-worldConfig.wavesMinAmp),
					speed: worldConfig.wavesMinSpeed + Math.random()*(worldConfig.wavesMaxSpeed - worldConfig.wavesMinSpeed)
				})
			}
			var mat = new THREE.MeshPhongMaterial({
				color: COLOR_SEA_LEVEL[0],
				transparent: true,
				opacity: 0.8,
				flatShading: true,
			})
			this.mesh = new THREE.Mesh(geom, mat)
			this.mesh.receiveShadow = true
		}
	
		tick(deltaTime) {
			var arr = this.mesh.geometry.attributes.position.array
			for (let i=0; i<arr.length/3; i++) {
				var wave = this.waves[i]
				arr[i*3+0] = wave.x + Math.cos(wave.ang) * wave.amp
				arr[i*3+1] = wave.y + Math.sin(wave.ang) * wave.amp
				wave.ang += wave.speed * deltaTime
			}
			this.mesh.geometry.attributes.position.needsUpdate = true
		}
	
		updateColor() {
			this.mesh.material = new THREE.MeshPhongMaterial({
				color: COLOR_SEA_LEVEL[(game.level - 1) % COLOR_SEA_LEVEL.length],
				transparent: true,
				opacity: .8,
				flatShading: true,
			})
		}
	}
	
	
	// We create a second sea that is not animated because the animation of our our normal sea leaves holes at certain points and I don't know how to get rid of them. These holes did not occur in the original script that used three js version 75 and mergeVertices. However, I tried to reproduce that behaviour in the animation function but without succes - thus this workaround here.
	sea = new Sea()
	sea.mesh.position.y = -worldConfig.seaRadius
	scene.add(sea.mesh)

	sea2 = new Sea()
	sea2.mesh.position.y = -worldConfig.seaRadius
	scene.add(sea2.mesh)
}


function createSky() {

class Sky {
	constructor() {
		this.mesh = new THREE.Object3D()
		this.nClouds = 20
		this.clouds = []
		const stepAngle = Math.PI*2 / this.nClouds
		for (let i=0; i<this.nClouds; i++) {
			const c = new Cloud()
			this.clouds.push(c)
			var a = stepAngle * i
			var h = worldConfig.seaRadius + 150 + Math.random()*200
			c.mesh.position.y = Math.sin(a)*h
			c.mesh.position.x = Math.cos(a)*h
			
			c.mesh.position.z = -300 - Math.random()*500
			c.mesh.rotation.z = a + Math.PI/2
			const scale = 1+Math.random()*2
			c.mesh.scale.set(scale, scale, scale)
			this.mesh.add(c.mesh)
		}
	}

	tick(deltaTime) {
		for(var i=0; i<this.nClouds; i++) {
			var c = this.clouds[i]
			c.tick(deltaTime)
		}
		this.mesh.rotation.z += game.speed * deltaTime
	}
}

	sky = new Sky()
	sky.mesh.position.y = -worldConfig.seaRadius
	scene.add(sky.mesh)
}



function loop() {
	newTime = new Date().getTime()
	const deltaTime = newTime - oldTime
	oldTime = newTime
	addExtraGun = true

	if (game.status == 'playing') {
		if (!game.paused) {
		    audioManager.listener.gain.gain.value = 1;
		    
		    // Add free gun
		    
		    if(	!addExtraGun && Math.floor(game.distance)%worldConfig.distanceForCoinsSpawn == 50 ){
		        spawnBetterGunCollectible()
				game.spawnedBetterGun = true
		    }
			// Add coins
			if (Math.floor(game.distance)%worldConfig.distanceForCoinsSpawn == 0 && Math.floor(game.distance) > game.coinLastSpawn) {
				game.coinLastSpawn = Math.floor(game.distance);
				spawnCoins()
			}
			if (Math.floor(game.distance)%worldConfig.distanceForSpeedUpdate == 0 && Math.floor(game.distance) > game.speedLastUpdate) {
				game.speedLastUpdate = Math.floor(game.distance);
				game.targetBaseSpeed += worldConfig.incrementSpeedByTime * deltaTime;
			}
			if (Math.floor(game.distance)%worldConfig.distanceForEnemiesSpawn == 0 && Math.floor(game.distance) > game.enemyLastSpawn) {
				game.enemyLastSpawn = Math.floor(game.distance)
				spawnEnemies(game.level)
			}
			if (Math.floor(game.distance)%worldConfig.distanceForLevelUpdate == 0 && Math.floor(game.distance) > game.levelLastUpdate) {
				game.levelLastUpdate = Math.floor(game.distance)
				game.level += 1
				if (game.level === worldConfig.levelCount) {
					game.status = 'finished'
					setFollowView()
					ui.showScoreScreen()
					if ("vibrate" in navigator) {
						navigator.vibrate([100, 30, 100, 30, 200, 100, 30, 200, 100, 30, 500])
					}
					
					// Send game stats to backend for token minting
					// TODO: Get accountId from profile and use it here
					// localStorage.setItem('hashconnect-profile-id', this.pairingData.accountIds[0]);
            
					const accountId = localStorage.getItem('hashconnect-profile-id');
					(async () => {
						const gameStats = {
							accountId: accountId,
							coinsCollected: game.statistics.coinsCollected,
							distanceTraveled: Math.floor(game.distance),
							enemiesKilled: game.statistics.enemiesKilled,
							shotsFired: game.statistics.shotsFired,
							lifesLost: game.statistics.lifesLost,
							level: game.level
						};

						try {
							const response = await fetch('/api/mint-tokens', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(gameStats)
							});

							if (!response.ok) {
								console.error('Failed to mint tokens:', await response.text());
							} else {
								const result = await response.json();
								console.log('Tokens minted successfully:', result);
							}
						} catch (error) {
							console.error('Error minting tokens:', error);
						}
					})();
				} else {
					ui.informNextLevel(game.level)
					sea.updateColor()
					sea2.updateColor()
					ui.updateLevelCount()
					game.targetBaseSpeed = worldConfig.initSpeed + worldConfig.incrementSpeedByLevel*game.level
				}
			}

			// span collectibles
			if (game.lifes<worldConfig.maxLifes && (game.distance-game.lastLifeSpawn)>worldConfig.pauseLifeSpawn && Math.random()<0.01) {
				game.lastLifeSpawn = game.distance
				spawnLifeCollectible()
				
			}
			/*
			if (!game.spawnedSimpleGun && game.distance>world.simpleGunLevelDrop*world.distanceForLevelUpdate) {
				spawnSimpleGunCollectible()
				game.spawnedSimpleGun = true
			}
			if (!game.spawnedDoubleGun && game.distance>world.doubleGunLevelDrop*world.distanceForLevelUpdate) {
				spawnDoubleGunCollectible()
				game.spawnedDoubleGun = true
			}
			*/
			if (Math.floor(game.distance)%worldConfig.distanceForBetterGunSpawn == 0 && Math.floor(game.distance) > game.betterGunSpawn) {
			//if (!game.spawnedBetterGun && game.distance>world.betterGunLevelDrop*world.distanceForLevelUpdate) {
				game.betterGunSpawn = Math.floor(game.distance);
				spawnBetterGunCollectible()
				game.spawnedBetterGun = true
			}

			if (ui.mouseButtons[0] || ui.keysDown['Space']) {
				airplane.shoot()
			}

			airplane.tick(deltaTime)
			game.distance += game.speed * deltaTime * worldConfig.ratioSpeedDistance
			game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02
			game.speed = game.baseSpeed * game.planeSpeed
			ui.updateDistanceDisplay()

			if (game.lifes<=0 && canDie) {
				game.status = "gameover"
			}
		}
	}
	else if (game.status == "gameover") {
		game.speed *= .99
		airplane.mesh.rotation.z += (-Math.PI/2 - airplane.mesh.rotation.z) * 0.0002 * deltaTime
		airplane.mesh.rotation.x += 0.0003 * deltaTime
		game.planeFallSpeed *= 1.05
		airplane.mesh.position.y -= game.planeFallSpeed * deltaTime

		if (airplane.mesh.position.y < -200) {
			ui.showReplay();
			game.status = "waitingReplay";
			audioManager.play('water-splash', {volume: 1});
			if ("vibrate" in navigator) {
  //
		navigator.vibrate(3000);
		
			}
					
					setTimeout(function(){
					    
					    wakeLock.release().then(() => {
                            wakeLock = null;
                        });
					    
					    	try{
			    tapp.close();
			}catch(e){
			    console.warn(e);
			}
			
					}, 3000);
					
				
					
		document.getElementById('score-coins-lost').innerText = game.statistics.coinsCollected;
		document.getElementById('score-coins-potential').innerText = game.statistics.coinsSpawned;

		}
	}
	else if (game.status == "waitingReplay"){
		// nothing to do
		
	}

	if (!game.paused) {
		airplane.tick(deltaTime)

		sea.mesh.rotation.z += game.speed*deltaTime
		if (sea.mesh.rotation.z > 2*Math.PI) {
			sea.mesh.rotation.z -= 2*Math.PI
		}
		ambientLight.intensity += (.5 - ambientLight.intensity) * deltaTime * 0.005

		sceneManager.tick(deltaTime)

		sky.tick(deltaTime)
		sea.tick(deltaTime)
	}

	renderer.render(scene, camera)
	requestAnimationFrame(loop)
}





// COINS
function addCoin() {
    // coins multiplied by level
    var coinsE = (1*game.level)
    
	game.coins += coinsE
	ui.updateCoinsCount(game.coins)

	game.statistics.coinsCollected += coinsE
}



function addLife() {
	game.lifes = Math.min(worldConfig.maxLifes, game.lifes+1)
	ui.updateLifesDisplay()
}

function removeLife() {
	game.lifes = Math.max(0, game.lifes-1)
	ui.updateLifesDisplay()

	game.statistics.lifesLost += 1
}




function setSideView() {
	game.fpv = false
	camera.position.set(0, worldConfig.planeDefaultHeight, 200)
	camera.setRotationFromEuler(new THREE.Euler(0, 0, 0))
}


function setFollowView() {
	game.fpv = true
	camera.position.set(-130, airplane.mesh.position.y+40, -75)
	camera.setRotationFromEuler(new THREE.Euler(-1.490248, -1.4124514, -1.48923231))
	camera.updateProjectionMatrix ()
}






class UI {
	constructor(onStart) {
		this._elemDistanceCounter = document.getElementById("distValue")
		this._elemReplayMessage = document.getElementById("replayMessage")
		this._elemLevelCounter = document.getElementById("levelValue")
		this._elemLevelCircle = document.getElementById("levelCircleStroke")
		this._elemsLifes = document.querySelectorAll('#lifes img')
		this._elemCoinsCount = document.getElementById('coinsValue')
        
        	    
	

		//document.addEventListener('keydown', this.handleKeyDown.bind(this), false)
		//document.addEventListener('keyup', this.handleKeyUp.bind(this), false)
		document.addEventListener('mousedown', this.handleMouseDown.bind(this), false)
		document.addEventListener('mouseup', this.handleMouseUp.bind(this), false)
		document.addEventListener('mousemove', this.handleMouseMove.bind(this), false)
		document.addEventListener('touchmove', this.handleTouchMove.bind(this), false)
		//document.addEventListener('touchstart', this.handleTouchStart.bind(this), false)
		document.addEventListener('blur', this.handleBlur.bind(this), false)

		document.oncontextmenu = document.body.oncontextmenu = function() {return false;}

		window.addEventListener('resize', this.handleWindowResize.bind(this), false)

		this.width = window.innerWidth
		this.game = game
		this.height = window.innerHeight
		this.mousePos = {x: 0, y: 0}
		this.canvas = document.getElementById('threejs-canvas')

		this.mouseButtons = [false, false, false]
		this.keysDown = {}

		this._resizeListeners = []
	}


	onResize(callback) {
		this._resizeListeners.push(callback)
	}


	handleWindowResize(event) {
		this.width = window.innerWidth
		this.height = window.innerHeight

		for (const listener of this._resizeListeners) {
			listener()
		}
	}


	handleMouseMove(event) {
	   

	    //console.log(event);
		var tx = -1 + (event.clientX / this.width)*2
		var ty = 1 - (event.clientY / this.height)*2
		this.mousePos = {x:tx, y:ty}
	}

	handleTouchMove(event) {
	try{
		event.preventDefault()
	}catch(e){
    console.log(e);
}
		var tx = -1 + (event.touches[0].pageX / this.width)*2
		var ty = 1 - (event.touches[0].pageY / this.height)*2
		this.mousePos = {x: tx, y: ty}

	}


/*
	handleTouchStart(event) {

	
	}
*/	
	handleMouseDown(event) {
		this.mouseButtons[event.button] = true

	}

/*
	handleKeyDown(event) {
		this.keysDown[event.code] = true
	
		if (event.code === 'KeyP') {
			game.paused = !game.paused
		}
		if (event.code === 'Space') {
			airplane.shoot()
		}
		if (event.code === 'Enter') {
			if (game.fpv) {
				setSideView()
			} else {
				setFollowView()
			}
		}
	}

	handleKeyUp(event) {
		this.keysDown[event.code] = false
	}
*/
	handleMouseUp(event) {
		this.mouseButtons[event.button] = false
		event.preventDefault()

		if (game && game.status == "waitingReplay") {
			resetMap()
			ui.informNextLevel(1)
			game.paused = false
			sea.updateColor()
			sea2.updateColor()

			ui.updateDistanceDisplay()
			ui.updateLevelCount()
			ui.updateLifesDisplay()
			ui.updateCoinsCount()

			ui.hideReplay()
		}
	}

	handleBlur(event) {
		this.mouseButtons = [false, false, false]
	}


	// function handleTouchEnd(event) {
	// 	if (game.status == "waitingReplay"){
	// 		resetGame()
	// 		ui.hideReplay()
	// 	}
	// }


	showReplay() {
		this._elemReplayMessage.style.display = 'block'
	}

	hideReplay() {
		this._elemReplayMessage.style.display = 'none'
	}


	async updateLevelCount() {
	    
		this._elemLevelCounter.innerText = game.level

try{
	    var btcRate = await fetchRates();
	    game.btcRate = Math.floor(btcRate.baseEx);
	    game.btcCurrency = btcRate.baseCd;
}catch(er){
    console.log(er);
}
	    
	    
	    
	}

	updateCoinsCount() {
	    // include exchange rate
	    // game
	    // 
	    
	    
		//this._elemCoinsCount.innerText = Math.round((game.coins*(game.btcRate/Math.pow(10,8))) * 100) / 100
		this._elemCoinsCount.innerText = Math.round((game.coins) * 100) / 100
	}

	updateDistanceDisplay() {
		this._elemDistanceCounter.innerText = Math.floor(game.distance)
		const d = 502 * (1-(game.distance%worldConfig.distanceForLevelUpdate) / worldConfig.distanceForLevelUpdate)
		this._elemLevelCircle.setAttribute("stroke-dashoffset", d)
	}

	updateLifesDisplay() {
		for (let i=0, len=this._elemsLifes.length; i<len; i+=1) {
			const hasThisLife = i < game.lifes
			const elem = this._elemsLifes[i]
			if (hasThisLife && !elem.classList.contains('visible')) {
				elem.classList.remove('invisible')
				elem.classList.add('visible')
			}
			else if (!hasThisLife && !elem.classList.contains('invisible')) {
				elem.classList.remove('visible')
				elem.classList.add('invisible')
			}
		}
	}


	informNextLevel(level) {
		const ANIMATION_DURATION = 1.0

		const elem = document.getElementById('new-level')
		elem.style.visibility = 'visible'
		elem.style.animationDuration = Math.round(ANIMATION_DURATION * 1000)+'ms'
		elem.children[1].innerText = 'X'+level
		elem.classList.add('animating')
		setTimeout(() => {
			document.getElementById('new-level').style.visibility = 'hidden'
			elem.classList.remove('animating')
		}, 1000)
		try{
		document.getElementById("gameprice").innerText = "1 BTC = "+ game.btcRate +" "+ game.btcCurrency;
		}catch(er){
		    console.log(er);
		}
	}


	hideScoreScreen() {
		const elemScreen = document.getElementById('score-screen')

		// make visible
		elemScreen.classList.remove('visible')

	}

	showScoreScreen() {
		const elemScreen = document.getElementById('score-screen')

		// make visible
		elemScreen.classList.add('visible')

		// fill in statistics
		//document.getElementById('score-coins-collected').innerText = Math.round((game.statistics.coinsCollected*(game.btcRate/Math.pow(10,8))) * 100) / 100 +' '+ game.btcCurrency
		//document.getElementById('score-coins-total').innerText = Math.round((game.statistics.coinsSpawned*(game.btcRate/Math.pow(10,8))) * 100) / 100 +' '+ game.btcCurrency
		document.getElementById('score-coins-collected').innerText = game.statistics.coinsCollected +' RUBS'
		document.getElementById('score-coins-total').innerText = game.statistics.coinsSpawned +' RUBS'
		document.getElementById('score-enemies-killed').innerText = game.statistics.enemiesKilled
		document.getElementById('score-enemies-total').innerText = game.statistics.enemiesSpawned
		document.getElementById('score-shots-fired').innerText = game.statistics.shotsFired
		document.getElementById('score-lifes-lost').innerText = game.statistics.lifesLost
	}


	showError(message) {
		document.getElementById('error').style.visibility = 'visible'
		document.getElementById('error-message').innerText = message
	}
}


function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function createWorld() {
	worldConfig = {
		initSpeed: 0.00005,
		incrementSpeedByTime: 0.000001,
		incrementSpeedByLevel: 0.000005,
		distanceForSpeedUpdate: randomInteger(70, 100),
		ratioSpeedDistance: randomInteger(40, 60),

		simpleGunLevelDrop: 1.1,
		doubleGunLevelDrop: 2.3,
		betterGunLevelDrop: 3.5,

		maxLifes: 3,
		pauseLifeSpawn: 400,

		levelCount: 11,
		//distanceForLevelUpdate: randomInteger(400, 600),
		// shorter distance for testing only
		distanceForLevelUpdate: randomInteger(40, 60),

		planeDefaultHeight: 100,
		planeAmpHeight: 90,
		planeAmpWidth: 75,
		planeMoveSensivity: 0.005,
		planeRotXSensivity: 0.0008,
		planeRotZSensivity: 0.0004,
		planeMinSpeed: 1.2,
		planeMaxSpeed: 1.6,

		seaRadius: 3600,
		seaLength: 4800,
		wavesMinAmp: 5,
		wavesMaxAmp: 20,
		wavesMinSpeed: 0.001,
		wavesMaxSpeed: 0.003,

		cameraSensivity: 0.002,

		coinDistanceTolerance: 15,
		coinsSpeed: 0.5,
		distanceForCoinsSpawn: randomInteger(60, 120),
		distanceForBetterGunSpawn: randomInteger(40, 100),

		collectibleDistanceTolerance: 15,
		collectiblesSpeed: 0.6,

		enemyDistanceTolerance: 10,
		enemiesSpeed: 0.6,
		distanceForEnemiesSpawn: randomInteger(30, 70),
	}

	//game parameters
	game = {
		status: 'playing',
		
	    btcRate: Math.floor(1),
	    btcCurrency: 'kes',
	    
	    speed: 0,
		paused: false,
		baseSpeed: 0.00005,
		targetBaseSpeed: 0.0001,
		speedLastUpdate: 0,
		maxCoins: 2000,

		distance: 0,

		coins: 0,
		fpv: false,

		// gun spawning
		spawnedSimpleGun: false,
		spawnedDoubleGun: false,
		spawnedBetterGun: true,

		lastLifeSpawn: 0,
		lifes: worldConfig.maxLifes,

		level: 1,
		levelLastUpdate: 0,

		planeFallSpeed: 0.001,
		planeSpeed: 0,
		planeCollisionDisplacementX: 0,
		planeCollisionSpeedX: 0,
		planeCollisionDisplacementY: 0,
		planeCollisionSpeedY: 0,

		betterGunSpawn: 0,
		coinLastSpawn: 0,
		enemyLastSpawn: 0,

		statistics: {
			coinsCollected: 0,
			coinsSpawned: 0,
			enemiesKilled: 0,
			enemiesSpawned: 0,
			shotsFired: 0,
			lifesLost: 0,
		}
	}

	// create the world
	createScene()
	createSea()
	createSky()
	createLights()
	createPlane()

	resetMap()
}



async function resetMap() {



try{
	    var btcRate = await fetchRates();
	    game.btcRate = Math.floor(btcRate.baseEx);
	    game.btcCurrency = btcRate.baseCd;
	    	document.getElementById("gameprice").innerText = "1 BTC = "+ game.btcRate +" "+ game.btcCurrency;
	    	
}catch(er){
    console.log(er);
}
		    
	    
	    
	    	document.getElementsByClassName("header")[0].style.visibility = 'hidden';
	    	document.getElementsByClassName("score")[0].style.visibility = 'visible';
	
	// update ui
	ui.updateDistanceDisplay()
	ui.updateLevelCount()
	ui.updateLifesDisplay()
	ui.updateCoinsCount()

	sceneManager.clear()

	sea.updateColor()
	sea2.updateColor()

	setSideView()
	//setFollowView()

	
	
	if (game.statistics.shotsFired == 15){
		    
		    
	    airplane.equipWeapon(null)
	
	    game.statistics.shotsLeft = 15-game.statistics.shotsFired
	
	    game.statistics.shotsFired = 0
		    
	}

	// airplane.equipWeapon(new SimpleGun())
	// airplane.equipWeapon(new DoubleGun())
	// airplane.equipWeapon(new BetterGun())
	
}



let soundPlaying = false

exports.startMap = async function startMap() {
	if (!soundPlaying) {
		audioManager.play('propeller', {loop: true, volume: 1})
		audioManager.play('ocean', {loop: true, volume: 0.3})
		soundPlaying = true
	}

	// Make game controls and score visible
	document.getElementById('game-controls').style.visibility = 'visible';
	document.getElementById('score').style.visibility = 'visible';

	// Hide start buttons
	document.getElementById('start-button-single').style.visibility = 'hidden';
	document.getElementById('start-button-multi').style.visibility = 'hidden';

	createWorld()
	loop()

	ui.informNextLevel(1);
	game.paused = false;
	
	setSideView();
}



async function onWebsiteLoaded(event) {
    
//var auDir = './audio/';
var auDir = 'assets/audio/';
	// load audio
	audioManager.load('ocean', null, auDir+'trap.mp3')
	audioManager.load('propeller', null, auDir+'propeller.mp3')

	audioManager.load('guncock1', 'guncock1', auDir+'guncock1.mp3')
	audioManager.load('guncock2', 'guncock2', auDir+'guncock2.mp3')
	audioManager.load('guncock3', 'guncock3', auDir+'guncock3.mp3')
	
	//audioManager.load('heart', 'heart', auDir+'heart.mp3')
	
	audioManager.load('coin1', 'coin', auDir+'coin1.mp3')
	audioManager.load('coin2', 'coin', auDir+'coin2.mp3')
	audioManager.load('coin3', 'coin', auDir+'coin3.mp3')
	audioManager.load('coin4', 'coin', auDir+'coin4.mp3')
	//audioManager.load('coin5', 'coin', auDir+'coin5.mp3')
	audioManager.load('coin-1', 'coin', auDir+'coin-1.mp3')
	audioManager.load('coin-2', 'coin', auDir+'coin-2.mp3')
	audioManager.load('coin-3', 'coin', auDir+'coin-3.mp3')
	audioManager.load('jar-1', 'coin', auDir+'jar-1.mp3')
	audioManager.load('jar-2', 'coin', auDir+'jar-2.mp3')
	audioManager.load('jar-3', 'coin', auDir+'jar-3.mp3')
	audioManager.load('jar-4', 'coin', auDir+'jar-4.mp3')
	audioManager.load('jar-5', 'coin', auDir+'jar-5.mp3')
	audioManager.load('jar-6', 'coin', auDir+'jar-6.mp3')
	audioManager.load('jar-7', 'coin', auDir+'jar-7.mp3')

	audioManager.load('airplane-crash-1', 'airplane-crash', auDir+'airplane-crash-1.mp3')
	audioManager.load('airplane-crash-2', 'airplane-crash', auDir+'airplane-crash-2.mp3')
	audioManager.load('airplane-crash-3', 'airplane-crash', auDir+'airplane-crash-3.mp3')

	audioManager.load('bubble', 'bubble', auDir+'bubble.mp3')

	audioManager.load('shot-soft', 'shot-soft', auDir+'shot-soft.mp3')

	audioManager.load('shot-hard', 'shot-hard', auDir+'shot-hard.mp3')

	audioManager.load('bullet-impact', 'bullet-impact', auDir+'bullet-impact-rock.mp3')

	audioManager.load('water-splash', 'water-splash', auDir+'water-splash.mp3')
	audioManager.load('rock-shatter-1', 'rock-shatter', auDir+'rock-shatter-1.mp3')
	audioManager.load('rock-shatter-2', 'rock-shatter', auDir+'rock-shatter-2.mp3')
	//audioManager.load('rock-shatter-1', 'rock-shatter', auDir+'woi-1.mp3')
	//audioManager.load('rock-shatter-2', 'rock-shatter', auDir+'woi-2.mp3')

	// load models
	modelManager.load('heart')






		
		
	

	if(getBitsOpt("dl")=="contract"){
 dialog.showModal();
		
	}
	
	//



document.addEventListener("visibilitychange", () => {
    try{
  if (document.hidden) {
    // Was the audio playing when the page changed to hidden?
    audioManager.listener.gain.gain.value = 0;
    game.paused = true;
  } else {
    // Page became visible, resume if audio was playing when hidden
    audioManager.listener.gain.gain.value = 1;
    game.paused = false;
  }
    }catch(er){
        console.log(er);
    }
});


 
const dialog = document.querySelector("dialog");
const showButton = document.querySelector("dialog + button");
const closeButton = document.querySelector("dialog button");

// "Show the dialog" button opens the dialog modally
showButton.addEventListener("click", () => {
  dialog.showModal();
});

// "Close" button closes the dialog
closeButton.addEventListener("click", () => {
  dialog.close();
});

	const tab = document.querySelector('.tabs');
const tabButtons = tab.querySelectorAll('[role="tab"]');
const tabPanels = Array.from(tab.querySelectorAll('[role="tabpanel"]'));

function tabClickHandler(e) {
	//Hide All Tabpane
	tabPanels.forEach(panel => {
		panel.hidden = 'true';
	});
	
	//Deselect Tab Button
	tabButtons.forEach( button => {
		button.setAttribute('aria-selected', 'false');
	});
	
	//Mark New Tab
	e.currentTarget.setAttribute('aria-selected', 'true');
	
	//Show New Tab
	const { id } = e.currentTarget;
	
	const currentTab = tabPanels.find(
		panel => panel.getAttribute('aria-labelledby') === id
	);
	
	currentTab.hidden = false;
}

tabButtons.forEach(button => {
	button.addEventListener('click', tabClickHandler);
})
	
	
/*
document.getElementById('address').addEventListener('input', function (evt) {
    
                    document.getElementById("address-data").children[0].innerText = "";
                   
                   document.getElementById("start-button").style.visibility = 'hidden';
                   
     doFetch({
              action:'checkLNUrlAddress',
              address:this.value
              
          })
            .then(function(r){
                
              console.log(r); 
              
                if(r.status == 'ok' && r.rawData){
                    
                    document.getElementById("address-data").children[0].innerText = r.description;
                   document.getElementById("address-data").children[1].innerText = 'place your bet below to start play';
               document.getElementById("start-button").style.visibility = 'visible'
            
                }else{
                   
                   document.getElementById("address-data").children[1].innerText = 'invalid address';
                   document.getElementById("start-button").style.visibility = 'hidden';
             
                }
                
          
            })
              .catch(function(e){
                console.log(e);
                
              });   
                  
                  
});
*/
	
}

 
  

window.addEventListener('load', onWebsiteLoaded, false)
