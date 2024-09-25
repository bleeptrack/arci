'use strict';
import { Cue } from './Cue.js';
import { FloatingActionButton } from './FloatingActionButton.js';
import { socket } from './socket.js';

class CueBox extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		this.cueTypes = []
		this.usedCueIDs = []

		socket.on("cue:load", (data) => { 
			this.shadow.getElementById("box-content").innerHTML = ""
			this.shadow.getElementById("filter-buttons").innerHTML = ""
			this.cueTypes = []
			console.log("loading cues", data) 
			for(let type of data.types){
				console.log("importing", "./InteractionTypes/"+type)
				import("./InteractionTypes/"+type).then( cls => {
					this.cueTypes.push(cls.default)
					this.createFilterButtons(cls.default)
				})
				
			}
			
			for( let cue of data.cues){
				this.addCue(cue)
			}
			
			
		});

		socket.on("load sequence", (data) => { 
			
			this.usedCueIDs = []
			let cues = this.shadow.querySelectorAll(`cue-item`)
			cues.forEach(c => c.setAttribute("in-use", "false"))
			
			for(let scene of data){
				
				for( let cue of scene.completeCues){
					if(!this.usedCueIDs.includes(cue.id)){
						this.usedCueIDs.push(cue.id)
						let matchingCues = this.shadow.querySelectorAll(`cue-item[id='${cue.id}']`)
						matchingCues.forEach(c => c.setAttribute("in-use", "true"))
					}
				}
				
			}
			
			
		});

		const boxcontainer = document.createElement('template');

		// creating the inner HTML of the editable list element
		boxcontainer.innerHTML = `
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

			<style>

				#wrapper{
					display: flex;
					flex-direction: column;
					height: 100%;
				}
			
				#box-content{
					display: flex;
					width: 100%;
					height: 95%;
					flex-wrap: wrap;
					overflow-y: scroll;
					scrollbar-width: thin;
					scrollbar-gutter: stable;
					justify-content: space-around;
				}
				
				#search-filter{
					display: flex;
					width: calc(100% - var(--small-gap)* 2);
					gap: var(--gap-size);
					padding: var(--small-gap);
				}
				
				#box-modal{
					background-color: grey;
					position: absolute;
					z-index: 10;
					display: none;
					width: 100%;
					height: 100%;
					padding: var(--gap-size);
					box-sizing: border-box;
					font-family: sans-serif;
					overflow-y: scroll;
					scrollbar-width: thin;
					scrollbar-gutter: stable;
				}

				#box-modal label{
					margin-right: var(--small-gap);
				}

				.filterbutton, #usageFilterButton{
					border: none;
					border-radius: 3px;
					color: white;
					opacity: 0.5;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					height: 100%;
					border: 2px solid black;
					border-radius: var(--radius);
					height: 3vh;
				}

				.filterbutton span, #usageFilterButton span, #addCueButton span{
					font-size: 2vh !important;
				}

				#filter{
					flex-grow: 1;
					height: calc(100% - var(--gap-size));
					border: 2px solid black;
					border-radius: var(--radius);
					padding: var(--small-gap);
					box-sizing: border-box;
					height: 100%;
				}

				#usageFilterButton{
					color: black !important;
				}	

				#addCueButton{
					display: inline-flex;
					align-items: center;
					justify-content: center;
					height: 100%;
					border: 2px solid black;
					border-radius: var(--radius);
					background-color: color-mix(in srgb, var(--main-color) 40%, black);
					color: white;
				}
				#addCueButton:hover{
					background-color: color-mix(in srgb, var(--action-color) 40%, black);
				}
				
				#addCueButton:active{
					background-color: color-mix(in srgb, var(--action-color) 70%, black);
				}

					
				.filterbutton:hover{
					opacity: 0.8;
				}
				.active{
					opacity: 1 !important;
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
				
				.insertAbove{
					box-shadow: 0 -1vh 0 var(--action-color);
				}
				
				.insertBelow{
					box-shadow: 0 1vh 0 var(--action-color);
				}


			</style>
			<div id="wrapper">
				<div id="box-modal"></div>
				<div id="search-filter">
				<input type="text" id="filter" placeholder="Search..."></input>
				<div id="filter-buttons"></div>
				<button id="usageFilterButton"><span class="material-symbols-outlined">visibility</span></button>
					<button id="addCueButton"><span class="material-symbols-outlined">add</span></button>
				</div>
				<div id="box-content"></div>
			</div>
		
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
		this.shadow.getElementById("usageFilterButton").addEventListener("click", () => {
			this.shadow.getElementById("usageFilterButton").classList.toggle("active")

			let cues = this.shadow.querySelectorAll("cue-item")
			cues.forEach(c => {
				if(this.shadow.getElementById("usageFilterButton").classList.contains("active")){
					if(c.getAttribute("in-use") == "false"){
						c.style.display = "none"
						c.setAttribute("in-use-disabled", "true")
					}
				}else{
					if(c.getAttribute("in-use-disabled") && !c.getAttribute("type-disabled")){
						c.style.display = "inherit"
						c.removeAttribute("in-use-disabled")
						
					}
				}
			})

		} )
			
		
	}

	createFilterButtons(type){
		if(type){
			console.log("button", type.icon, type.name)
			let btn = document.createElement("button")
			btn.classList.add("filterbutton")
			btn.id = type.name.toLowerCase()
			btn.innerHTML = `<span class="material-symbols-outlined">${type.icon}</span>`
			btn.title = type.name
			btn.style.backgroundColor = type.color
			this.shadow.getElementById("filter-buttons").appendChild(btn)


			btn.addEventListener("click", (event) => {
				let activeFilterButton = this.shadow.querySelector(".filterbutton.active")
				if(activeFilterButton && activeFilterButton != btn){
					activeFilterButton.click()
				}


				btn.classList.toggle("active")

				let cues = this.shadow.querySelectorAll("cue-item")
				cues.forEach(c => {
					if(btn.classList.contains("active")){
						if(c.getAttribute("type") != btn.id){
							c.style.display = "none"
							c.setAttribute("type-disabled", "true")
						}
					}else{
						if(!c.getAttribute("in-use-disabled") && c.getAttribute("type-disabled")){
							c.style.display = "inherit"
							c.removeAttribute("type-disabled")
						}
					}
				})
			})

		}
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
					input.value = info[name].trim()
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
				icon: typemodule.icon,
				color: typemodule.color
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
		if(this.usedCueIDs.includes(c1.id)){
			c1.setAttribute("in-use", "true")
		}else{
			c1.setAttribute("in-use", "false")
		}
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
		
		let filter = this.shadow.getElementById("filter")
		filter.addEventListener("input", (event) => {
			let cues = this.shadow.querySelectorAll("cue-item")
			for(let c of cues){
				if(!c.disabled){
					if(!c.getAttribute("name").includes(event.target.value.toLowerCase())){
						c.style.display = "none"
					}else{
						c.style.display = "inherit"
					}
				}
			}
		})
		this.createFilterButtons()
	}

}

customElements.define('cue-box', CueBox);

