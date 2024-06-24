'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionImageShareSingle extends HTMLElement {
	
	static name = "Image Share Single"
	static icon = "p2p"
	
	constructor(msg, callback) {
		super();
		
		this.shadow = this.attachShadow({ mode: 'open' });
		this.info = msg

		const container = document.createElement('template');
		
		let selectivePart = `
			<h1>${msg.text}</h1>
			<input type="file" id="file"></input>
			<button id="sendBtn" disabled>send</button>
		`
		
		if(msg.ownPlayerID != msg.senderID){
			selectivePart = ""
		}

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
				${selectivePart}
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		callback({status: "ok"})
		
		if(msg.ownPlayerID == msg.senderID){
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
					this.dispatchEvent(new CustomEvent("interaction:answer", {detail: { filename: filename, info: msg }}));
					this.shadow.getElementById("content").innerHTML = ""
					console.log("dispatch reenter fullscreen")
					this.dispatchEvent(new CustomEvent("reenter-fullscreen"))
					//this.dispatchEvent(new CustomEvent("interaction:answer:otherside", {detail: { name: filename, info: this.info, toPlayer: this.info.ownPlayerID }}));
					
				}, 'image/jpeg');
			})
		}
		
	}
	
	
	static updateFromSessionStorage(header, container, msg){
		
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
				img{
					max-width: 100%;
				}
			</style>
			<button id="send">send image</button>
			<img id="img"></img>
		`
		
		
		if(msg.startup && header.getAttribute("cueID") != msg.info.id){
			console.log("CLEAR4")
			header.innerHTML = ""
			container.innerHTML = ""
			container.appendChild(controlContent.content.cloneNode(true));
			header.innerHTML = `${msg.info.text}`
			header.setAttribute("cueID", msg.info.id)
			
			
			
			
			
			container.querySelector("#send").addEventListener("click", () => {
			
				container.dispatchEvent(new CustomEvent("interaction:show-answer", {detail: {filename: container.querySelector("#img").src, id: msg.info.id} }));
			})
		}else{
			console.log("answer", msg)
			container.querySelector("#img").src = "/media/playeruploads/"+msg.filename
		}
		
	
		
		
	}
	
	updateInformation(data){
		console.log("image uploaded", data)
		//console.log("update info", data)
		//update is fired when other side uploads image
	}
	
	///handled on smartphone
	handleAdditionalInfo(){
		console.log("additional Info")
		console.log(this.info)
		let newMsg = {
			type: "image",
			filename: this.info.additionalInfo.filename
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
		CustomInput.textInput(form, "senderID", "Sender ID:")
	}

}

customElements.define('interaction-image-share-single', InteractionImageShareSingle);
