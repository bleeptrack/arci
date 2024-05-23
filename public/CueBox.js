'use strict';
import { Cue } from './Cue.js';
import { FloatingActionButton } from './FloatingActionButton.js';
import { socket } from './socket.js';

class CueBox extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		this.cueTypes = []

		socket.on("cue:load", (data) => { 
			this.shadow.getElementById("box-content").innerHTML = ""
			this.cueTypes = []
			console.log(data) 
			for(let type of data.types){
				console.log("importing", "./InteractionTypes/"+type)
				import("./InteractionTypes/"+type).then( cls => {
					this.cueTypes.push(cls.default)
				})
			}
			
			for( let cue of data.cues){
				this.addCue(cue)
			}
			
		});

		const boxcontainer = document.createElement('template');

		// creating the inner HTML of the editable list element
		boxcontainer.innerHTML = `
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

			<style>
			
				#box-content{
					display: flex;
					width: 100%;
					height: 95%;
					flex-wrap: wrap;
					overflow: scroll;
					
				}
				
				#search-filter{
					display: flex;
					height: 5%;
					width: 100%;
				}
				
				#box-modal{
					background-color: grey;
					position: absolute;
					z-index: 10;
					display: none;
				}
				
				#type-selector{
					display: grid;
					grid-template-columns: 1fr 1fr 1fr;
					grid-template-rows: 1fr 1fr;
					column-gap: var(--gap-size);
					row-gap: var(--gap-size);
					padding: var(--gap-size);
					height: calc(100% - var(--gap-size) * 2);
					width: calc(100% - var(--gap-size) * 2);
				}
				
				cue-item{
					height: 12vh;
					margin: var(--gap-size)
				}
				
				.cue-type-selector{
					
				}
			</style>
			<div id="box-modal"></div>
			<div id="search-filter">
				<input type="text" id="filter"></input>
				<button class="filterbutton" id="all">all</button>
				<button class="filterbutton" id="image">Image</button>
				<button class="filterbutton" id="sound">Sound</button>
				<button class="filterbutton" id="text">Text</button>
				<button class="filterbutton" id="question">Question</button>
				<button class="filterbutton" id="quiz">Quiz</button>
				<button class="filterbutton" id="midi">Midi</button>
				<button id="addCueButton"> + </button>
			</div>
			<div id="box-content"></div>
		
		`;

		// binding methods
		//this.addListItem = this.addListItem.bind(this);
		//this.handleRemoveItemListeners = this.handleRemoveItemListeners.bind(this);
		//this.removeListItem = this.removeListItem.bind(this);

		// appending the container to the shadow DOM
		this.shadow.appendChild(boxcontainer.content.cloneNode(true));
		this.content = this.shadow.getElementById("box-content")
		this.modal = this.shadow.getElementById("box-modal")
		
		this.addEventListener('dragstart', (event) => {
			console.log("drag start box")
		})
		
		this.addEventListener("drop", (event) => {
			event.preventDefault();
		})
		
		this.addEventListener("dragover", (event) => {
		// prevent default to allow drop
			event.preventDefault();
		});
		
		this.shadow.getElementById("addCueButton").addEventListener("click", () => this.createCueSelector() )
			
		
	}
	
	createCueSelector(){
		this.modal.innerHTML = ''
		let typeSelector = document.createElement("div")
		typeSelector.id = "type-selector"
		for(let type of this.cueTypes){
			console.log("type", type)
			typeSelector.appendChild(this.createCueSelectorButton(type.icon, type.name))
		}
		
		this.modal.appendChild(typeSelector)
		this.showModal()
	}
	
	createCueSelectorButton(type, txt){
		let btn = document.createElement("button")
		btn.id = txt.toLowerCase()
		btn.classList.add("cue-type-selector")
		let text = document.createElement("h2")
		text.innerHTML = txt
		btn.appendChild(text)
		
		let span = document.createElement("span")
		span.classList.add("material-symbols-outlined")
		span.innerHTML = type
		btn.appendChild(span)
		btn.addEventListener("click", this.createForm.bind(this))
		return btn
	}
	
	fillForm(info, div){
		
		
		//let typemodule = this.cueTypes.find( x => x.name.toLowerCase() == info.type.toLowerCase())
		//for(let i = 2; i<=count; i++){
		//	typemodule.addFields(btn, i)
		//}
		
		
		for(let name of Object.keys(info)){
			let input = div.querySelector(`[name="${name}"]`)
			if(input){
				if(input.tagName == "UL"){
					let typemodule = this.cueTypes.find( x => x.name.toLowerCase() == info.type.toLowerCase())
					let liNr = info[name].length
					console.log(liNr)
					for(let i = 0; i<liNr; i++){
						typemodule.addFields(input)
					}
					
					let lis = input.querySelectorAll("li")
					for(let [idx,li] of lis.entries()){
						this.fillForm(info[name][idx], li)
					}
				}else if(input.getAttribute("type") == "file"){
					if(info[name].length > 0){
						let filename = document.createElement("button")
						filename.innerHTML = info[name]
						filename.name = name
						filename.value = info[name]
						input.after(filename)
						input.style.display = "none"
						filename.addEventListener("click", (e) => {
							e.preventDefault()
							input.setAttribute("style", "")
							console.log(input)
							filename.style.display = "none"
						})
					}
				}else if(input.getAttribute("type") == "checkbox"){
					input.checked = info[name]
				}else{
					console.log(input, name)
					input.value = info[name]
				}
			}
		}
		let cuename = this.modal.querySelector(`[name="cue-name"]`)
		cuename.setAttribute("cue-id", info["id"])
		//console.log(Object.keys(info))
	}
	
	createForm(event){
		
		let type = event.currentTarget.id
		console.log(type)
		this.modal.innerHTML = ''
		
		let form = document.createElement("form")
		form.id = "cue-form"
			
		let name = document.createElement("input")
		name.setAttribute("type", "text");
		name.setAttribute("name", "cue-name");
		name.id = "cue-name"
		let nameLabel = document.createElement("label")
		nameLabel.setAttribute("for", "cue-name")
		nameLabel.innerHTML = "Cue Name:"
		form.appendChild(nameLabel)
		form.appendChild(name)
		form.appendChild(document.createElement("br"))
			
		let playerIds = document.createElement("input")
		playerIds.setAttribute("type", "text");
		playerIds.setAttribute("list", "id-list");
		playerIds.id = "player-ids"
		playerIds.name = "player-ids"
		let playerLabel = document.createElement("label")
		playerLabel.setAttribute("for", "player-ids")
		playerLabel.innerHTML = "Player IDs:"
		let idList = document.createElement("datalist")
		idList.id = "id-list"
		let randOption = document.createElement("option")
		randOption.value = "random"
		idList.appendChild(randOption)
		let allOption = document.createElement("option")
		allOption.value = "all"
		idList.appendChild(allOption)
		form.appendChild(playerLabel)
		form.appendChild(playerIds)
		form.appendChild(idList)
		form.appendChild(document.createElement("br"))
			
		let typemodule = this.cueTypes.find( x => x.name.toLowerCase() == type.toLowerCase())
		typemodule.createFields(form)
			
		let cancelBtn = document.createElement("button")
		cancelBtn.innerHTML = "Cancel"
		cancelBtn.type = "button"
		cancelBtn.addEventListener("click", this.hideModal.bind(this))
		form.appendChild(cancelBtn)
			
		let saveBtn = document.createElement("button")
		saveBtn.innerHTML = "SAVE"
		saveBtn.type = "button"
		saveBtn.addEventListener("click", (event) => {
			event.preventDefault()
			let data = {
				type: type,
				icon: typemodule.icon
			}
			
			for( let c of Array.from(this.shadow.getElementById("cue-form").children)){
				if(c.name || c.getAttribute("name")){
					
					if(c.name == "cue-name"){ //get id in case of edit
						if(c.getAttribute("cue-id")){
							data["id"] = Number(c.getAttribute("cue-id"))
						}
					}
										
					let parsed = this.parseItem(c)
					if(parsed){
						data[parsed.name] = parsed.data
					}
				}
			}	
			
			console.log("sending: ", data)
			socket.emit("cue created", data)
			this.hideModal()
			
		})
		form.appendChild(saveBtn)
			
		this.modal.appendChild(form)
		
		
		
	}
	
	parseItem(c){
		if(c.files && c.files[0]){
			this.uploadFile(c.files[0])
			return {name: c.name, data: c.files[0].name }
		}
		if(c.tagName == "UL"){ 
			console.log("parsing ul")
			let rows = c.querySelectorAll("li")
			let info = []
			for(let row of rows){
				let item = {}
				for(let child of row.childNodes){
					console.log(child)
					let childParsed = this.parseItem(child)
					if(childParsed && childParsed.name != undefined && childParsed.name.length > 0){
						item[childParsed.name] = childParsed.data
					}
				}
				info.push(item)
			}
			return {name: c.getAttribute("name"), data: info}
		}
		if(c.getAttribute("type") == "checkbox"){
			return {name: c.name, data: c.checked}
		}
		if(c.style.display != "none"){
			return {name: c.name, data: c.value}
		}
		return null
	}
	
	showModal(){
		this.modal.style.display = "block"
	}
	
	hideModal(){
		this.modal.style.display = "none"
	}
	
	addCue(data){
		let c1 = new Cue(data)
		this.content.appendChild(c1)
		c1.addEventListener("edit cue", (event) => {
			console.log(event.detail)
			socket.emit("cue:info", {id: event.detail}, (info) => {
				console.log(info)
				this.showModal()
				this.createForm({currentTarget: {id: info.type}})
				this.fillForm(info, this.modal)
			})
		})
	}
	
	uploadFile(file) {
		console.log("uploading...")
        socket.emit("upload file", {file:file, name:file.name}, (status) => {
          console.log(status);
        });
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {		
		let filterbuttons = this.shadow.querySelectorAll(".filterbutton")
		console.log("btn", filterbuttons)
		for(let btn of filterbuttons){
			btn.addEventListener("click", (event) => {
				console.log(event.target.id)
				let cues = this.shadow.querySelectorAll("cue-item")
				for(let c of cues){
					if(c.getAttribute("type") == event.target.id || event.target.id == "all"){
						c.style.visibility = "visible"
						c.disabled = false
					}else{
						c.style.visibility = "collapse"
						c.disabled = true
					}
				}
			})
		}
		
		let filter = this.shadow.getElementById("filter")
		filter.addEventListener("input", (event) => {
			let cues = this.shadow.querySelectorAll("cue-item")
			for(let c of cues){
				if(!c.disabled){
					if(!c.getAttribute("name").includes(event.target.value.toLowerCase())){
						c.style.visibility = "collapse"
					}else{
						c.style.visibility = "visible"
					}
				}
			}
		})
		
	}

}

customElements.define('cue-box', CueBox);

