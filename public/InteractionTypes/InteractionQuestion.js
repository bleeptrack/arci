'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionQuestion extends HTMLElement {
	
	static name = "Question"
	static icon = "edit_note"
	static color = "#42022c"
	
	constructor(msg, callback) {
		super();
		
		this.text = msg.text
		this.shadow = this.attachShadow({ mode: 'open' });

		const container = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<link href="${window.location.origin}/static/player-style-classes.css" rel="stylesheet" />
			<style>
				#content{
					
					height: 100%;
					background-size: cover;
				}
				textarea{
					width: 100%;
					height: 40%;
					font-size: 2em;
				}
				@media screen and (orientation: landscape) {
					textarea{
						display: none;
					}
					button{
						display: none;
					}
				}
			</style>
			<div id="content">
				<h1 id="question">${this.text}</h1>
				<textarea id="answer"></textarea>
				<button id="sendBtn">send</button>
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		
		
		callback({status: "ok"})
		console.log("OK")
		
		this.shadow.getElementById("sendBtn").addEventListener("click", () => {
			let answer = this.shadow.getElementById("answer").value
			//actionCallback({answer: answer})
			this.dispatchEvent(new CustomEvent("interaction:answer", {detail: { answer: answer, info: msg }}));
			this.shadow.getElementById("content").innerHTML = ""
		})

		this.shadow.getElementById("answer").addEventListener("focus", (e) => {
			this.shadow.getElementById("question").style.display = "none"
		})

		this.shadow.getElementById("answer").addEventListener("blur", (e) => {
			this.shadow.getElementById("question").style.display = "block"
		})
	}
	


	// fires after the element has been attached to the DOM
	connectedCallback() {
		
	}
	
	static handleAnswer(header, container, msg){
		console.log("id compare", header.getAttribute("cueID"), msg.info.id)
		if(msg.startup && header.getAttribute("cueID") != msg.info.id){
			header.innerHTML = ""
			container.innerHTML = ""
			header.innerHTML = `${msg.info.text}`
			header.setAttribute("cueID", msg.info.id)
			this.answerString = []
			let btn = document.createElement("button")
			btn.innerHTML = "download texts"
			btn.id = "downloadBtn"
			btn.addEventListener("click", () => {
				// Create a Blob containing the text data
				const blob = new Blob([this.answerString.join('\n')], { type: 'text/plain' });
				
				// Create a temporary URL for the Blob
				const url = URL.createObjectURL(blob);
				
				// Create a temporary anchor element
				const a = document.createElement('a');
				a.href = url;
				a.download = 'answers.txt';
				
				// Trigger the download
				document.body.appendChild(a);
				a.click();
				
				// Clean up
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			})
			container.appendChild(btn)
		}else{
			if(msg.playerID && msg.answer){
				let div = document.createElement("div")
				div.innerHTML = `${msg.playerID}: ${msg.answer}`
				this.answerString.push(msg.answer)
				let monitorText = this.answerString.join('<br>')
				container.dispatchEvent(new CustomEvent("interaction:monitor", {detail: { text: monitorText, info: msg }}));
				container.querySelector("#downloadBtn").before(div)
			}
		}
	}
	
	static createFields(form){
		CustomInput.textarea(form, "text", "Question:")
		CustomInput.br(form)
	}

}

customElements.define('interaction-question', InteractionQuestion);
