'use strict';
import { socket } from './socket.js';

export class Cue extends HTMLElement {
	constructor(data) {
		super();
		
		console.log("cue", data['cue-name'])
		this.id = data.id
		this.instanceID = Math.floor(Math.random()*10000)
		this.name = data['cue-name']
		this.data = data
		this.shadow = this.attachShadow({ mode: 'open' });


		const cuecontainer = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		cuecontainer.innerHTML = `
			<div draggable="true" id="cuebox">
				<slot>${this.name}</slot>
				<button id="delete"> X </button>
				<button id="edit"> E </button>
			</div>
		`;
		
		this.listStyle = document.createElement('style');
		this.listStyle.innerHTML = `
				div{
					height: 3vh;
					width: 100%;
					background-color: var(--main-color);
					color: white;
				}
				
				.activated{
					border: 1px solid red;
				}
				
				#edit{
					display: none;
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
		
		/*this.addEventListener("drop", (event) => {
			event.preventDefault();
			console.log("drop")
		})
		
		this.addEventListener("dragover", (event) => {
		// prevent default to allow drop
			event.preventDefault();
		});*/
		
		this.addEventListener('dragstart', (event) => {
			console.log("drag start", this.data)
			event.dataTransfer.setData("data", JSON.stringify(this.data));
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
			console.log("parent", this.parentNode, idx)
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
	}
	
	deactivate(){
		this.shadow.getElementById("cuebox").classList.remove("activated")
	}

}

customElements.define('cue-item', Cue);

