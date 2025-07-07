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
				
				scene-tab{
					display: block;
					
				}

				#add-scene{
					background-color: color-mix(in srgb, var(--main-color) 40%, black);
					color: white;
					padding: var(--small-gap);
					margin: var(--small-gap);
					border: 2px solid black;
					border-radius: var(--radius);
					opacity: 0.45;
					align-self: center;
				}

				#add-scene:hover{
					opacity: 0.8;
				}

				#container{
					display: flex;
					flex-direction: column;
					height: 100%;
					overflow-y: scroll;
					overflow-x: visible;
					scrollbar-color: color-mix(in srgb, var(--main-color) 40%, black) var(--main-color);
					scrollbar-width: thin;
				}
				
			</style>
			<div id="container">
				<div id="tabs">
				</div>
			
					<button id="add-scene"><span class="material-symbols-outlined">add</span></button>
				
			</div>
			
			
		
		`;

		this.shadow.appendChild(listcontainer.content.cloneNode(true));
		this.shadow.getElementById("add-scene").addEventListener("click", (event) => {
			this.addScene(`new epic scene ${Math.floor(Math.random() * 1000)}`)
		})

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
		
	}

}

customElements.define('scene-tabs', SceneTabs);

