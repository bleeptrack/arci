'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionImage extends HTMLElement {
	
	static name = "Image"
	static icon = "imagesmode"
	static color = "#e6a86a"
	
	constructor(msg, callback) {
		super();
		
		if(msg.filename.includes("http")){
			this.mediaPath = encodeURI(msg.filename)
		}else{
			msg.filename = msg.filename.replace("/media/", "")
			this.mediaPath = "./media/" + encodeURIComponent(msg.filename)
		}
		this.shadow = this.attachShadow({ mode: 'open' });
		

		const container = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<style>
				#content{
					position: fixed;
					top: 0;
					left: 0;
					height: 100vh;
					width: 100vw;
					background-size: cover;
					background-position: center;
					z-index: 10;
				}
			</style>
			<div id="content">
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		
		
		
		if( document.head.querySelectorAll(`link[href="${this.mediaPath}"]`).length > 0 ){
			console.log("image has already been preloaded")
		}else{
			//preload image
			const preloadLink = document.createElement("link");
			preloadLink.href = this.mediaPath;
			preloadLink.rel = "preload";
			preloadLink.as = "image";
			document.head.appendChild(preloadLink);
		}
		
		callback({status: "ok"})
		
		
		
		
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		this.shadow.getElementById("content").style.backgroundImage = 'url("' + this.mediaPath + '")';
	}
	
	static createFields(form){
		CustomInput.filepicker(form, "filename", "Choose an Image:")
		CustomInput.br(form)
	}

}

customElements.define('interaction-image', InteractionImage);
