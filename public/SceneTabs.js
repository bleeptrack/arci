'use strict';
import { SceneTab } from './SceneTab.js';

class SceneTabs extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });

		const listcontainer = document.createElement('template');

		// creating the inner HTML of the editable list element
		listcontainer.innerHTML = `
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
			<style>
				
				#add{
					display: flex;
					width: 100%;
				}
				
				button{
					
				}
				
			</style>
			<div id="tabs">
			</div>
			<div id="add" order="999999">
				<input type="text" id="scene-name"></input>
				<button id="add-scene">+</button>
			</div>
			
			
		
		`;

		this.shadow.appendChild(listcontainer.content.cloneNode(true));


	}
	
	clearScenes(){
		let tabs = this.shadow.getElementById("tabs").innerHTML = ""
		//for(let tab of tabs){
		//	tab.remove()
		//}
	}
	
	addScene(name){
		let tabs = this.shadow.getElementById("tabs")
		console.log(name)
		let sceneTab = new SceneTab(name)
		sceneTab.addEventListener("scene active", (event) => {
			console.log("scene got activated", event.target)
			this.disableOtherScenes(event.target.getAttribute("name"))
			document.querySelector("cue-list").changeSequence(name)
		})
		tabs.appendChild(sceneTab)
	}
	
	activateScene(name){
		let scenetabs = this.shadow.querySelectorAll("scene-tab")
		for(let st of scenetabs){
			if(st.name == name){
				st.activate()
			}
		}
	}
	
	disableOtherScenes(name){
		console.log("disabeling except ", name)
		let scenetabs = this.shadow.querySelectorAll("scene-tab")
		for(let st of scenetabs){
			if(st.name != name){
				st.disable()
			}
		}
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		let btn = this.shadow.getElementById("add-scene")
		btn.addEventListener("click", (event) => {
			this.addScene(this.shadow.getElementById("scene-name").value)
			this.shadow.getElementById("scene-name").value = ""
		})
	}

}

customElements.define('scene-tabs', SceneTabs);

