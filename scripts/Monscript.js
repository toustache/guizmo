
// audio
var ecouteur = new THREE.AudioListener();
var son = new THREE.PositionalAudio( ecouteur );
var audioLoader = new THREE.AudioLoader();
var scene, camera, renderer;

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;
var tir = false;
var ecouteur = new THREE.AudioListener();
var son = new THREE.PositionalAudio( ecouteur );
var audioLoader = new THREE.AudioLoader();

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var etat = 'nu';

// sélection - interaction HTML / 3D
var container = document.getElementById('espace');
var select_blanc = document.getElementById('blanc');
var select_noir = document.getElementById('noir');
var select_retour = document.getElementById('retour');

var SPEED = 0.01;

var anim = false;
var play = document.getElementById("play");
var stop = document.getElementById("stop");

// définition des couleurs utilisées pour le fond et le personnage
var blanc = new THREE.Color( 0xffffff );
var noir = new THREE.Color( 0x000000 );
var rose = new THREE.Color( 0xd773f0 );
var bleu = new THREE.Color( 0x3e6b88 );
var gris = new THREE.Color( 0x1c1c1c );

var clock = new THREE.Clock(); // objet qui permet de gérer le temps

function init() {
    createScene();
	createLight();
	createEnv();
	//createMesh();
    importMesh()
    createRenderer();
	createOrbit();
	container.appendChild(renderer.domElement);
}

function createScene() {
	scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 1000);
    camera.position.set(0, 3.5, 50);
    camera.lookAt(scene.position);
    camera.add( ecouteur );
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
}

function createLight() {
    var spotLight = new THREE.SpotLight(0xffd073,0.7);
    spotLight.position.set(-50, 50, 50);
    scene.add(spotLight);

    var ambientLt = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLt);
}

function createEnv() {
	reflectionCube = new THREE.CubeTextureLoader()
		.setPath( 'images/' )
		.load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
	reflectionCube.format = THREE.RGBFormat;
	scene.background = reflectionCube;
    //scene.background = new THREE.Color( 0x3e6b88 );
}

function createMesh() {
	var geom = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
	var mtl = new THREE.MeshPhongMaterial( {
        color: 0x328eff,
		specular: 0xf2efe8,
		reflectivity: 0.6,
		//shading: THREE.FlatShading,
		envMap: reflectionCube
    } );
    mesh = new THREE.Mesh(geom, mtl);
    scene.add(mesh);
}

function importMesh(){
    var loader = new THREE.GLTFLoader();
    loader.load( '../scene3d/gizmo.gltf', function ( gltf ) {
        console.log(gltf.scene);
        var scale = 4;
        mesh = gltf.scene;
        mesh.scale.set(scale,scale,scale);
        //mesh.material.envMap = reflectionCube;


        gizmo = gltf.scene.getObjectByName('figurine');
        gizmo.material.envMap = reflectionCube; // pour réfléchir l'environnement

        sol = gltf.scene.getObjectByName('sol');
        sol.material.transparent = true; // pour la transparence (Map Alpha)

        feuille = gltf.scene.getObjectByName('feuille');
        feuille.material.transparent = true; // pour la transparence (Map Alpha)

        sabre = gltf.scene.getObjectByName('sabre');
        pistolet = gltf.scene.getObjectByName('pistolet');
        cartouche = gltf.scene.getObjectByName('cartouche');

        pistolet.visible = false; // pour cacher un objet
        sabre.visible = false; // pour cacher un objet

        console.log(gltf.scene);
        console.log(gltf.animations)

        animation = gltf.animations[1];
        anim_pause = gltf.animations[1];
        anim_sabre = gltf.animations[2];
        anim_tir = gltf.animations[0];
        mixer = new THREE.AnimationMixer(mesh);
        action = mixer.clipAction(animation);
        action.play();

        scene.add(mesh);

    });
}

function createOrbit() {
    control = new THREE.OrbitControls(camera, renderer.domElement);
    control.object.position.set(0, 0, 70);
    control.target.set(0, 0, 0);
    control.update();
}

function animMesh() {
    if (anim){
        /*mesh.rotation.x -= SPEED * 3;*/
        mesh.rotation.y -= SPEED * 2;
        /*mesh.rotation.z -= SPEED * 2;*/
    }
}

function render() {
    requestAnimationFrame(render);
    update();
    //animMesh();
    renderer.render(scene, camera);
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/*function play_anim(){
    anim = true;
    stop.style.visibility = "visible";
    play.style.visibility = "hidden";
}
function stop_anim(){
    anim = false;
    stop.style.visibility = "hidden";
    play.style.visibility = "visible";
}
*/
function update() { // rafraîchissement du clip d'animation
    const delta = clock.getDelta();
    mixer.update(delta);
    if (tir) {
    tir_cartouche();
}


}

/*function interface() {
    if( etat == 'nu' ){

    } else if {

    }
}*/

function go_noir() {
    var texture_noir = new THREE.TextureLoader();
        texture_noir.load( '../textures/vador.png', function( texture ) { // la fonction load prend l'adresse de l'image et la fonction de call_back
            gizmo.material.color = blanc; // du blanc car la couleur du matériau est multipliée avec la couleur de la texture
            gizmo.material.map = texture;
            gizmo.material.needsUpdate = true;
            scene.background = gris;
            feuille.visible = false;
            sabre.visible = true;
            haut.style.display = 'none';
            texte.style.display = 'none';
            select_blanc.style.display = 'none';
            select_noir.style.display = 'none';
            select_retour.style.display = 'block';
            etat = 'noir';

    });
}

function go_blanc() {
    var texture_blanc = new THREE.TextureLoader();
        texture_blanc.load( '../textures/storm.png', function( texture ) { // la fonction load prend l'adresse de l'image et la fonction de call_back
            gizmo.material.color = blanc; // du blanc car la couleur du matériau est multipliée avec la couleur de la texture
            gizmo.material.map = texture;
            gizmo.material.needsUpdate = true;
            scene.background = blanc;
            feuille.visible = false;
            sabre.visible = false;
            pistolet.visible = true;
            haut.style.display = 'none';
            texte.style.display = 'none';
            select_blanc.style.display = 'none';
            select_noir.style.display = 'none';
            select_retour.style.display = 'block';
            etat = 'blanc';

    });
}

 function go_retour() {
     var texture_blanc = new THREE.TextureLoader();
     texture_blanc.load( '../textures/storm.png', function( texture ) { // la fonction load prend l'adresse de l'image et la fonction de call_back
            gizmo.material.color = rose; // du blanc car la couleur du matériau est multipliée avec la couleur de la texture
            gizmo.material.map = texture;
            gizmo.material.needsUpdate = true;
            scene.background = reflectionCube;
            feuille.visible = true;
            sabre.visible = false;
            pistolet.visible = false;
            haut.style.display = 'inline-block';
            texte.style.display = 'inline-block';
            select_blanc.style.display = 'inline-block';
            select_noir.style.display = 'inline-block';
            select_retour.style.display = 'none';
            gizmo.material.map = '';
            etat = 'nu';

    });
}

function onDocumentMouseClick( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersect = raycaster.intersectObject( gizmo );
    if ( intersect.length > 0 ) {
        if (etat == 'noir' || etat == 'blanc') {
            action = mixer.clipAction(anim_pause);
            action.weight = 0;
        }
        if (etat == 'noir') {
                action = mixer.clipAction(anim_sabre); // lancer l'animation du sabre
                action.setLoop(THREE.LoopOnce); // ne l'exécuter qu'une seule fois
                action.play().reset();
                mixer.addEventListener('finished', function (e) { // on déclenche cette fonction quand le clip est fini
                action = mixer.clipAction(anim_pause);
                action.weight = 1;
            });
            audioLoader.load( '../audio/laser.ogg', function( buffer ) {
     son.setBuffer( buffer );
     son.setRefDistance( 30 );
     son.play();
 });
        } else if (etat == 'blanc') {
                action = mixer.clipAction(anim_tir); // lancer l'animation du tir
                action.setLoop(THREE.LoopOnce);
                action.play().reset();
                mixer.addEventListener('finished', function (e) { // on déclenche cette fonction quand le clip est fini
                action = mixer.clipAction(anim_pause);
                action.weight = 1;
            });
            audioLoader.load( '../audio/cartouche.ogg', function( buffer ) {
     son.setBuffer( buffer );
     son.setRefDistance( 30 );
     setTimeout( function() {
      son.play();
      tir = true; // pour déclencher l'animation
 cartouche.position.y = 0; // pour repositionner la cartouche dans le pistolet pour le tir suivant
 cartouche.position.z = 0;
}, 500 ); // pour retarder la lecture du son de 500 millisecondes (1/2 seconde)
 });
        }
    }
}
function tir_cartouche(){
    cartouche.position.z += 3;
    cartouche.position.y -= 10;
}


window.addEventListener('resize', onWindowResize, false);
window.addEventListener( 'click', onDocumentMouseClick, false );
/*play.addEventListener("mousedown", play_anim, false);
stop.addEventListener("mousedown", stop_anim, false);*/
select_blanc.addEventListener( 'mousedown', go_blanc, false );
select_noir.addEventListener( 'mousedown', go_noir, false );
select_retour.addEventListener( 'mousedown', go_retour, false );

init();
render();
