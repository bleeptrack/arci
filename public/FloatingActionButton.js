'use strict';

export class FloatingActionButton extends HTMLElement {
	constructor(iconname, position) {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });


		const cuecontainer = document.createElement('template');

		// creating the inner HTML of the editable list element
		cuecontainer.innerHTML = `
			<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
			<style>
				#actionbutton{
					font-size: 48px;
					width: 4rem;
					background-color: var(--action-color);
					font-variation-settings: 'OPSZ' 48;
					height: 4rem;
					border-radius: 1rem;
					position: absolute;
					color: white;
					display: block;
					line-height: 4rem;
					text-align: center;
					visibility: visible;
				}
				
				.top-center{
					left: calc(50% - 2rem);
					top: 1rem;
				}
				
				.right{
					bottom: 1rem;
					right: 1rem;
				}
				
				#action-button:hover {
					filter: brightness(var(--hover-darken));
				}
			</style>
			<div id="actionbutton" class="material-symbols-outlined">${iconname}</div>
		`;
		
		this.shadow.appendChild(cuecontainer.content.cloneNode(true));
		this.shadow.getElementById("actionbutton").classList.add(position)
		
	}
	
	setVisible(vis){
		this.shadow.getElementById("actionbutton").style.visibility = vis ? "visible" : "hidden"
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		
	}

}

customElements.define('floating-action-button', FloatingActionButton);

