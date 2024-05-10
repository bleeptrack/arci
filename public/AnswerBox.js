'use strict';
import { socket } from './socket.js';
import OtherSideConnector from './OtherSideConnector.js';

class AnswerBox extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		this.cueTypes = {}
		this.osc = new OtherSideConnector("")
		
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
			console.log(msg)
			this.cueTypes[msg.info.type].handleAnswer(this.shadow.getElementById("question"), this.shadow.getElementById("answers"), msg)
		})

		const boxcontainer = document.createElement('template');

		// creating the inner HTML of the editable list element
		boxcontainer.innerHTML = `
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

			<style>
			
				#question{
					width: 100%;
					height: 2em;
					
				}
				#answers{
					height: 50%;
					width: 100%;
					
				}
				#wrap{
					height: 100%;
					overflow: scroll;
					position: relative;
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
		
		this.shadow.getElementById("openanswers").addEventListener("click", () => {
			window.open("/answers", '_blank').focus();
		})
		
		
	}
	

	connectedCallback() {
		
		
	}

}

customElements.define('answer-box', AnswerBox);

