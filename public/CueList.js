'use strict';
import { Cue } from './Cue.js';
import { FloatingActionButton } from './FloatingActionButton.js';
import { socket } from './socket.js';
import {WebMidi, Note} from 'https://cdn.jsdelivr.net/npm/webmidi@3.1.9/+esm'

class CueList extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		this.activeCue = undefined
		
		socket.on("load sequence", (data) => { 
			//get active scene
			let activeScene = this.findCurrentActiveScene()
			console.log("ACTIVE", activeScene)
			
			
			this.clearCueLists()
			document.querySelector("scene-tabs").clearScenes()
			console.log("seq", data) 
			
			for(let scene of data){
				//this.addSequence(scene.name)
				document.querySelector("scene-tabs").addScene(scene.name)
				for( let cue of scene.completeCues){
					this.addCue(cue, false)
				}
				//this.changeSequence(scene.name)
			}
			
			if(activeScene){
				document.querySelector("scene-tabs").activateScene(activeScene)
			}
		});
		
		socket.on("cue:active", (cue, idx, seq, specialCue) => {
			console.log("cue got activated", cue, idx, seq, specialCue)
			this.visualActiveCue(idx, seq)
		})


		const listcontainer = document.createElement('template');

		// creating the inner HTML of the editable list element
		listcontainer.innerHTML = `
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
			<link href="${window.location.origin}/static/control.css" rel="stylesheet" />
			<style>
				#container{
					display: flex;
					flex-direction: column;
					overflow: hidden;
					height: 100%;
				}
			
				.list-content{
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: var(--small-gap);
					padding: var(--small-gap);
					overflow-y: scroll;
					scrollbar-width: thin;
					scrollbar-gutter: stable;
				}
				
				cue-item{
					
				}
				
				#nav{
					display: flex;
				}
				
				#nav>button{
					flex: 1;
					background-color: color-mix(in srgb, var(--main-color) 40%, black);
					color: white;
					height: 4vh;
					padding: var(--small-gap);
					margin: var(--small-gap);
					border: 2px solid black;
					border-radius: var(--radius);
					font-size: 2.5vh;
				}


				
				#nav>button:hover{
					background-color: color-mix(in srgb, var(--action-color) 40%, black);
				}
				
				#nav>button:active{
					background-color: color-mix(in srgb, var(--action-color) 70%, black);
				}
				
			</style>
			
			<div id="container">
				<div id="nav">
					<button id="prev" class="material-symbols-outlined">arrow_back_ios</button>
					<button id="next" class="material-symbols-outlined">arrow_forward_ios</button>
				</div>
			</div>
		
		`;

		// binding methods
		//this.addListItem = this.addListItem.bind(this);
		//this.handleRemoveItemListeners = this.handleRemoveItemListeners.bind(this);
		//this.removeListItem = this.removeListItem.bind(this);

		// appending the container to the shadow DOM
		this.shadow.appendChild(listcontainer.content.cloneNode(true));
		//this.content = this.shadow.getElementById("list-content")
		
		
		
		
		this.addEventListener("drop", (event) => {
			event.preventDefault();
			let data = JSON.parse(event.dataTransfer.getData("data"))
			this.addCue( data )
			console.log("drop list")
		})

		
		this.addEventListener("dragover", (event) => {
		// prevent default to allow drop
			event.preventDefault();
			//console.log(event.target)
		});
		
		WebMidi
		.enable()
		.then(() => {
			console.log("MIDI enabled. Devices:")
			if (WebMidi.inputs.length < 1) {
			// Display available MIDI input devices
			console.log("No device detected.");
			} else {
				console.log("MIDI outputs:")
				WebMidi.outputs.forEach((device, index) => {
					console.log(`${index}: ${device.name} <br>`)
				});

				console.log("MIDI inputs:")
				WebMidi.inputs.forEach((device, index) => {
					console.log(`${index}: ${device.name} <br>`)
					const listener = device.addListener("midimessage", e => {
						console.log(e);
						console.log("MIDI MESSAGE received")
						console.log("triggering next button")
						this.shadow.getElementById("next").click()
					});
				});
				
			}

		})
		.catch(err => alert(err));
		
	}

	
	
	findCurrentActiveScene(){
		console.log(this.shadow.querySelectorAll(".list-content"))
		for(let sq of this.shadow.querySelectorAll(".list-content")){
			console.log("checking", sq)
			if( sq.style.display != "none"  ){
				return sq.id
			}
		}
		return null
	}
	
	clearCueLists(){
		for(let sq of this.shadow.querySelectorAll(".list-content")){
			sq.remove()
		}
	}
	
	addSequence(name){
		let list = document.createElement("div")
		list.classList.add("list-content")
		list.id = name
		this.shadow.getElementById("container").appendChild(list)
		this.content = list
	}
	
	changeSequence(name){
		console.log("cue list changes to", name)
		let seq = this.shadow.getElementById(name)
		if(!seq){
			this.addSequence(name)
		}
		seq = this.shadow.getElementById(name)
		for(let sq of this.shadow.querySelectorAll(".list-content")){
			sq.style.display = "none"
			sq.disabled = true
		}
		//seq.style.display = "inherit"
		seq.style.removeProperty('display');
		seq.disabled = false
		this.content = seq
	}
	
	deleteCue(id){
		let cue = this.shadow.getElementById(id)
		cue.remove()
		this.saveCueSequence()
	}
	
	deleteCueInstance(instanceID){
		let cue = this.shadow.querySelector(`[instance="${instanceID}"]`)
		if(cue){
			cue.remove()
		}
		this.saveCueSequence()
	}

	insertSequence(name, target, dropDir){
		let seq = this.shadow.getElementById(target)
		let moveSeq = this.shadow.getElementById(name)
		if(dropDir){
			seq.before(moveSeq)
		}else{
			seq.after(moveSeq)
		}
		this.saveCueSequence()
	}
	
	addCueAfter(target, data){
		target.after(this.buildCue(data))
	}
	
	addCueBefore(target, data){
		console.log("add before")
		target.before(this.buildCue(data))
	}
	
	addCue(data, saveSequence=true){
		this.content.appendChild(this.buildCue(data))
		if(saveSequence){
			this.saveCueSequence()
		}
	}
	
	buildCue(data){
		let c1 = new Cue(data)
		c1.addEventListener("click cue", (event) => {
			console.log("cue event received", event.target)
			event.target.activate()
			this.activeCue = event.target
			this.sendPreload(this.activeCue)
			
			
			
		})
		return c1
	}
	
	sendPreload(startNode){
		
		let node = startNode.nextSibling
		let preloadIDs = []
		for(let i = 1; i<=3; i++){
			if(node){
				preloadIDs.push(node.id)
				node = node.nextSibling
			}
		}
		console.log("preload:", preloadIDs)
		socket.emit("cue:preload", preloadIDs)
	}
	
	/*
	handleCueClick(instanceID){
		let cues = this.shadow.querySelectorAll("cue-item")
		for(let [idx,c] of cues.entries()){
			if(c.getAttribute("instance") == instanceID){
				c.activate()
				this.activeCue = c
				
				
				
			}else{
				c.deactivate()
			}
		}
		//this.saveCueSequence()
	}
	*/
	
	visualActiveCue(idx, seq){
		let cues = this.shadow.querySelectorAll("cue-item")
		for(let c of cues){
			c.deactivate()
		}
		
		let seqNode = this.shadow.getElementById(seq)
		let cue = seqNode.children[idx]
		cue.visuallyActivate()
		this.activeCue = cue
	}

	renameSequence(oldName, newName){
		let seq = this.shadow.getElementById(oldName)
		seq.id = newName
		this.saveCueSequence()
	}

	duplicateSequence(name){
		let seq = this.shadow.getElementById(name)
		let newSeq = seq.cloneNode(true)
		newSeq.id = name + "-copy"
		seq.after(newSeq)
		this.saveCueSequence()
	}
	
	saveCueSequence(){
		let complete = []
		let seqs = this.shadow.querySelectorAll(".list-content")
		for(let s of seqs){
			let cues = s.querySelectorAll("cue-item")
			let list = []
			for(let c of cues){
				list.push(c.getAttribute("id"))
			}
			complete.push({name: s.id, sequence: list})
		}
		
		socket.emit("save cue sequence", complete)
	}


	// fires after the element has been attached to the DOM
	connectedCallback() {
		document.addEventListener("scene active", (event) => {
			console.log("scene active in cuelist")
		})
		
		this.shadow.getElementById("prev").addEventListener("click", (event => {
			let instance = this.activeCue.previousSibling
			if(instance){
				instance.click()
			}
			
		}))
		
		this.shadow.getElementById("next").addEventListener("click", (event => {
			console.log("NEXT")
			if(this.activeCue){
				let instance = this.activeCue.nextSibling
				if(instance){
					instance.click()
				}
			}else{
				let instance =this.shadow.querySelector("cue-item")
				if(instance){
					instance.click()
				}
			}
			
		}))
		
	}

}

customElements.define('cue-list', CueList);

