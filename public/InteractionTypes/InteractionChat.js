'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionChat extends HTMLElement {
	
	static name = "Chat"
	static icon = "forum"
	static color = "#113f67"
	
	constructor(msg, callback) {
		super();
		
		this.shadow = this.attachShadow({ mode: 'open' });
		this.info = msg
		this.typingindicator = "[✍️...]"
		this.isTyping = false
		this.playerLengthOwnSide = msg.availablePlayers.length
		this.availablePlayersOwnSide = msg.availablePlayers
		this.myRoomID = msg.availablePlayers.indexOf(msg.ownPlayerID)
		

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
					height: calc(100% - 12px);
					position: relative;
					background: #efe7dd url("https://cloud.githubusercontent.com/assets/398893/15136779/4e765036-1639-11e6-9201-67e728e86f39.jpg") repeat;
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
					height: calc(100% - 68px);
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
					line-height: 18px;
					font-size: 15px;
					padding: 8px;
					position: relative;
					margin: 8px 0;
					max-width: 85%;
					word-wrap: break-word;
					z-index: -1;
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
					background: #fff;
					border-radius: 0px 5px 5px 5px;
					float: left;
					}

					.message.received .metadata {
					padding: 0 0 0 16px;
					}

					.message.received:after {
					border-width: 0px 10px 10px 0;
					
					top: 0;
					left: -10px;
					border-color: transparent;
					border-right-color: inherit;
					}

					.message.sent {
					background: #e1ffc7;
					border-radius: 5px 0px 5px 5px;
					float: right;
					}

					.message.sent:after {
					border-width: 0px 0 10px 10px;
					top: 0;
					right: -10px;
					border-color: transparent;
					border-left-color: inherit;
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
							height: calc(100svh - 55px);
						}
						.conversation .conversation-container {
							height: calc(100svh - 120px);
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
							
							<div class="name">
								<span>Another Person</span>
								<span class="status" id="status">online</span>
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
							<div class="conversation-compose">
								
								<input class="input-msg" id="input" name="input" placeholder="Type a message" autocomplete="off" autofocus></input>
								
								<button class="send" id="send">
									<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>
								</button>
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

		this.shadow.appendChild(container.content.cloneNode(true));
		callback({status: "ok"})
		
		this.shadow.getElementById("send").addEventListener("click", () => {
			this.shadow.getElementById("input").value = this.shadow.getElementById("input").value.trim()
			if(this.shadow.getElementById("input").value.length > 0){
				this.addSpeechBubble(this.shadow.getElementById("input").value, true)
				this.dispatchEvent(new CustomEvent("interaction:answer:otherside", {detail: { answer: this.shadow.getElementById("input").value, info: this.info, broadcast: true }}));
				this.shadow.getElementById("input").value = ""
			}
		})
		
		this.shadow.getElementById("input").addEventListener("keyup", event => {
			
				clearTimeout(this.typingTimer)
				if(!this.isTyping){
					this.dispatchEvent(new CustomEvent("interaction:answer:otherside", {detail: { answer: this.typingindicator, info: this.info }}));
					this.isTyping = true
				}
				
				
				this.typingTimer = setTimeout(() => {
					this.isTyping = false
					this.dispatchEvent(new CustomEvent("interaction:answer:otherside", {detail: { answer: "!"+this.typingindicator, info: this.info }}));
					
				}, 2000)
			
		});
		
		
	}

	addSpeechBubble(text, own, playerID){
		let tickSVG = `<span class="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"/></svg></span>`
		let type = own ? "sent" : 'received'
		let ticks = own ? tickSVG : ""
		let bubbleID = Math.round(Math.random()*999999)
		playerID = own ? playerID+5 : playerID
		console.log("playerID", playerID, own)
		let col = `hsl(${playerID*360/this.playerLengthOtherSide}, 100%, 80%)`;
		let bubble = `
			<div class="message ${type}" style="background-color: ${col}; border-color: ${col};">
			<span id=${bubbleID}>${text}</span>
			<span class="metadata"><span class="time"></span>${ticks}</span>
			</div>
		`
		this.shadow.getElementById("chat-content").innerHTML += bubble
		this.shadow.getElementById("chat-content").scrollTop = this.shadow.getElementById("chat-content").scrollHeight;
		if(!own){
			this.dispatchEvent(new CustomEvent("translate", {detail: { text: text, langTo: 'en,de,th', bubbleID: bubbleID  }}));
		}
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

		if(!this.playerLengthOtherSide){
			this.playerLengthOtherSide = data.info.availablePlayers.length
			console.log("playerLengthOtherSide", this.playerLengthOtherSide)
			this.myRoomID = this.myRoomID % Math.min(this.playerLengthOtherSide, this.playerLengthOwnSide)
			console.log("myRoomID", this.myRoomID)
			this.chatPartnersOtherSide = data.info.availablePlayers.filter( p => p % Math.min(this.playerLengthOtherSide, this.playerLengthOwnSide) == this.myRoomID)
			this.chatPartnersOwnSide = this.availablePlayersOwnSide.filter( p => p % Math.min(this.playerLengthOtherSide, this.playerLengthOwnSide) == this.myRoomID)
			console.log("chat partners other/own", this.chatPartnersOtherSide, this.chatPartnersOwnSide)
		}

		if(data.otherSide){
			if(this.chatPartnersOtherSide.includes(data.playerID)){
				if(data.answer == this.typingindicator){
					this.shadow.getElementById("status").innerHTML = this.typingindicator
				}else if(data.answer == "!"+this.typingindicator){
					this.shadow.getElementById("status").innerHTML = "online"
				}else{
					this.addSpeechBubble(data.answer, false, data.playerID)
				}
				return
			}
		}
		
		if(data.broadcast){
			if(this.chatPartnersOwnSide.includes(data.info.ownPlayerID)){
				this.addSpeechBubble(data.answer, true, data.info.ownPlayerID)
				return
			}
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
