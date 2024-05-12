'use strict';
import { socket } from './socket.js';

class DebugBox extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		this.session = false
		
		socket.on("session:info", (data) => { 
			console.log(data) 
			this.session = data
			this.updateSessionGUI()
		});

		

		const boxcontainer = document.createElement('template');

		// creating the inner HTML of the editable list element
		boxcontainer.innerHTML = `
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

			<style>
			
				.sessionrunning{
					border: 3px solid red;
				}
			</style>
			<div id="box-content">
				<button id="start">Start Session</button>
				<button id="stopsound">STOP Sounds</button>
				<input type="text" placeholder="second server adress" id="secondserver"></input><button id="secondserverconnect">connect</button>
				<button id="save">Save Project</button>
				<form action="/uploadproject" enctype="multipart/form-data" method="post">
					<div class="form-group">
						<input type="file"  name="export">
						<input type="submit" value="Upload Project">
					</div>
				</form>
			</div>
		
		`;

		// binding methods
		//this.addListItem = this.addListItem.bind(this);
		//this.handleRemoveItemListeners = this.handleRemoveItemListeners.bind(this);
		//this.removeListItem = this.removeListItem.bind(this);

		// appending the container to the shadow DOM
		this.shadow.appendChild(boxcontainer.content.cloneNode(true));
		
		
	}
	

	updateSessionGUI(){
		if(this.session){
			this.shadow.getElementById("start").innerHTML = "STOP Session"
			this.shadow.getElementById("box-content").classList.add("sessionrunning")
		}else{
			this.shadow.getElementById("start").innerHTML = "START Session"
			this.shadow.getElementById("box-content").classList.remove("sessionrunning")
		}
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		
		socket.on("secondserver:info", (data) => { 
			console.log(data) 
			this.shadow.getElementById("secondserver").value = data
			this.shadow.getElementById("secondserverconnect").innerHTML = "disconnect"
			sessionStorage.setItem("secondServer", data);
		});
		
		this.shadow.getElementById("start").addEventListener("click", () => {
			if(this.session){
				socket.emit("session:end")
			}else{
				socket.emit("session:start")
			}
		})
		
		this.shadow.getElementById("secondserverconnect").addEventListener("click", () => {
			let addr = this.shadow.getElementById("secondserver").value
			socket.emit("secondserver:info", {adress: addr})
		})
		
		this.shadow.getElementById("stopsound").addEventListener("click", () => {
			socket.emit("session:stopsound")
			
		})
		
		this.shadow.getElementById("save").addEventListener("click", () => {
			socket.emit("session:save")
			
		})
		
	}

}

customElements.define('debug-box', DebugBox);

