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

		socket.on("save-project:file", (data) => {
			console.log(data)
			let exportSpan = this.shadow.getElementById("export")
			exportSpan.innerHTML = `Processing: ${data.name}`
		})
		

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
				<fieldset>
					<button id="start">Start Session</button>
				</fieldset>
				<fieldset>
					<button id="stopsound">STOP Sounds</button>
				</fieldset>
				<fieldset>
					<input type="text" placeholder="second server adress" id="secondserver"></input><button id="secondserverconnect">connect</button>
				</fieldset>
				<fieldset>
					<button id="save">Save Project</button>
					<form id="upload">
						<div class="form-group">
							<input type="file" id="upload-file" name="export">
							
							<span id="export"></span>
						</div>
					</form>
				</fieldset>
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
			this.shadow.getElementById("secondserverconnect").innerHTML = data=="" ? "connect" : "disconnect"
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
			console.log("click connect")
			let addr = this.shadow.getElementById("secondserver").value
			if(this.shadow.getElementById("secondserverconnect").innerHTML == "disconnect"){
				addr = ""
			}
			socket.emit("secondserver:info", {adress: addr})
		})
		
		this.shadow.getElementById("stopsound").addEventListener("click", () => {
			socket.emit("session:stopsound")
			
		})
		
		this.shadow.getElementById("save").addEventListener("click", () => {
			console.log("saving...")

			var req = new XMLHttpRequest();
			req.open("GET", '/saveproject', true);
			req.responseType = "blob";
			req.onload = (event) => {
				var blob = req.response;
				var fileName = "export.zip" 
				var link=document.createElement('a');
				link.href=window.URL.createObjectURL(blob);
				link.download=fileName;
				link.click();
				this.shadow.getElementById("export").innerHTML = ''
			};

			req.send();
			
		})
		
		this.shadow.getElementById("upload-file").addEventListener("change", () => {
			var formdata = new FormData();
		
			let file = this.shadow.getElementById("upload-file").files[0]

			formdata.append('export', file);

			var request = new XMLHttpRequest();

			request.upload.addEventListener('progress', (e) => {
				if (e.lengthComputable) {
					const percent = Math.round((e.loaded / e.total) * 100);
					this.shadow.getElementById("export").innerHTML = `Uploading: ${percent}%`;
				}
			});
			
			request.onload = () => {
				if (request.status >= 200 && request.status < 300) {
					this.shadow.getElementById("export").innerHTML = "Upload finished. Unpacking files. New Cues will show up in a moment :)";
				} else {
					this.shadow.getElementById("export").innerHTML = `Upload failed: ${request.statusText}`;
				}
			};

			request.open('post', '/uploadproject');
			request.timeout = 0; //no timeout
			request.send(formdata);
		})
		
	}

}

customElements.define('debug-box', DebugBox);

