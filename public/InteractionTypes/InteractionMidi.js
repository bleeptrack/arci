'use strict';
import {WebMidi, Note} from 'https://cdn.jsdelivr.net/npm/webmidi@3.1.9/+esm'
import CustomInput from '../CustomInput.js';

export default class InteractionMidi extends HTMLElement {
	
	static name = "Midi Button"
	static icon = "radio_button_checked"
	
	constructor(msg, callback) {
		super();
		
		this.text = msg.text
		console.log(msg)
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
			</style>
			<div id="content">
				<h1 id="title"><h1>
				<button id="sendBtn">push</button>
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		
		
		callback({status: "ok"})
		console.log("OK")
		
		for(let [idx,item] of Object.entries(msg.items)){
			if( this.findRange(item.playerIDs).includes( Number(msg.ownPlayerID)) ){
				this.shadow.getElementById("title").innerHTML = msg.items[idx].title
			}
		}
		
		this.shadow.getElementById("sendBtn").addEventListener("click", () => {
			//let answer = this.shadow.getElementById("answer").value
			//actionCallback({answer: answer})
			this.dispatchEvent(new CustomEvent("interaction:answer", {detail: { midi: "pressed", info: msg }}));
		})
	}
	
	findRange(idString){
		let ids = []
		for(let part of idString.split(',')){
			if(part.includes("-")){
				let range = part.split("-")
				for(let i = Number(range[0]); i<=Number(range[1]); i++){
					ids.push(i)
				}
			}else{
				ids.push( Number(part) )
			}
		}
		console.log("ranges", ids)
		return ids
	}
	

	// fires after the element has been attached to the DOM
	connectedCallback() {
		
	}
	
	static handleAnswer(header, container, msg){
		
		console.log("id compare", header.getAttribute("cueID"), msg.info.id)
		if(msg.startup && header.getAttribute("cueID") != msg.info.id){
			header.innerHTML = ""
			container.innerHTML = ""

			header.innerHTML = `Midi:`
			header.setAttribute("cueID", msg.info.id)
			let devices = document.createElement("div")
			devices.id = "devices"
			container.appendChild(devices)
			
			WebMidi
				.enable()
				.then(() => {
					if (WebMidi.inputs.length < 1) {
					// Display available MIDI input devices
					container.querySelector("#devices").innerHTML+= "No device detected.";
					} else {
						WebMidi.inputs.forEach((device, index) => {
							container.querySelector("#devices").innerHTML = `${index}: ${device.name} <br>`;
						});
						
					}

				})
				.catch(err => alert(err));
			
		}else{
			let div = document.createElement("div")
			container.appendChild(div)
			
			
			WebMidi
				.enable()
				.then(() => {
					if (WebMidi.inputs.length < 1) {
					// Display available MIDI input devices
					} else {
						
						const note = new Note( Number(msg.playerID) );
						for(let output of WebMidi.outputs){
							output.playNote(note);
						}
						div.innerHTML += `${msg.playerID} activated: ${note.identifier}`
						
					}

				})
				.catch(err => alert(err));
		
		}
	}
	
	static createFields(form){
		
		let list = document.createElement("ul")
		list.setAttribute("name", "items")
			
		let btn = document.createElement("button")
		btn.innerHTML = "+"
		btn.id = "add"
		list.appendChild(btn)
		btn.addEventListener("click", (e) => {
			e.preventDefault()
			InteractionMidi.addFields(list)
		})
		
		form.appendChild(list)
		CustomInput.br(form)
	}
	
	static addFields(list){
		
		let row = document.createElement("li")

		CustomInput.textInput(row, "playerIDs", "Player IDs:")
		CustomInput.textInput(row, "title", "Title:")
		
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

customElements.define('interaction-midi', InteractionMidi);
