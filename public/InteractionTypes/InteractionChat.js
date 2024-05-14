'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionChat extends HTMLElement {
	
	static name = "Chat"
	static icon = "forum"
	
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
					max-width: 90%;
					max-height: 50%;
				}
				button{
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
					height: 100%;
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
			this.dispatchEvent(new CustomEvent("interaction:answer", {detail: { answer: this.shadow.getElementById("text").value, info: this.info }}));
			this.shadow.getElementById("text").value = ""
		})
		
		
	}

	addSpeechBubble(text, own){
		let bubble = document.createElement("div")
		bubble.classList.add("bubble")
		bubble.innerHTML = text
		this.shadow.getElementById("chat").appendChild(bubble)
		if(own){
			bubble.classList.add("own")
		}else{
			bubble.classList.add("other")
		}
		this.shadow.getElementById("chat").scrollTop = this.shadow.getElementById("chat").scrollHeight;
	}
	
	static handleAnswer(header, container, msg){
		console.log("id compare", header.getAttribute("cueID"), msg.info.id)
		console.log("msg.otherSide", msg.otherSide)
		
		if(msg.otherSide){
			//container.dispatchEvent(new CustomEvent("interaction:show-answer", {detail: msg}));
			container.dispatchEvent(new CustomEvent("interaction:show-update", {detail: {answer: msg.answer, id: msg.info.id, toPlayer: msg.toPlayer} }));
		}else{
			console.log("updating other side")
			container.dispatchEvent(new CustomEvent("interaction:update-other-side", {detail: {answer: msg.answer, info: msg.info, otherSide: true, toPlayer: msg.playerID} }));
		}
		
		
		if(Number(header.getAttribute("cueID")) != Number(msg.info.id) && !msg.otherSide){
			console.log("CLEAR4")
			header.innerHTML = ""
			container.innerHTML = ""
		}
		if(header.innerHTML == ""){
			
		}
		
		
		
	}
	
	handleAdditionalInfo(){
		console.log("additional Info")
		console.log(this.info)
		
	}
	
	updateInformation(data){
		console.log("update info", data)
		if(data.toPlayer == this.info.ownPlayerID){
			this.addSpeechBubble(data.answer, false)
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
