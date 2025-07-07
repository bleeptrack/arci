'use strict';

export default class InteractionTemplate extends HTMLElement {
	
	static name = "Template"
	static icon = "imagesmode"
	
	//msg contains information provided from cue creation
	constructor(msg, callback) {
		super();
		
		this.shadow = this.attachShadow({ mode: 'open' });
		

		const container = document.createElement('template');
		
		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<style>
			</style>
			<div id="content">
				Hello World
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		
		//callback gives control panel the chance to see that the cue was activated on the phone
		callback({status: "ok"})
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		
	}
	
	static createFields(form){
		//create your Inputfields for the Cue Creation dislog here
		//and attach to form
		//best use helper classes in CustomInput.js
	}

}

customElements.define('interaction-template', InteractionTemplate);
