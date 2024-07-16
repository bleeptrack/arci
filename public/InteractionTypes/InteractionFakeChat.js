'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionFakeChat extends HTMLElement {
	
	static name = "Fake Chat"
	static icon = "chat"
	
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
					height: 100%; 
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
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		callback({status: "ok"})
		
		
		
		
	}

	addSpeechBubble(text, own){
		let foundTyping = this.shadow.getElementById("chat").querySelector(".typing")
		
		if(foundTyping && !own){
			if(text != this.typingindicator){
				foundTyping.innerHTML = text
				foundTyping.classList.remove("typing")
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
			<div id="messagecount"></div>
			<div id="message"></div>
			<button id="sendbtn">SEND</button>
		`
		
		if(msg.startup && header.getAttribute("cueID") != msg.info.id){
			console.log(msg.info)
			console.log("CLEAR4")
			header.innerHTML = `${msg.info.text}`
			container.innerHTML = ""
			container.appendChild(controlContent.content.cloneNode(true));
			header.setAttribute("cueID", msg.info.id)
			container.querySelector("#messagecount").innerHTML = 1
			container.querySelector("#message").innerHTML = msg.info.items[0].message
			container.querySelector("#sendbtn").addEventListener("click", () => {
				let text = container.querySelector("#message").innerHTML
				container.dispatchEvent(new CustomEvent("interaction:show-update", {detail: text }))
				let currentid = Number( container.querySelector("#messagecount").innerHTML )
				if(msg.info.items[currentid]){
					container.querySelector("#message").innerHTML = msg.info.items[currentid].message
					container.querySelector("#messagecount").innerHTML = currentid + 1
				}else{
					container.innerHTML = "Chat finished"
				}
				
			})
		}else{
		
			
			
		}
	}
	
	handleAdditionalInfo(){
		console.log("additional Info")
		console.log(this.info)
		
	}
	
	updateInformation(data){
		console.log("update info2", data)
		this.addSpeechBubble(data, false)
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		if(this.info.additionalInfo){
			this.handleAdditionalInfo()
		}
	}
	
	static createFields(form){
		CustomInput.textInput(form, "text", "Title:")
		let list = document.createElement("ul")
		list.setAttribute("name", "items")
		
		let btn = document.createElement("button")
		btn.innerHTML = "+"
		btn.id = "add"
		list.appendChild(btn)
		btn.addEventListener("click", (e) => {
			e.preventDefault()
			InteractionFakeChat.addFields(list)
		})
		
		form.appendChild(list)
	}
	
	static addFields(list){
		
		let row = document.createElement("li")

		CustomInput.textInput(row, "message", "Message:")
		
		let delBtn = document.createElement("button")
		delBtn.innerHTML = "X"
		delBtn.addEventListener("click", (e) => {
			e.preventDefault()
			row.remove()
		})
		row.appendChild(delBtn)
		
		let btn = list.querySelector("#add")
		btn.before(row)
	}

}

customElements.define('interaction-fakechat', InteractionFakeChat);
