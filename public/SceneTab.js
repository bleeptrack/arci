'use strict';
import { socket } from './socket.js';

export class SceneTab extends HTMLElement {
	constructor(name) {
		console.log("name", name)
		super();
		this.name = name
		this.shadow = this.attachShadow({ mode: 'open' });

		const listcontainer = document.createElement('template');

		// creating the inner HTML of the editable list element
		listcontainer.innerHTML = `
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
			<style>
				
				div{
					height: 2vh;
					background-color: color-mix(in srgb, var(--main-color) 40%, black);
					color: white;
					display: flex;
					align-items: center;
					padding: var(--small-gap);
					font-family: sans-serif;
					border: 2px solid black;
					border-left: 0;
					border-radius: 0 var(--radius) var(--radius) 0;
					opacity: 0.45;
				}

				div:hover{
					opacity: 0.8;
				}

				div:hover #delete, div:hover #duplicate{
					display: block;
				}

				#delete, #duplicate{
					background-color: color-mix(in srgb, var(--main-color) 70%, white);
					border: none;
					border-radius: var(--radius);
					font-family: sans-serif;
					display: none;
					
				}

				#delete span, #duplicate span{
					font-size: 19px !important;
				}

				#duplicate{
					margin-left: auto;
					margin-right: var(--small-gap);
				}
				
				#delete:hover, #duplicate:hover{
					background-color: color-mix(in srgb, var(--main-color) 40%, white);
				}

				#name{
					text-overflow: ellipsis;
					overflow: hidden;
					display: -webkit-box;
					-webkit-line-clamp: 1;
					-webkit-box-orient: vertical;
				}
				
				.active{
					background-color: var(--action-color);
					opacity: 1;
				}
				
				.insertAbove{
					box-shadow: 0 -1vh 0 var(--action-color);
					z-index: 100;
				}
				
				.insertBelow{
					box-shadow: 0 1vh 0 var(--action-color);
					z-index: 100;
				}
				
			</style>
			
			<div id="${name}" draggable="true">
				<span id="name">${name}</span>
				<button id="duplicate"><span class="material-symbols-outlined">content_copy</span></button>
				<button id="delete"><span class="material-symbols-outlined">delete</span></button>
			</div>
				
			
		`;

		this.setAttribute("name", this.name) 
		this.shadow.appendChild(listcontainer.content.cloneNode(true));

		this.shadow.getElementById("delete").addEventListener("click", (e) => {
			e.stopPropagation()
			if (confirm(`Are you sure you want to delete the scene "${this.name}"?`)) {
				this.deleteScene();
			}
		})

		this.shadow.getElementById("name").addEventListener("dblclick", (e) => {
			this.shadow.getElementById("name").contentEditable = true
			this.shadow.getElementById("name").focus()
		})

		this.shadow.getElementById("name").addEventListener("blur", (e) => {
			this.shadow.getElementById("name").contentEditable = false
			document.querySelector("cue-list").renameSequence(this.name, this.shadow.getElementById("name").innerText)
		})

		this.shadow.getElementById("duplicate").addEventListener("click", (e) => {
			e.stopPropagation()
			document.querySelector("cue-list").duplicateSequence(this.name)
		})

		this.addEventListener("drop", (event) => {
			event.preventDefault();
			event.stopPropagation()
			
			let name = event.dataTransfer.getData("data")
			event.target.removeDisplayInsert()

			document.querySelector("cue-list").insertSequence(name, event.target.name, event.target.dropDir)
		})
		
		
		this.addEventListener("dragover", (event) => {
		// prevent default to allow drop
			event.preventDefault();
			
			let targetCenter = event.target.getBoundingClientRect().top + (event.target.getBoundingClientRect().height / 2)
			let pos = event.clientY
			
			
			event.target.displayInsert(pos < targetCenter)
			
			//console.log(pos < targetCenter, pos, targetCenter)
		});
		
		this.addEventListener("dragleave", (event) => {
		// prevent default to allow drop
			event.preventDefault();
			event.target.removeDisplayInsert()
		});
		
		this.addEventListener('dragstart', (event) => {
			console.log("drag start", this.name)
			event.dataTransfer.setData("data", this.name);
			event.dataTransfer.dropEffect = "move";
		})
	}

	displayInsert(dir){
		this.dropDir = dir
		if(dir){
			this.shadow.getElementById(this.name).classList.add("insertAbove")
			this.shadow.getElementById(this.name).classList.remove("insertBelow")
		}else{
			this.shadow.getElementById(this.name).classList.remove("insertAbove")
			this.shadow.getElementById(this.name).classList.add("insertBelow")
		}
	}
	
	removeDisplayInsert(){
		this.shadow.getElementById(this.name).classList.remove("insertAbove")
		this.shadow.getElementById(this.name).classList.remove("insertBelow")
	}
	
	deleteScene(){
		socket.emit("scene:delete", this.name)
	}
	
	activate(){
		this.shadow.querySelector("div").classList.add("active")
		this.dispatchEvent(new CustomEvent("scene active", { name: this.name }));
	}

	disable(){
		this.shadow.querySelector("div").classList.remove("active")
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		this.activate()
		this.addEventListener("click", (event) => {
			console.log("click", this.name)
			this.activate()
		})
	}

}

customElements.define('scene-tab', SceneTab);

