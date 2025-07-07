'use strict';
import { socket } from './socket.js';

export class Cue extends HTMLElement {
	constructor(data) {
		super();
		
		this.id = data.id
		this.specialCue = data.specialCue || false
		

		this.icon = data.icon ?? ""
		this.instanceID = Math.floor(Math.random()*10000)
		let splitcheck = this.id.split(";")
		this.name = data['cue-name'] || (splitcheck.length > 1 ? splitcheck.pop() : `Action: ${this.id}`)
		
		this.data = data
		this.playerIcon = this.specialCue ? "star" : "123"
		

		if(this.data["player-ids"] == "all"){
			this.playerIcon = "groups"
		}
		if(this.data["player-ids"] == "random"){
			this.playerIcon = "shuffle"
		}
		this.color = data.color ?? "var(--main-color)"
		
		this.shadow = this.attachShadow({ mode: 'open' });


		const cuecontainer = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		cuecontainer.innerHTML = `
			<link href="${window.location.origin}/static/control.css" rel="stylesheet" />
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
			<div draggable="true" id="cuebox">
				<span class="material-symbols-outlined" id="icon">${this.icon}</span>
				<span class="material-symbols-outlined" id="playerIcon">${this.playerIcon}</span>
				<p id="name"><slot>${this.name}</slot></p>
				<button id="delete"><span class="material-symbols-outlined">delete</span></button>
				<button id="edit"><span class="material-symbols-outlined">edit</span></button>
			</div>
		`;
		
		this.listStyle = document.createElement('style');
		this.listStyle.innerHTML = `
				div{
					height: 3vh;
					background-color: ${this.color};
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
					border-color: color-mix(in srgb, var(--action-color) 80%, white);
					border-width: 4px;
					background-color: color-mix(in srgb, var(--action-color) 70%, black);
				}

				.activated #delete{
					display: none;
				}
				
				#delete{
					margin-left: auto;
					background-color: color-mix(in srgb, ${this.color} 70%, white);
					border: none;
					border-radius: var(--radius);
					padding: var(--small-gap);
					font-family: sans-serif;
					display: none;
				}

				div:hover #delete{
					display: block;
				}
				
				#delete:hover{
					background-color: color-mix(in srgb, ${this.color} 40%, white);
				}
				
				#edit{
					display: none;
				}

				#delete span, #edit span{
					font-size: 19px !important;
					margin: 0 !important;
					color: white !important;
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

				p{
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					text-overflow: ellipsis;
					overflow: hidden;
				}
		`
		
		this.boxStyle = document.createElement('style');
		this.boxStyle.innerHTML = `
				div{
					height: 12vh;
					width: 12vh;
					background-color: ${this.color};
					color: white;
					border: 2px solid black;
					border-radius: var(--radius);
					position: relative;
					display: flex;
					align-items: center;
					justify-content: center;
					font-family: sans-serif;
				}
				div:hover{
					opacity: 0.8;
				}
				#icon{
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					font-size: 12vh !important;
					color: color-mix(in srgb, ${this.color} 80%, white);
					z-index: 1;
				}
				#playerIcon{
					position: absolute;
					bottom: 0;
					z-index: 2;
				}
				#delete{
					position: absolute;
					top: 5px;
					right: 5px;
					z-index: 3;
					display: none;
				}

				#delete span, #edit span{
					font-size: 19px !important;
					margin: 0 !important;
				}

				button{
					background-color: color-mix(in srgb, ${this.color} 30%, white);
					border: none;
					border-radius: var(--radius);
					padding: var(--small-gap);
					font-family: sans-serif;
				}
					
				button:hover{
					background-color: color-mix(in srgb, ${this.color} 10%, white);
				}

				#edit{
					position: absolute;
					top: 5px;
					right: 40px;
					z-index: 3;
					display: none;
				}

				div:hover #edit, div:hover #delete{
					display: block;
				}
				
				p{
					font-weight: bold;
					font-size: 1em;
					z-index: 2;
					word-break: break-word;
					overflow-wrap: break-word;
					text-align: center;
					text-overflow: ellipsis;
					max-height: 80%;
					overflow: hidden;
					margin-bottom: 40px;
					display: -webkit-box;
					-webkit-line-clamp: 5;
					-webkit-box-orient: vertical;
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
			let specialCue = event.dataTransfer.getData("special-cue") || false
			data.specialCue = specialCue
			if(specialCue){
				console.log("special cue", data)
			}

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

		if(this.specialCue){
			this.shadow.getElementById("name").addEventListener("dblclick", (e) => {
				this.shadow.getElementById("name").contentEditable = true
				this.shadow.getElementById("name").focus()
			})

			this.shadow.getElementById("name").addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					this.shadow.getElementById("name").blur();
				}
			});

			this.shadow.getElementById("name").addEventListener("blur", (e) => {
				this.shadow.getElementById("name").contentEditable = false
				let oldid = this.id.split(";")[0]
				this.id = `${oldid};${this.shadow.getElementById("name").textContent}`
				document.querySelector("cue-list").saveCueSequence()
			})
		}
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
		if (confirm("Are you sure you want to delete?")) {
			if(this.parentNode.id == "box-content"){
				
					this.remove()
					socket.emit("cue:delete", this.id)
			
			}else{
				let idx = Array.prototype.indexOf.call(this.parentNode.children, this)
				socket.emit("cue:deleteListIdx", this.parentNode.id, idx)
			}
		}
	}
	
	editCue(){
		console.log("edit", this.id)
		this.dispatchEvent(new CustomEvent("edit cue", { detail: this.id }));
	}
	
	activate(){
		console.log("click")
		let idx = Array.prototype.indexOf.call(this.parentNode.children, this)
		let sequenceName = this.parentNode.id
		if(this.specialCue){
			let mainID = this.id.split(";")[0]
			document.querySelector("debug-box").searchAndActivateSpecialCue(mainID)
			document.querySelector("answer-box").searchAndActivateSpecialCue(mainID)
		}
		console.log("click info", this.id, idx, sequenceName, this.specialCue)
		socket.emit("cue activate", this.id, idx, sequenceName, this.specialCue)
		
		
	}
	
	visuallyActivate(){
		this.shadow.getElementById("cuebox").classList.add("activated")
		this.shadow.getElementById("cuebox").scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest"})
	}
	
	deactivate(){
		this.shadow.getElementById("cuebox").classList.remove("activated")
	}

}

customElements.define('cue-item', Cue);

