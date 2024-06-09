'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionImageShare extends HTMLElement {
	
	static name = "Image Share"
	static icon = "send_to_mobile"
	
	constructor(msg, callback) {
		super();
		
		this.shadow = this.attachShadow({ mode: 'open' });
		this.info = msg

		const container = document.createElement('template');

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<link href="${window.location.origin}/static/player-style-classes.css" rel="stylesheet" />
			<style>
				#content{
					position: fixed;
					top: 0;
					left: 0;
					height: 100vh;
					width: 100vw;
					background-size: cover;
					background-position: center;
					z-index: 10;
				}
				img{
					max-width: 90%;
					max-height: 50%;
				}
				button{
					margin-bottom: 20%;
				}
				button:disabled{
					opacity: 0;
				}
			</style>
			<div id="content">
				<h1>${msg.text}</h1>
				<input type="file" id="file"></input>
				<button id="sendBtn" disabled>send</button>
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		callback({status: "ok"})
		
		this.shadow.getElementById("file").addEventListener("click", () => {
			console.log("dispatch allow switch")
			this.dispatchEvent(new CustomEvent("allow-switch"))
		})
		
		this.shadow.getElementById("file").addEventListener("change", (e) => {
			if(e.target.files[0]){
				let image = new Image()
				image.id = "userimg"
				image.name = e.target.files[0].name
				e.target.replaceWith(image)
				image.src = URL.createObjectURL( e.target.files[0] )
				this.shadow.getElementById("sendBtn").disabled = false
			}
			
		})
		
		this.shadow.getElementById("sendBtn").addEventListener("click", () => {
			
			let maxSize = 800
			let img = this.shadow.getElementById("userimg")
			let filename = encodeURIComponent(img.name)
			let maxscale = Math.max(img.naturalWidth, img.naturalHeight) > maxSize ? maxSize / Math.max(img.naturalWidth, img.naturalHeight) : 1
			let canvas = document.createElement("canvas")
			canvas.width = img.naturalWidth * maxscale
			canvas.height = img.naturalHeight * maxscale
			console.log("scaling to", canvas.width, canvas.height, maxscale)
			let ctx = canvas.getContext("2d")
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
			
			var dataurl = canvas.toDataURL("image/jpeg", 0.2);
			img.src = dataurl;
			
			canvas.toBlob((blob) => {
				let file = new File([blob], filename, { type: "image/jpeg" })
				//actionCallback({answer: answer})
				this.dispatchEvent(new CustomEvent("interaction:fileupload", {detail: { file: file, name: filename, info: msg }}));
				this.dispatchEvent(new CustomEvent("interaction:session-storage", {detail: { cueid:msg.id , playerid:msg.ownPlayerID, data: filename }}));
				this.shadow.getElementById("content").innerHTML = ""
				console.log("dispatch reenter fullscreen")
				this.dispatchEvent(new CustomEvent("reenter-fullscreen"))
				//this.dispatchEvent(new CustomEvent("interaction:answer:otherside", {detail: { name: filename, info: this.info, toPlayer: this.info.ownPlayerID }}));
				
			}, 'image/jpeg');
			
			/*
			let file = dataurl //this.shadow.getElementById("file").files[0]
			let filename = file.name
			//actionCallback({answer: answer})
			this.dispatchEvent(new CustomEvent("interaction:fileupload", {detail: { file: file, name: filename, info: msg }}));
			this.shadow.getElementById("content").innerHTML = ""
			console.log("dispatch reenter fullscreen")
			this.dispatchEvent(new CustomEvent("reenter-fullscreen"))
			*/
		})
		
	}
	
	static shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
	
	static updateFromSessionStorage(header, container, msg){
		for (const [key, value] of Object.entries(msg.data)) {
			let imgDiv = document.createElement("div")
			imgDiv.classList.add("img")
			imgDiv.style.backgroundImage = `url('https://${sessionStorage.getItem("secondServer")}/media/playeruploads/${value}')`
			imgDiv.id = key
			imgDiv.name = `https://${sessionStorage.getItem("secondServer")}/media/playeruploads/${value}`
			container.querySelector("#otherImgs").appendChild(imgDiv)
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
			</style>
			<button id="fetch">fetch img from other side</button>
			<button id="rnd-share">Share own random</button>
			<button id="id-share">Share 1:1</button>
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
			})
			
			container.querySelector("#rnd-share").addEventListener("click", () => {
				container.dispatchEvent(new CustomEvent("interaction:show-answer", {detail: {paths: getPaths(container.querySelector("#ownImgs")), id: msg.info.id, mode:"own-random"} }));
			})
			
			container.querySelector("#id-share").addEventListener("click", () => {
				console.log()
				container.dispatchEvent(new CustomEvent("interaction:show-answer", {detail: {paths: getPaths(container.querySelector("#otherImgs")), id: msg.info.id, mode:"other-id"} }));
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
			
			if(msg.name && !msg.toPlayer){
				console.log("received own answer") //ignoring answer that comes other side noticiation 
				imgDiv.style.backgroundImage = `url('/media/${msg.name}')`
				imgDiv.id = msg.playerID
				imgDiv.name = `${msg.name}`
				container.querySelector("#ownImgs").appendChild(imgDiv)
			}
		}
		
		function getPaths(div){
				let paths = {}
				for(let img of div.childNodes){
					paths[img.id] = img.name
				}
				console.log("PATHS", paths)
				return paths
		}
	}
	
	updateInformation(data){
		//console.log("update info", data)
		//update is fired when other side uploads image
	}
	
	handleAdditionalInfo(){
		console.log("additional Info")
		console.log(this.info)
		let newMsg = {
			type: "image"
		}
		switch(this.info.additionalInfo.mode){
			case "own-random":
				
				let keys = Object.keys(this.info.additionalInfo.paths)
				let rndKeyID = Math.floor(Math.random() * keys.length)
				console.log("OWN-RND", rndKeyID)
				newMsg.filename = this.info.additionalInfo.paths[ keys[rndKeyID]  ]
				break;
			case "other-id":
				newMsg.filename = this.info.additionalInfo.paths[ this.info.ownPlayerID ]
				break;
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
