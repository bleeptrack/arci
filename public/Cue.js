'use strict';
import { socket } from './socket.js';

export class Cue extends HTMLElement {
	constructor(data) {
		super();
		
		this.id = data.id
		this.icon = data.icon ?? ""
		this.instanceID = Math.floor(Math.random()*10000)
		this.name = data['cue-name']
		this.data = data
		this.playerIcon = "123"
		if(this.data["player-ids"] == "all"){
			this.playerIcon = "groups"
		}
		if(this.data["player-ids"] == "random"){
			this.playerIcon = "shuffle"
		}
		
		this.shadow = this.attachShadow({ mode: 'open' });


		const cuecontainer = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		cuecontainer.innerHTML = `
			<link href="${window.location.origin}/static/control.css" rel="stylesheet" />
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
			<div draggable="true" id="cuebox">
				<span class="material-symbols-outlined">${this.icon}</span>
				<span class="material-symbols-outlined">${this.playerIcon}</span>
				<slot>${this.name}</slot>
				<button id="delete"> X </button>
				<button id="edit"> E </button>
			</div>
		`;
		
		this.listStyle = document.createElement('style');
		this.listStyle.innerHTML = `
				div{
					height: 3vh;
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
				
				.activated{
					
					background-color: color-mix(in srgb, var(--action-color) 70%, black);
				}
				
				#delete{
					margin-left: auto;
					background-color: color-mix(in srgb, var(--main-color) 70%, white);
					border: none;
					border-radius: var(--radius);
					padding: var(--small-gap);
					font-family: sans-serif;
				}
				
				#delete:hover{
					background-color: color-mix(in srgb, var(--main-color) 40%, white);
				}
				
				#edit{
					display: none;
				}
				
				span{
					margin-right:  var(--small-gap);
				}
				
				.insertAbove{
					box-shadow: 0 -1vh 0 var(--action-color);
				}
				
				.insertBelow{
					box-shadow: 0 1vh 0 var(--action-color);
				}
		`
		
		this.boxStyle = document.createElement('style');
		this.boxStyle.innerHTML = `
				div{
					height: 12vh;
					width: 12vh;
					background-color: var(--main-color);
					color: white;
				}
				
		`

		// binding methods
		//this.addListItem = this.addListItem.bind(this);
		//this.handleRemoveItemListeners = this.handleRemoveItemListeners.bind(this);
		//this.removeListItem = this.removeListItem.bind(this);

		// appending the container to the shadow DOM
		
		this.setAttribute("type", this.data.type) 
		this.setAttribute("instance", this.instanceID) 
		this.setAttribute("name", this.name.toLowerCase()) 
		this.shadow.appendChild(cuecontainer.content.cloneNode(true));
		
		this.addEventListener("drop", (event) => {
			event.preventDefault();
			event.stopPropagation()
			
			let data = JSON.parse(event.dataTransfer.getData("data"))
			event.target.removeDisplayInsert()
			
			if(event.target.dropDir){
				document.querySelector("cue-list").addCueBefore(event.target, data)
			}else{
				document.querySelector("cue-list").addCueAfter(event.target, data)
			}
			
			document.querySelector("cue-list").deleteCueInstance(data.instanceID)
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
			console.log("drag start", this.data)
			this.data.instanceID = this.instanceID
			event.dataTransfer.setData("data", JSON.stringify(this.data));
			event.dataTransfer.dropEffect = "move";
		})
		
		this.shadow.getElementById("delete").addEventListener("click", (e) => {
			e.preventDefault()
			e.stopPropagation()
			this.removeCue() 
		})
		
		this.shadow.getElementById("edit").addEventListener("click", (e) => {
			e.preventDefault()
			e.stopPropagation()
			this.editCue() 
		})
	}
	
	displayInsert(dir){
		this.dropDir = dir
		if(dir){
			this.shadow.getElementById("cuebox").classList.add("insertAbove")
			this.shadow.getElementById("cuebox").classList.remove("insertBelow")
		}else{
			this.shadow.getElementById("cuebox").classList.remove("insertAbove")
			this.shadow.getElementById("cuebox").classList.add("insertBelow")
		}
	}
	
	removeDisplayInsert(){
		this.shadow.getElementById("cuebox").classList.remove("insertAbove")
		this.shadow.getElementById("cuebox").classList.remove("insertBelow")
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		console.log(this.parentNode.id)
		if(this.parentNode.id == "box-content"){
			this.shadow.appendChild(this.boxStyle);
		}else{
			this.shadow.appendChild(this.listStyle);
			this.addEventListener("click", (event) => {
				this.dispatchEvent(new CustomEvent("click cue", { instance: this.instanceID }));
			})
		}
	}
	
	removeCue(){
		if(this.parentNode.id == "box-content"){
			this.remove()
			socket.emit("cue:delete", this.id)
		}else{
			let idx = Array.prototype.indexOf.call(this.parentNode.children, this)
			socket.emit("cue:deleteListIdx", this.parentNode.id, idx)
		}
	}
	
	editCue(){
		console.log("edit", this.id)
		this.dispatchEvent(new CustomEvent("edit cue", { detail: this.id }));
	}
	
	activate(){
		console.log("click")
		socket.emit("cue activate", this.id)
		this.shadow.getElementById("cuebox").classList.add("activated")
		this.shadow.getElementById("cuebox").scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest"})
	}
	
	deactivate(){
		this.shadow.getElementById("cuebox").classList.remove("activated")
	}

}

customElements.define('cue-item', Cue);

