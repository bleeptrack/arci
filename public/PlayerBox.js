'use strict';
import { socket } from './socket.js';

class PlayerBox extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		

		socket.on("player:info", (data) => { 
			//console.log(data) 
			this.drawPlayerInfo(data)
		});

		const boxcontainer = document.createElement('template');

		// creating the inner HTML of the editable list element
		boxcontainer.innerHTML = `
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

			<style>
			
				#box-content{
					display: grid;
					grid-template-columns: repeat(10, minmax(0, 1fr));
					
					column-gap: var(--gap-size);
					row-gap: var(--gap-size);
					height: 100%;
					overflow-y: scroll;
    				scrollbar-width: thin;
    				scrollbar-gutter: stable;
				}
				.recipient{
					border: 1px solid black;
				}
			</style>
			<div id="box-content"></div>
		
		`;

		// binding methods
		//this.addListItem = this.addListItem.bind(this);
		//this.handleRemoveItemListeners = this.handleRemoveItemListeners.bind(this);
		//this.removeListItem = this.removeListItem.bind(this);

		// appending the container to the shadow DOM
		this.shadow.appendChild(boxcontainer.content.cloneNode(true));
		
		
	}
	

	drawPlayerInfo(info){
		let content = this.shadow.getElementById("box-content")
		content.innerHTML = ""
		for(let i = 0; i<Math.ceil((info.length-1)/10); i++ ){ 
			for(let j = 1; j<=10; j++){
				let div = document.createElement("div")
				if(info[i*10 + j]){
					let player = info[i*10 + j]
					div.innerHTML = player.id
					div.id = player.id
					if(player.loading == true){
						div.style.backgroundColor = "red"
					}else if(player.loading === false){
						div.style.backgroundColor = "green"
					}
					
					if(player.recipient){
						div.classList.add("recipient")
					}
				}
				content.appendChild(div)
			}
		}
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		
		
	}

}

customElements.define('player-box', PlayerBox);

