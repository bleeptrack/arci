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
					background-color: var(--main-color);
					color: white;
					display: flex;
					align-items: center;
					padding: var(--small-gap);
					font-family: sans-serif;
					border: 2px solid black;
					border-radius: var(--radius);
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
					background-color: red;
				}
				
				button{
					
				}
				
			</style>
			
			<div id="${name}" >
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

