'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionImageShare extends HTMLElement {
	
	static name = "Image Share"
	static icon = "send_to_mobile"
	static color = "#ec7263"
	
	constructor(msg, callback) {
		super();
		
		this.shadow = this.attachShadow({ mode: 'open' });
		this.info = msg

		const container = document.createElement('template');

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<link href="${window.location.origin}/static/player-style-classes.css" rel="stylesheet" />
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
			<style>
				
				img{
					max-width: 100%;
					max-height: 100%;
				}

				#wrapper{
					width: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				
				
				button:disabled{
					opacity: 0;
				}

				#photo{
					width: 100%;
					margin-bottom: 20vh;
				}

				#photo span{
					font-size: 20vh !important;
					margin: 3vh;
				}

				h1 span{
					font-size: 20vh !important;
				}
			</style>
			<div id="content">
				<h1 id="text">${msg.text}</h1>
				
				<button id="photo"><span class="material-symbols-outlined">add_a_photo</span></button>
				
				<input type="file" id="file" accept="image/png, image/jpeg" capture="camera" style="display: none;"></input>
				
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		callback({status: "ok"})

		this.shadow.getElementById("photo").addEventListener("click", (e) => {
			e.preventDefault();
			this.shadow.getElementById("file").click();
		});
		
		this.shadow.getElementById("file").addEventListener("click", () => {
			console.log("dispatch allow switch")
			this.dispatchEvent(new CustomEvent("allow-switch"))
		})
		
		this.shadow.getElementById("file").addEventListener("change", (e) => {
			if(e.target.files[0]){
				let img = new Image()
				img.id = "userimg"
				img.name = e.target.files[0].name

				img.addEventListener("load", () => {
					let maxSize = 800
					let filename = encodeURIComponent(img.name)
					let maxscale = Math.max(img.naturalWidth, img.naturalHeight) > maxSize ? maxSize / Math.max(img.naturalWidth, img.naturalHeight) : 1
					let canvas = document.createElement("canvas")
					canvas.width = img.naturalWidth * maxscale
					canvas.height = img.naturalHeight * maxscale
					console.log("scaling to", canvas.width, canvas.height, maxscale)
					let ctx = canvas.getContext("2d")
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
					
					canvas.toBlob((blob) => {
						let file = new File([blob], filename, { type: "image/jpeg" })
						//actionCallback({answer: answer})
						let name = Math.round(Math.random()*999999999999) + "-imageshare.jpg"
						this.dispatchEvent(new CustomEvent("interaction:fileupload", {detail: { file: file, name: name, info: msg }}));
						this.dispatchEvent(new CustomEvent("interaction:session-storage", {detail: { cueid:msg.id , playerid:msg.ownPlayerID, data: name }}));
						this.shadow.getElementById("file").remove()
						this.shadow.getElementById("photo").remove()
						this.shadow.getElementById("text").innerHTML = `<span class="material-symbols-outlined">check</span>`
						console.log("dispatch reenter fullscreen")
						this.dispatchEvent(new CustomEvent("reenter-fullscreen"))
						//this.dispatchEvent(new CustomEvent("interaction:answer:otherside", {detail: { name: filename, info: this.info, toPlayer: this.info.ownPlayerID }}));
						
					}, 'image/jpeg');
				})
				img.src = URL.createObjectURL( e.target.files[0] )
				


			}
			
		})
		
	}
	
	static shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
	
	static updateFromSessionStorage(header, container, msg){
		let cueID = header.getAttribute("cueID")
		container.querySelector("#ownImgs").innerHTML = ""
		
		console.log("session storage update", msg, cueID, msg[cueID])
		if(msg[cueID]){
			for (const [key, value] of Object.entries(msg[cueID])) {
				let imgDiv = document.createElement("div")
				imgDiv.classList.add("img")
				imgDiv.style.backgroundImage = `url('/media/playeruploads/${value}')`
				imgDiv.id = key
				imgDiv.name = `/media/playeruploads/${value}`
				container.querySelector("#ownImgs").appendChild(imgDiv)
				
				imgDiv.addEventListener("click", () => {
					delete msg[cueID][key]
					container.dispatchEvent(new CustomEvent("interaction:session-storage", {detail: msg }));
				})
				
			}	
		}
	}
	
	static handleAnswer(header, container, msg){
		console.log("id compare", header.getAttribute("cueID"), msg.info.id)
		console.log("msg.otherSide", msg.otherSide)
		
		const controlContent = document.createElement('template');
		controlContent.innerHTML = `
			<link href="${window.location.origin}/static/control.css" rel="stylesheet" />
			<style>
				.img-collection{
					display: flex;
					flex-wrap: wrap;
					border: 1px solid black;
					padding: 1vh;
				}
				.img{
					width: 4vh;
					height: 4vh;
					background-size: cover;
				}
				
				.img:hover{
					opacity: 0.5;
				}
			</style>
			<button id="fetch">fetch img from other side</button>
			<button id="rnd-share">Share own random</button>
			<button id="shuffle-share">Share own shuffled</button>
			<button id="id-share">Share 1:1</button>
			<button id="other-shuffle">Share OTHER</button>
			<button id="download-own">Download own Images</button>
			<div id="ownImgs" class="img-collection"></div>
			<div id="otherImgs" class="img-collection"></div>
		`
		
		
		if(msg.startup && header.getAttribute("cueID") != msg.info.id){
			console.log("CLEAR4")
			header.innerHTML = ""
			container.innerHTML = ""
			container.appendChild(controlContent.content.cloneNode(true));
			header.innerHTML = `${msg.info.text}`
			header.setAttribute("cueID", msg.info.id)
			
			container.querySelector("#fetch").addEventListener("click", () => {
				fetch(`https://${sessionStorage.getItem("secondServer")}/sessionStorage?cuename=${encodeURIComponent( msg.info['cue-name'] )}`, { 
					method: 'GET'
				})
				.then(function(response) { return response.json(); })
				.then(function(json) {
					console.log("json", json)
					container.querySelector("#otherImgs").innerHTML = ""
					for (const [key, value] of Object.entries(json)) {
						let imgDiv = document.createElement("div")
						imgDiv.classList.add("img")
						imgDiv.style.backgroundImage = `url('https://${sessionStorage.getItem("secondServer")}/media/playeruploads/${value}')`
						imgDiv.id = key
						imgDiv.name = `https://${sessionStorage.getItem("secondServer")}/media/playeruploads/${value}`
						container.querySelector("#otherImgs").appendChild(imgDiv)
					}	
				})
			})
			
			container.querySelector("#rnd-share").addEventListener("click", () => {
				container.dispatchEvent(new CustomEvent("interaction:show-answer", {detail: {paths: getPaths(container.querySelector("#ownImgs")), id: msg.info.id, mode:"own-random"} }));
			})
			
			container.querySelector("#shuffle-share").addEventListener("click", () => {
				let info = getPaths(container.querySelector("#ownImgs"))
				console.log(info)
				let shuffledPaths = InteractionImageShare.shuffle(Object.values(getPaths(container.querySelector("#ownImgs"))))
				let newData = {}
				for(let [key, value] of Object.entries(info)){
					newData[key] = shuffledPaths[key]
				}
				container.dispatchEvent(new CustomEvent("interaction:show-answer", {detail: {paths: info, id: msg.info.id, mode:"own-shuffle"} }));
			})
			
			container.querySelector("#id-share").addEventListener("click", () => {
				console.log("other-id")
				container.dispatchEvent(new CustomEvent("interaction:show-answer", {detail: {paths: getPaths(container.querySelector("#otherImgs")), id: msg.info.id, mode:"other-id"} }));

			})

			container.querySelector("#other-shuffle").addEventListener("click", () => {
				console.log("other-shuffle")
				container.dispatchEvent(new CustomEvent("interaction:show-answer", {detail: {paths: getPaths(container.querySelector("#otherImgs")), id: msg.info.id, mode:"other-shuffle"} }));

			})

			container.querySelector("#download-own").addEventListener("click", () => {
				let ownImgs = container.querySelector("#ownImgs")
				let links = []
				for(let img of ownImgs.childNodes){
					links.push(img.name)
				}
				console.log("LINKS", links)

				var req = new XMLHttpRequest();
				req.open("POST", '/downloadPlayerImages', true);
				req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				req.responseType = "blob";
				req.onload = (event) => {
					var blob = req.response;
					var fileName = "export.zip" 
					var link=document.createElement('a');
					link.href=window.URL.createObjectURL(blob);
					link.download=fileName;
					link.click();
				};

				req.send(JSON.stringify({filenames: links}));

			})
		}else{
			let imgDiv = document.createElement("div")
			imgDiv.classList.add("img")
			
			
			
			
			
			/*if(msg.receivedFromOtherSide){
				console.log("received from other Side")
				imgDiv.style.backgroundImage = `url('http://${sessionStorage.getItem("secondServer")}/media/playeruploads/${msg.name}')`
				imgDiv.id = msg.toPlayer
				imgDiv.name = `http://${sessionStorage.getItem("secondServer")}/media/playeruploads/${msg.name}`
				container.querySelector("#otherImgs").appendChild(imgDiv)
			}else if(!msg.toPlayer){
				console.log("received own answer") //ignoring answer that comes other side noticiation 
				imgDiv.style.backgroundImage = `url('/media/${msg.name}')`
				imgDiv.id = msg.playerID
				imgDiv.name = `${msg.name}`
				container.querySelector("#ownImgs").appendChild(imgDiv)
			}*/
			/*
			if(msg.name && !msg.toPlayer){
				console.log("received own answer") //ignoring answer that comes other side noticiation 
				imgDiv.style.backgroundImage = `url('/media/${msg.name}')`
				imgDiv.id = msg.playerID
				imgDiv.name = `${msg.name}`
				container.querySelector("#ownImgs").appendChild(imgDiv)
			}
			*/
		}
		
		function getPaths(div){
				let paths = {}
				for(let img of div.childNodes){
					paths[img.id] = img.name
				}
				console.log("PATHS", paths)
				return paths
		}
		
		let serverStore = JSON.parse( sessionStorage.getItem("serverStorage") )
		console.log("serverStore", serverStore)
		if(serverStore){
			InteractionImageShare.updateFromSessionStorage(header, container, serverStore)
		}
	}
	
	static shuffle(array) {
		let currentIndex = array.length;

		// While there remain elements to shuffle...
		while (currentIndex != 0) {

			// Pick a remaining element...
			let randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
		}
		return array
	}
	
	updateInformation(data){
		//console.log("update info", data)
		//update is fired when other side uploads image
	}
	
	///handled on smartphone
	handleAdditionalInfo(){
		console.log("additional Info")
		console.log(this.info)
		let newMsg = {
			type: "image"
		}
		
		switch(this.info.additionalInfo.mode){
			case "own-random":
			case "other-shuffle":
				let keys = Object.keys(this.info.additionalInfo.paths)
				let rndKeyID = Math.floor(Math.random() * keys.length)
				console.log("OWN-RND/OTHER-SHUFFLE", rndKeyID)
				newMsg.filename = this.info.additionalInfo.paths[ keys[rndKeyID]  ]
				break;
			case "own-shuffle":
				newMsg.filename = this.info.additionalInfo.paths[ this.info.ownPlayerID ]
				break;
			case "other-id":
				newMsg.filename = this.info.additionalInfo.paths[ this.info.ownPlayerID ]
				break;
			
				/*
				let pathArr = Object.values(this.info.additionalInfo.paths)
				console.log("other-shuffle", this.info.ownPlayerID,  pathArr.length)
				newMsg.filename = pathArr[ ( this.info.ownPlayerID + this.callCount ) % pathArr.length ]
				*/
				
		}
		
		this.dispatchEvent(new CustomEvent("interaction:forward", {detail: newMsg}))
		
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		if(this.info.additionalInfo){
			this.handleAdditionalInfo()
		}
	}
	
	static createFields(form){
		CustomInput.textInput(form, "text", "Title:")
	}

}

customElements.define('interaction-image-share', InteractionImageShare);
