'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionFakeChat extends HTMLElement {
	
	static name = "Fake Chat"
	static icon = "chat"
	static color = "#38598b"
	
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
				
				.page {
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					font-family: "Roboto", sans-serif;
					}

					.marvel-device .screen {
					text-align: left;
					}

					.screen-container {
					height: 100%;
					}

					/* Status Bar */

					.status-bar {
					height: 25px;
					background: #004e45;
					color: #fff;
					font-size: 14px;
					padding: 0 8px;
					}

					.status-bar:after {
					content: "";
					display: table;
					clear: both;
					}

					.status-bar div {
					float: right;
					position: relative;
					top: 50%;
					transform: translateY(-50%);
					margin: 0 0 0 8px;
					font-weight: 600;
					}

					/* Chat */

					.chat {
					height: calc(100% - 69px);
					}

					.chat-container {
					height: 100%;
					}

					/* User Bar */

					.user-bar {
					height: 55px;
					background: #005e54;
					color: #fff;
					padding: 0 8px;
					font-size: 24px;
					position: relative;
					z-index: 1;
					display: none;
					}

					.user-bar:after {
					content: "";
					display: table;
					clear: both;
					}

					.user-bar div {
					float: left;
					transform: translateY(-50%);
					position: relative;
					top: 50%;
					}

					.user-bar .actions {
					float: right;
					margin: 0 0 0 20px;
					}

					.user-bar .actions.more {
					margin: 0 12px 0 32px;
					}

					.user-bar .actions.attachment {
					margin: 0 0 0 30px;
					}

					.user-bar .actions.attachment i {
					display: block;
					transform: rotate(-45deg);
					}

					.user-bar .avatar {
					margin: 0 0 0 5px;
					width: 36px;
					height: 36px;
					position: relative;
					overflow: hidden;
					border-radius: 50%;
					}

					.user-bar .avatar img {
					display: inline;
					margin: 0 auto;
					
					height: 100%;
					width: 100%;
					}

					.user-bar .name {
					font-size: 17px;
					font-weight: 600;
					text-overflow: ellipsis;
					letter-spacing: 0.3px;
					margin: 0 0 0 8px;
					overflow: hidden;
					white-space: nowrap;
					width: 110px;
					}

					.user-bar .status {
					display: block;
					font-size: 13px;
					font-weight: 400;
					letter-spacing: 0;
					}

					/* Conversation */

					.conversation {
					height: 100%;
					position: relative;
					/*
					background: #efe7dd url("https://cloud.githubusercontent.com/assets/398893/15136779/4e765036-1639-11e6-9201-67e728e86f39.jpg") repeat;
					*/
					z-index: 0;
					}

					.conversation ::-webkit-scrollbar {
					transition: all .5s;
					width: 5px;
					height: 1px;
					z-index: 10;
					}

					.conversation ::-webkit-scrollbar-track {
					background: transparent;
					}

					.conversation ::-webkit-scrollbar-thumb {
					background: #b3ada7;
					}

					.conversation .conversation-container {
					height: 100%;
					box-shadow: inset 0 10px 10px -10px #000000;
					overflow-x: hidden;
					padding: 0 16px;
					margin-bottom: 5px;
					}

					.conversation .conversation-container:after {
					content: "";
					display: table;
					clear: both;
					}

					/* Messages */

					.message {
					color: #000;
					clear: both;
					line-height: 1.2em;
					font-size: 1.2em;
					padding: 8px;
					position: relative;
					margin: 8px 0;
					max-width: 85%;
					z-index: -1;
					
					}

					.message:last-child{
						
						transform: scale(0);
						animation-fill-mode: forwards;
						animation-name: expand-bounce;
						animation-duration: 0.3s;
					}

					@keyframes expand-bounce {
						0% {
							transform: scale(0);
						}
						50% {
							transform: scale(1.1);
						}
						100% {
							transform: scale(1);
						}
					}

					.message:after {
					position: absolute;
					content: "";
					width: 0;
					height: 0;
					border-style: solid;
					}

					.metadata {
					display: inline-block;
					float: right;
					padding: 0 0 0 7px;
					position: relative;
					bottom: -4px;
					}

					.metadata .time {
					color: rgba(0, 0, 0, .45);
					font-size: 11px;
					display: inline-block;
					}

					.metadata .tick {
					display: inline-block;
					margin-left: 2px;
					position: relative;
					top: 4px;
					height: 16px;
					width: 16px;
					}

					.metadata .tick svg {
					position: absolute;
					transition: .5s ease-in-out;
					}

					.metadata .tick svg:first-child {
					-webkit-backface-visibility: hidden;
							backface-visibility: hidden;
					-webkit-transform: perspective(800px) rotateY(180deg);
							transform: perspective(800px) rotateY(180deg);
					}

					.metadata .tick svg:last-child {
					-webkit-backface-visibility: hidden;
							backface-visibility: hidden;
					-webkit-transform: perspective(800px) rotateY(0deg);
							transform: perspective(800px) rotateY(0deg);
					}

					.metadata .tick-animation svg:first-child {
					-webkit-transform: perspective(800px) rotateY(0);
							transform: perspective(800px) rotateY(0);
					}

					.metadata .tick-animation svg:last-child {
					-webkit-transform: perspective(800px) rotateY(-179.9deg);
							transform: perspective(800px) rotateY(-179.9deg);
					}

					.message:first-child {
					margin: 16px 0 8px;
					}

					.message.received {
					transform-origin: 0% 0%;
					background: #fff;
					border-radius: 0px 5px 5px 5px;
					float: left;
					}

					.message.received .metadata {
					padding: 0 0 0 16px;
					}

					.message.received:after {
					border-width: 0px 10px 10px 0;
					border-color: transparent #fff transparent transparent;
					top: 0;
					left: -10px;
					}

					.message.sent {
					transform-origin: 100% 0%;
					background: #e1ffc7;
					border-radius: 5px 0px 5px 5px;
					float: right;
					}

					.message.sent:after {
					border-width: 0px 0 10px 10px;
					border-color: transparent transparent transparent #e1ffc7;
					top: 0;
					right: -10px;
					}

					/* Compose */

					.conversation-compose {
					display: flex;
					flex-direction: row;
					align-items: flex-end;
					justify-content: space-between;
					gap: 10px;
					padding: 0 10px;
					height: 50px;
					width: calc(100% - 20px);
					z-index: 2;
					}

					.conversation-compose div,
					.conversation-compose input {
					background: #fff;
					height: 100%;
					}

					.conversation-compose .emoji {
					display: flex;
					align-items: center;
					justify-content: center;
					background: white;
					
					flex: 0 0 auto;
					
					width: 48px;
					}

					.conversation-compose .input-msg {
					border: 0;
					border-radius: 5px 5px 5px 5px;
					
					flex: 1 1 auto;
					font-size: 16px;
					position: relative;
					outline: none;
					min-width: 50%;
					padding-left: 10px;
					}

					.conversation-compose .photo {
					flex: 0 0 auto;
					border-radius: 0 0 5px 0;
					text-align: center;
					position: relative;
					width: 48px;
					}

					

					.conversation-compose .photo i {
					display: block;
					color: #7d8488;
					font-size: 24px;
					transform: translate(-50%, -50%);
					position: relative;
					top: 50%;
					left: 50%;
					}

					.conversation-compose .send {
					background: #008a7c;
					border-radius: 50%;
					color: #fff;
					
					width: 48px;
					height: 48px;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 0;
					border: none;
					}

					.send svg{
						width: 50%;
						height: 50%;
					}

					.conversation-compose .send .circle {
					
					}

					.message-span:not(:first-child){
						border-top: 2px solid lightgrey;
						display: inline-block;
					}
					
					.message-span{
						padding: 10px 0px;
						display: inline-block;
					}
					

					/* Small Screens */

					@media (max-width: 768px) {
						.marvel-device.nexus5 {
							border-radius: 0;
							flex: none;
							padding: 0;
							max-width: none;
							overflow: hidden;
							height: 100%;
							width: 100%;
						}

						.marvel-device > .screen .chat {
							visibility: visible;
						}

						.marvel-device {
							visibility: hidden;
						}

						.marvel-device .status-bar {
							display: none;
						}

						.screen-container {
							position: absolute;
							top: 0;
							left: 0;
							right: 0;
							bottom: 0;
						}

						.conversation {
							height: 100%;
						}
						.conversation .conversation-container {
							
						}
					}	
			</style>
			<div id="content">
				
				<div class="page">
				<div class="marvel-device nexus5">
					<div class="screen">
					<div class="screen-container">
						
						<div class="chat">
						<div class="chat-container">
							<div class="user-bar">
							<div class="back">
								<i class="zmdi zmdi-arrow-left"></i>
							</div>
							<div class="avatar">
								<img src="./media/${this.info.avatar}" alt="Avatar">
							</div>
							<div class="name">
								<span>${this.info.personName}</span>
								<span class="status">online</span>
							</div>
							<div class="actions more">
								<i class="zmdi zmdi-more-vert"></i>
							</div>
							<div class="actions attachment">
								<i class="zmdi zmdi-attachment-alt"></i>
							</div>
							<div class="actions">
								<i class="zmdi zmdi-phone"></i>
							</div>
							</div>
							<div class="conversation">
							<div class="conversation-container" id="chat-content">
								
							</div>
							
							</div>
						</div>
						</div>
					</div>
					</div>
				</div>
				</div>
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		callback({status: "ok"})
		
		
		
	}

	addSpeechBubble(text, own){
		/*
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
		*/
		let tickSVG = `<span class="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"/></svg></span>`
		let type = own ? "sent" : 'received'
		//let ticks = own ? tickSVG : ""
		let ticks = ""
		let bubble = `
			</div>
			<div class="message ${type}">
			${text}
			
			</div>
		`
		this.shadow.getElementById("chat-content").innerHTML += bubble
		this.shadow.getElementById("chat-content").scrollTop = this.shadow.getElementById("chat-content").scrollHeight;
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
			<button id="sendbtn">SEND</button>
			<div id="messagecount"></div>
			<div id="message"></div>
			
		`
		
		if(msg.startup && header.getAttribute("cueID") != msg.info.id){
			console.log(msg.info)
			console.log("CLEAR4")
			header.innerHTML = `${msg.info['cue-name']}`
			container.innerHTML = ""
			container.appendChild(controlContent.content.cloneNode(true));
			header.setAttribute("cueID", msg.info.id)
			container.querySelector("#messagecount").innerHTML = 1
			let msgText = `<span class="message-span">${msg.info.items[0]['message-th']}</span>`
			
			msgText += msg.info.items[0]['message'] ? `</br><span class="message-span">${msg.info.items[0]['message']}</span>` : ""
			msgText += msg.info.items[0]['message-de'] ? `</br><span class="message-span">${msg.info.items[0]['message-de']}</span>` : ""
			
			container.querySelector("#message").innerHTML = msgText
			container.querySelector("#message").setAttribute("owner", msg.info.items[0]["own-message"])
			container.querySelector("#sendbtn").addEventListener("click", () => {
				let text = container.querySelector("#message").innerHTML
				let own = container.querySelector("#message").getAttribute("owner") == 'true'
				container.dispatchEvent(new CustomEvent("interaction:show-update", {detail: {text:text, own:own}}))
				let currentid = Number( container.querySelector("#messagecount").innerHTML )
				if(msg.info.items[currentid]){
					msgText = `<span class="message-span">${msg.info.items[currentid]['message-th']}</span>`
					msgText += msg.info.items[currentid]['message'] ? `</br><span class="message-span">${msg.info.items[currentid]['message']}</span>` : ""
					msgText += msg.info.items[currentid]['message-de'] ? `</br><span class="message-span">${msg.info.items[currentid]['message-de']}</span>` : ""
					container.querySelector("#message").innerHTML = msgText
					container.querySelector("#message").setAttribute("owner", msg.info.items[currentid]["own-message"])
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
		this.addSpeechBubble(data.text, data.own)
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		if(this.info.additionalInfo){
			this.handleAdditionalInfo()
		}
	}
	
	static createFields(form){
		CustomInput.textInput(form, "personName", "Contact Name:")
		CustomInput.filepicker(form, "avatar", "Contact Photo:")
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
		row.setAttribute("draggable", "true")
		row.id = Math.random().toString(36).substring(2, 15)

		CustomInput.textInput(row, "message", "EN:")
		CustomInput.textInput(row, "message-de", "DE:")
		CustomInput.textInput(row, "message-th", "TH:")
		CustomInput.checkbox(row, "own-message")
		
		let delBtn = document.createElement("button")
		delBtn.innerHTML = "X"
		delBtn.addEventListener("click", (e) => {
			e.preventDefault()
			row.remove()
		})
		row.appendChild(delBtn)
		
		let btn = list.querySelector("#add")
		btn.before(row)


		row.addEventListener("drop", (event) => {
			event.preventDefault();
			event.stopPropagation()
			
			let id = event.dataTransfer.getData("data")
			let moveRow = list.querySelector(`[id="${id}"]`)
			let targetRow = event.target.closest("li")
			//event.target.removeDisplayInsert()
			
			if(targetRow.classList.contains("insertAbove")){
				targetRow.before(moveRow)
			}else{
				targetRow.after(moveRow)
			}

			targetRow.classList.remove("insertAbove")
			targetRow.classList.remove("insertBelow")
		})
		
		
		row.addEventListener("dragover", (event) => {
		// prevent default to allow drop
			event.preventDefault();
			
			let targetRow = event.target.closest("li")

			let targetCenter = targetRow.getBoundingClientRect().top + (targetRow.getBoundingClientRect().height / 2)
			let pos = event.clientY
			
			
			if(pos < targetCenter){
				targetRow.classList.add("insertAbove")
				targetRow.classList.remove("insertBelow")
			}else{
				targetRow.classList.remove("insertAbove")
				targetRow.classList.add("insertBelow")
			}
			
			//console.log(pos < targetCenter, pos, targetCenter)
		});
		
		row.addEventListener("dragleave", (event) => {
		// prevent default to allow drop
			event.preventDefault()
			
			let targetRow = event.target.closest("li")
			targetRow.classList.remove("insertAbove")
			targetRow.classList.remove("insertBelow")
		});
		
		row.addEventListener('dragstart', (event) => {
			console.log("drag start", row.id)
			event.dataTransfer.setData("data", row.id);
			event.dataTransfer.dropEffect = "move";
		})


	}

}

customElements.define('interaction-fakechat', InteractionFakeChat);
