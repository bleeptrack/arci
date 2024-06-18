'use strict';
import CustomInput from '../CustomInput.js';
import "https://cdn.babylonjs.com/babylon.js";
import "https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js";

export default class Interaction3DScene extends HTMLElement {
	
	static name = "3D Scene"
	static icon = "view_in_ar"
	
	constructor(msg, callback) {
		super();
		
		
		this.shadow = this.attachShadow({ mode: 'open' });
		this.filename = msg.filename

		const container = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<style>
				canvas {
					position: absolute;
					width: 100%;
					height: 100%;
					top: 0;
					left: 0;
				}	
			</style>
			<canvas id="renderCanvas" touch-action="none"></canvas>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		callback({status: "ok"})
	
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		const canvas = this.shadow.getElementById("renderCanvas"); // Get the canvas element
		const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
		const scene = this.createScene(engine, canvas); //Call the createScene function
		
		engine.runRenderLoop(function () {
			scene.render();
		});
		console.log("yes")
	}
	
	createScene(engine, canvas){
		// This creates a basic Babylon Scene object (non-mesh)
		this.scene = new BABYLON.Scene(engine);
		//this.scene.createDefaultEnvironment();
		this.scene.createDefaultCameraOrLight(true, true, true);
		//var box = BABYLON.MeshBuilder.CreateBox("box", {});
		/*
		var camera = new BABYLON.ArcRotateCamera("camera1",  0, 0, 0, new BABYLON.Vector3(0, 0, 0), this.scene);
		camera.setPosition(new BABYLON.Vector3(0, 0, -10));
		camera.attachControl(canvas, true);

		// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
		var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(10, 10, -10), this.scene);

		// Default intensity is 1. Let's dim the light a small amount
		light.intensity = 0.7;
		light.specular = BABYLON.Color3.Black();
		
		
		
		camera.useAutoRotationBehavior = true;
		*/
		
		BABYLON.SceneLoader.Append("./media/", this.filename, this.scene, function (scene) {
			// do something with the scene
			scene.createDefaultCameraOrLight(true, true, true);

			// The default camera looks at the back of the asset.
			// Rotate the camera by 180 degrees to the front of the asset.
			scene.activeCamera.alpha += Math.PI;
			console.log("loaded")
		});
		
		return this.scene;
	}
	
	static createFields(form){
		CustomInput.filepicker(form, "filename", "Choose an .glb File:")
		CustomInput.br(form)
	}

}

customElements.define('interaction-3dscene', Interaction3DScene);
