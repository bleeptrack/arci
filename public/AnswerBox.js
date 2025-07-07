'use strict';
import { socket } from './socket.js';
import OtherSideConnector from './OtherSideConnector.js';

class AnswerBox extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		this.cueTypes = {}
		this.osc = new OtherSideConnector("")
		this.activeCue = undefined
		
		socket.on("cue:load", (data) => { 
			
			for(let type of data.types){
				console.log("importing", "./InteractionTypes/"+type)
				import("./InteractionTypes/"+type).then( cls => {
					this.cueTypes[cls.default.name.toLowerCase()] = cls.default
				})
			}
			
		});

		socket.on("secondserver:info", msg => {
			console.log("new osc:", msg)
			this.osc = new OtherSideConnector(msg)
		})

		socket.on("interaction:answer", msg => {
			console.log(msg.type, msg)
			console.log(this.cueTypes[msg.info.type])
			if (typeof this.cueTypes[msg.info.type].handleAnswer === "function") { 
				this.cueTypes[msg.info.type].handleAnswer(this.shadow.getElementById("question"), this.shadow.getElementById("answers"), msg)
				this.activeCue = this.cueTypes[msg.type]
			}
			
		})
		
		socket.on("session:storage-update", msg => {
			console.log(msg)
			sessionStorage.setItem("serverStorage", JSON.stringify(msg))
			if (this.activeCue && typeof this.activeCue.updateFromSessionStorage === "function") { 
				this.activeCue.updateFromSessionStorage(this.shadow.getElementById("question"), this.shadow.getElementById("answers"), msg )
			}
		})
		
		socket.on("cue:active", (msg, idx, seq, specialCue) => {
			if(!specialCue){
				console.log("answerbox cue active", msg)
				
				if (typeof this.cueTypes[msg.type].handleAnswer === "function") { 
					this.cueTypes[msg.type].handleAnswer(this.shadow.getElementById("question"), this.shadow.getElementById("answers"), {info:msg, startup:true})
					this.activeCue = this.cueTypes[msg.type]
					this.shadow.getElementById("wrap").style.background = `${this.cueTypes[msg.type].color}`
				}
			}
		})

		const boxcontainer = document.createElement('template');

		// creating the inner HTML of the editable list element
		boxcontainer.innerHTML = `
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

			<style>
			
				#question{
					width: 100%;
					color: white;
					text-align: center;
				}
				#answers{
					width: 100%;
					
				}
				#wrap{
					height: 100%;
					overflow-y: scroll;
					position: relative;
					display: flex;
					flex-direction: column;
					color: white;
					font-family: sans-serif;
					overflow-x: hidden;
					scrollbar-width: thin;
				}
				#openanswers{
					position: absolute;
					top: 0;
					right: 0;
				}
			</style>
			
			<div id="wrap">
				<button id="openanswers" class="material-symbols-outlined">open_in_new</button>
				<h2 id="question"></h2>
				<div id="answers"></div>
			</div>
		
		`;



		// appending the container to the shadow DOM
		this.shadow.appendChild(boxcontainer.content.cloneNode(true));
		
		
		this.shadow.getElementById("answers").addEventListener("interaction:update-other-side", (event) => {
			console.log("other side event:", event.detail)
			this.osc.sendData(event.detail)
		})
		
		this.shadow.getElementById("answers").addEventListener("interaction:show-answer", (event) => {
			socket.emit("interaction:show-answer", event.detail)
		})
		
		this.shadow.getElementById("answers").addEventListener("interaction:show-update", (event) => {
		
			socket.emit("interaction:show-update", event.detail)
		})
		
		this.shadow.getElementById("answers").addEventListener("interaction:session-storage", (event) => {
			socket.emit("interaction:session-storage", event.detail)
		})

		this.shadow.getElementById("answers").addEventListener("interaction:monitor", (event) => {
			console.log("monitor event", event.detail)
			socket.emit("interaction:monitor", event.detail)
		})
		
		this.shadow.getElementById("openanswers").addEventListener("click", () => {
			window.open("/answers", '_blank').focus();
		})
		
		
	}

	searchAndActivateSpecialCue(id){
		let el = this.shadow.getElementById(id)
		if(el){
			console.log("SPECIAL CUE CLICKED in ANSWER BOX", this.id)
			el.click()
			return true
		}
		return false
	}
	

	connectedCallback() {
		
	}

}

customElements.define('answer-box', AnswerBox);

