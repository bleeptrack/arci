'use strict';
import howler from 'https://cdn.jsdelivr.net/npm/howler@2.2.4/+esm'
import CustomInput from '../CustomInput.js';

export default class InteractionSound extends HTMLElement {
	
	static name = "Sound"
	static icon = "music_note"
	static color = "#5c8d89"
	
	constructor(msg, callback) {
		super();
		
		this.mediaPath = "./media/" + msg.filename
		this.shadow = this.attachShadow({ mode: 'open' });

		const container = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<style>
				#content{
					
					height: 100%;
					background-size: cover;
				}
			</style>
			<div id="content">
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		
		//preload
		//var sound = new Audio(this.mediaPath);
		
		let parts = this.mediaPath.split(".")
		let form = parts.pop()
		console.log(this.mediaPath, form)
		
		this.sound = new howler.Howl({
                    src: this.mediaPath,
                    autoUnlock: true,
                    html5PoolSize: 50,
                    autoSuspend: false,
					preload: true,
                    //autoplay: true,
                    //html5: true,  //dieser fallback macht irgendwie zeug kaputt
                    //onplayerror: (err) => {this.shadow.getElementById("content").innerHTML += `PLAY ERROR: ${err}</br>`},
                    //onloaderror: (err) => {this.shadow.getElementById("content").innerHTML += `LOAD ERROR: ${err}</br>`},
                    onload: () => {
                        //document.getElementById("content").innerHTML += 'loading Sound</br>'
						callback({status: "ok"})
						console.log("howler loaded file")
						//this.shadow.getElementById("content").innerHTML += 'Sound loaded</br>',
						
                    },
                    //onplay: () => {this.shadow.getElementById("content").innerHTML += 'Playing Sound</br>'},
                    //onunlock: () => {this.shadow.getElementById("content").innerHTML += 'Sound unlocked</br>'},
                    format: [form],

                });
		
		
	}
	


	// fires after the element has been attached to the DOM
	connectedCallback() {
		this.sound.play()
	}
	
	static createFields(form){		
		CustomInput.filepicker(form, "filename", "Choose a Sound File:")
		CustomInput.br(form)
	}

}

customElements.define('interaction-sound', InteractionSound);
