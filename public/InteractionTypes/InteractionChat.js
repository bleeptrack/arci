'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionChat extends HTMLElement {
	
	static name = "Chat"
	static icon = "forum"
	
	constructor(msg, callback) {
		super();
		
		this.shadow = this.attachShadow({ mode: 'open' });
		this.info = msg
		this.typingindicator = "[✍️...]"
		this.isTyping = false
		

		const container = document.createElement('template');

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<link href="${window.location.origin}/static/player-style-classes.css" rel="stylesheet" />
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
			<style>
				
				img{
					max-width: 90%;
					max-height: 50%;
				}
				button{<link href="${window.location.origin}/static/player-style-classes.css" rel="stylesheet" />
					width: 20%;
				}
				#text{
					flex-grow: 1;
				}
				#message{
					display: flex;
					direction: row;
					width: 90%;
				}
				#chat{
					width: 100%;
					/* height: 100%; */
					flex-shrink: 1;
					overflow: scroll;
					display: flex;
					flex-direction: column;
					
				}
				#content{
					display: flex;
					flex-direction: column;
					justify-content: space-between;
				}
				.bubble{
					
					max-width: 70%;
					
					padding: 0.5em;
					margin-bottom: 1em;
					border-radius: var(--button-border-radius);
					font-family: sans-serif;
					align-content: center;
				}
				.own{
					align-self: end;
					background-color: white;
				}
				.other{
					align-self: start;
					background-color: lightgrey;
				}
				.typing{
					opacity: 0.5;
				}
			</style>
			<div id="content">
				<h1>${msg.text}</h1>
				<div id="chat"></div>
				<div id="message">
					<input type="text" id="text"></input>
					<button id="sendBtn">
						<span class="material-symbols-outlined">
							send
						</span>
					</button>
				<div>
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		callback({status: "ok"})
		
		this.shadow.getElementById("sendBtn").addEventListener("click", btn => {
			//console.log(this.shadow)
			this.addSpeechBubble(this.shadow.getElementById("text").value, true)
			this.dispatchEvent(new CustomEvent("interaction:answer:otherside", {detail: { answer: this.shadow.getElementById("text").value, info: this.info, toPlayer: this.info.ownPlayerID }}));
			this.shadow.getElementById("text").value = ""
		})
		
		
		this.shadow.getElementById("text").addEventListener("focus", e => {
			console.log("focused", e.target)
			if(document.fullscreenElement){
				this.shadow.getElementById("content").style.paddingBottom = "50vh"
			}
			
		})
		
		
		this.shadow.getElementById("text").addEventListener("focusout", e => {
			console.log("focused", e.target)
			this.shadow.getElementById("content").style.paddingBottom = "0px"
		})
		

		
		
		this.shadow.getElementById("text").addEventListener("keyup", event => {
			if (event.keyCode === 13) {
				this.shadow.getElementById("sendBtn").click()
			}
			
				clearTimeout(this.typingTimer)
				if(!this.isTyping){
					this.dispatchEvent(new CustomEvent("interaction:answer:otherside", {detail: { answer: this.typingindicator, info: this.info, toPlayer: this.info.ownPlayerID }}));
					this.isTyping = true
				}
				
				
				this.typingTimer = setTimeout(() => {
					this.isTyping = false
					this.dispatchEvent(new CustomEvent("interaction:answer:otherside", {detail: { answer: "!"+this.typingindicator, info: this.info, toPlayer: this.info.ownPlayerID }}));
					
				}, 2000)
			
		});
		
		
	}

	addSpeechBubble(text, own){
		let foundTyping = this.shadow.getElementById("chat").querySelector(".typing")
		
		if(foundTyping && !own){
			if(text != this.typingindicator){
				foundTyping.innerHTML = text
				foundTyping.classList.remove("typing")
				foundTyping.id = Math.round(Math.random()*999999)
				this.dispatchEvent(new CustomEvent("translate", {detail: { text: text, langTo: 'en,de,th', bubbleID: foundTyping.id  }}));
				
			}
			if( text == "!"+this.typingindicator ){
				foundTyping.remove()
			}
		}else if( text != "!"+this.typingindicator ){
			
			let bubble = document.createElement("div")
			bubble.classList.add("bubble")
			bubble.innerHTML = text
			this.shadow.getElementById("chat").appendChild(bubble)
			if(own){
				bubble.classList.add("own")
			}else{
				bubble.classList.add("other")
				if(text == this.typingindicator){
					bubble.classList.add("typing")
				}else{
					bubble.id = Math.round(Math.random()*999999)
					this.dispatchEvent(new CustomEvent("translate", {detail: { text: text, langTo: 'en,de,th', bubbleID: bubble.id  }}));
				}
			}
		}
		this.shadow.getElementById("chat").scrollTop = this.shadow.getElementById("chat").scrollHeight;
	}
	
	static handleAnswer(header, container, msg){
		console.log("id compare", header.getAttribute("cueID"), msg.info.id)
		console.log("msg.otherSide", msg.otherSide)
		
		const controlContent = document.createElement('template');
		controlContent.innerHTML = `
			<link href="${window.location.origin}/static/control.css" rel="stylesheet" />
			<style>
				#boxes{
					display: flex;
					flex-wrap: wrap;
				}
				
				.messagebox{
					width: 3vh;
					height: 3vh;
					display: flex;
					justify-content: center;
					background-color: var(--action-color);
					align-items: center;
					color: white;
					font-family: sans-serif;
					border: 2px solid black;
					border-radius: var(--radius);
				}
				
				.animate{
					background-color: var(--main-color);
					transition: background-color 0.5s linear;
				}
			</style>
			<div id="boxes"></div>
		`
		
		if(msg.startup && header.getAttribute("cueID") != msg.info.id){
			console.log("CLEAR4")
			header.innerHTML = `${msg.info.text}`
			container.innerHTML = ""
			container.appendChild(controlContent.content.cloneNode(true));
			header.setAttribute("cueID", msg.info.id)
		}else{
		
			if(msg.playerID){
				let boxcontainer = container.querySelector("#boxes")
				let box = boxcontainer.querySelector(`#player-${msg.playerID}`)
				if(!box){
					box = document.createElement(`div`)
					box.innerHTML = msg.playerID
					box.id = `player-${msg.playerID}`
					box.classList.add("messagebox")
					boxcontainer.appendChild(box)
				}
				
				boxcontainer.querySelector(`#player-${msg.playerID}`).classList.remove("animate")
				boxcontainer.querySelector(`#player-${msg.playerID}`).offsetWidth;
				boxcontainer.querySelector(`#player-${msg.playerID}`).classList.add("animate")
				
				if(msg.receivedFromOtherSide){
					console.log("other side received")
				}else{
					console.log("updating other side")
					
				}
			}
			
		}
	}
	
	handleAdditionalInfo(){
		console.log("additional Info")
		console.log(this.info)
		
	}
	
	updateInformation(data){
		console.log("update info2", data)
		if(data.toPlayer == this.info.ownPlayerID){
			this.addSpeechBubble(data.answer, false)
		}
		if(data.translation){
			console.log(data.translation)
			this.shadow.getElementById(data.bubbleID).innerHTML = `<span class="translation">${data.translation[0].text}</span></br><span class="translation">${data.translation[1].text}</span></br><span class="translation">${data.translation[2].text}</span>`
		}
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

customElements.define('interaction-chat', InteractionChat);
