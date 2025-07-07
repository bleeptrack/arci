'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionQuizTrueFalse extends HTMLElement {
	
	static name = "Quiz"
	static icon = "quiz"
	static color = "#680747"
	
	constructor(msg, callback) {
		super();
		
		this.info = msg
		this.shadow = this.attachShadow({ mode: 'open' });

		const container = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<link href="${window.location.origin}/static/player-style-classes.css" rel="stylesheet" />
			<style>
				 h1 {
					max-height: 33vh;
					overflow: hidden;
					font-size: clamp(1rem, 8vw, 6rem) !important;
					line-height: 1.2;
					text-overflow: ellipsis;
					width: 100%;
				}
				.correct{
					opacity: 1 !important;
				}
				.correct > div{
					background-color: var(--correct);
				}
				.correct > span{
					color: var(--correct);
				}
				#chart{
					width: 100%;
					height: 80%;
					flex-grow: 1;
					display: flex;
					justify-content: space-between;
				}
				.chart-element{
					width: 20vw;
					display: flex;
					flex-direction: column-reverse;
					opacity: 0.5
				}
				.bar{
					background-color: var(--font-color);
					width: 20vw;
					height: 1px;
    
				}
				.animation{
					height: 80%;    
					transform-origin: bottom;
					transition: height 3s ease;
				}
				span{
					margin-bottom: 1vh;
					color: var(--font-color);
					text-align: center;
					font-family: var(--font);
					font-size: clamp(1rem, 4vw, 4rem) !important;
    				height: 20vh;
    				align-content: end;
				}
				.answerbutton{
					flex-grow: 1;
					background-position: center;
					background-size: cover;
					font-size: clamp(1rem, 6vw, 4.5rem) !important;
				}
				@media screen and (orientation: landscape) {
					.answerbutton{
						max-width: 45% !important;
						align-self: normal !important;
					}
				}
				.answerbutton:active, .answerbutton:focus, .answerbutton:hover{
					border: var(--button-border-style) !important;
					background-color: var(--button-color) !important;
				}
				#content{
					gap: 2vh;
				}
				.desktop{
					display: none;
				}
			</style>
			<div id="content">
				<h1>${this.info.question}</h1>
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));

		let content = this.shadow.getElementById("content")
		for(let i = 1; i<5; i++){
			if(this.info[i]  && this.info[i].length > 0){
				let btn = document.createElement("button")
				btn.id = i
				btn.classList.add("answerbutton")
				if(this.info[`filename-${i}`]){
					let name = `filename-${i}`
					btn.style.backgroundImage = `url("/media/${this.info[name]}")`
					btn.classList.add("img-btn")
				}
				btn.innerHTML += this.info[i]
				content.appendChild(btn)
			}
		}
		
		this.shadow.querySelectorAll(".answerbutton").forEach( e => {
			e.addEventListener("click", () => {
				//this.dispatchEvent(new CustomEvent("interaction:answer", {detail: { answer: e.id, info: this.info }}));
				this.dispatchEvent(new CustomEvent("interaction:session-storage", {detail: { cueid:this.info.id , playerid:this.info.ownPlayerID, data: e.id }}));
				this.shadow.getElementById("content").innerHTML = ""
				
				
			})
		})
		
		callback({status: "ok"})
		console.log("OK")
		
		
		
		/*
		this.shadow.getElementById("sendBtn").addEventListener("click", () => {
			let answer = this.shadow.getElementById("answer").value
			//actionCallback({answer: answer})
			this.dispatchEvent(new CustomEvent("interaction:answer", {detail: { answer: answer }}));
		})
		*/
	}

	
	handleAdditionalInfo(){
		// Check if browser is not mobile
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		let deviceClass = isMobile ? "mobile" : "desktop"

		let cummulative = Object.values(this.info.additionalInfo.answers).reduce( (a,b) => Number(a)+Number(b), 0)
		this.shadow.getElementById("content").innerHTML = `<h2 class="${deviceClass}">${this.info.question}</h2><div id="chart"></div><h3>${cummulative} total votes</h3>`
		let chart = this.shadow.getElementById("chart")
		
		for(let [name, value] of Object.entries(this.info.additionalInfo.answers)){
			let div = document.createElement("div")
			div.classList.add("chart-element")
			let bar = document.createElement("div")
			bar.classList.add("bar")
			bar.style.maxHeight = `${Math.round(Number(value)/cummulative * 100)}%`
			div.appendChild(bar)
			let nametext = document.createElement("span")
			nametext.innerHTML = `${name}`
			div.appendChild(nametext)
			if(this.info.additionalInfo.correct.includes(name) || this.info.additionalInfo.correct.length == 0){
				div.classList.add("correct")
			}
			this.shadow.getElementById("chart").appendChild(div)
			
		}
		
		setTimeout( () => {
			this.shadow.querySelectorAll(".bar").forEach( bar => bar.classList.add("animation"))
		},1000)
		
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		this.dispatchEvent(new CustomEvent("interaction:session-storage", {detail: { cueid:this.info.id , playerid:this.info.ownPlayerID, data: "voting" }}));
		if(this.info.additionalInfo){
			this.handleAdditionalInfo()
		}
	}
	
	static updateFromSessionStorage(header, container, msg){
		let cueID = header.getAttribute("cueID")
		console.log("session storage update", msg, cueID, msg[cueID])
		
		
		for(let i = 1; i<=4; i++){
			let box = container.querySelector(`#answer-${i}`)
			let label = box.querySelector("legend")
			box.setAttribute("count", 0)
			box.setAttribute("votes", JSON.stringify([]))
			box.innerHTML = ""
			box.appendChild(label)
		}
		
		if(msg[cueID]){
			let data = msg[cueID]
			console.log("data", data)

			let votingContainer = container.querySelector("#voting-container")
			let votingCount = Object.values(data).filter(item => item === "voting").length
			let allCount = Object.values(data).length
			votingContainer.innerHTML = `${allCount - votingCount} / ${allCount} voted`

			for (const [playerID, answerID] of Object.entries(msg[cueID])) {
				if(answerID == "voting"){
					continue
				}
				let box = container.querySelector(`#answer-${answerID}`)
				box.innerHTML += ` ${playerID}`
				box.setAttribute("count", Number(box.getAttribute("count"))+1)
				let votes = JSON.parse(box.getAttribute("votes"))
				votes.push(playerID)
				box.setAttribute("votes", JSON.stringify(votes))
			}
		
			
			
		}
	}
	
	static handleAnswer(header, container, msg){
		console.log("id compare", header.getAttribute("cueID"), msg.info.id)
		
		const controlContent = document.createElement('template');
		controlContent.innerHTML = `
			<link href="${window.location.origin}/static/control.css" rel="stylesheet" />
			<style>
				
			</style>
			<style id="fieldset-rules"></style>
			<div style="text-align: center;" id="voting-container"></div>
			<fieldset id="answer-1" count="0" votes="[]">
				<legend>${msg.info[1]}</legend>
			</fieldset>
			<fieldset id="answer-2" count="0" votes="[]">
				<legend>${msg.info[2]}</legend>
			</fieldset>
			<fieldset id="answer-3" count="0" votes="[]">
				<legend>${msg.info[3]}</legend>
			</fieldset>
			<fieldset id="answer-4" count="0" votes="[]">
				<legend>${msg.info[4]}</legend>
			</fieldset>
			<button id="Poll Results" draggable="true">Send Answers</button>
			<button id="fetch">Fetch Answers from other Side</button>
		`
		
		
		if(msg.startup && header.getAttribute("cueID") != msg.info.id){
			console.log("CLEAR4", msg)
			header.innerHTML = ""
			container.innerHTML = ""
			container.appendChild(controlContent.content.cloneNode(true));
			header.innerHTML = `${msg.info.question}`
			header.setAttribute("cueID", msg.info.id)
			
			container.querySelector('[id="Poll Results"]').addEventListener("click", () => {
				let result = {
					answers: {},
					correct: [],
					id: msg.info.id
				}
				for(let i = 1; i<=4; i++){
					if(msg.info[i] && msg.info[i].length > 0){
						
						result["answers"][`${msg.info[i]}`] = Number(container.querySelector(`#answer-${i}`).getAttribute("count"))
						if(container.querySelector(`#answer-${i}`).hasAttribute("other-count")){
							result["answers"][`${msg.info[i]}`] += Number(container.querySelector(`#answer-${i}`).getAttribute("other-count"))
						}
						if(msg.info["correct-"+i]){
							result["correct"].push(msg.info[i])
						}
					}
				}
				console.log("dispatch show answer event", result)
				container.dispatchEvent(new CustomEvent("interaction:show-answer", {detail: result }));
			})
			CustomInput.makeButtonDragable(container.querySelector('[id="Poll Results"]'))
			container.querySelector("#fetch").addEventListener("click", () => {
				fetch(`https://${sessionStorage.getItem("secondServer")}/sessionStorage?cuename=${encodeURIComponent( msg.info['cue-name'] )}`, { 
					method: 'GET'
				})
				.then(function(response) { return response.json(); })
				.then(function(json) {
					console.log("json", json)
					container.querySelector("#fieldset-rules").remove()
					let fstyle = document.createElement("style")
					fstyle.id = "fieldset-rules"
					container.appendChild(fstyle)
					
					
					for(let i = 1; i<=4; i++){
						let box = container.querySelector(`#answer-${i}`)
						box.setAttribute("other-count", 0)
					}
		
					for (const [playerID, answerID] of Object.entries(json)) {
						let box = container.querySelector(`#answer-${answerID}`)
						box.setAttribute("other-count", Number(box.getAttribute("other-count"))+1)
					}
					
					
					for(let i = 1; i<=4; i++){
						let box = container.querySelector(`#answer-${i}`)
						let legend = box.querySelector("legend")
						let othercount = box.getAttribute("other-count")
						container.querySelector("#fieldset-rules").sheet.insertRule(`#answer-${i}::after { content: "(+${othercount})"; }`);
					}
					
				})
			})
			
		}
		
		let serverStore = JSON.parse( sessionStorage.getItem("serverStorage") )
		console.log("serverStore", serverStore)
		if(serverStore){
			InteractionQuizTrueFalse.updateFromSessionStorage(header, container, serverStore)
		}
	}
	/*
	for(let rule of this.shadow.styleSheets[this.shadow.styleSheets.length-1].cssRules){
			console.log(rule.selectorText)
			if(rule.selectorText  == "#progress::after" ){
				console.log(rule);
				rule.style.width = `calc(${percentage}% - 1px)`
			}
		}
	*/
	
	static createFields(form){	
		CustomInput.textInput(form, "question", "Question:")	
		CustomInput.br(form)
		
		for(let i = 1; i<5; i++){
			CustomInput.textInput(form, i, `Answer ${i}:`)
			CustomInput.filepicker(form, "filename-"+i, "Choose an optional Image:")
			CustomInput.checkbox(form, "correct-"+i)
			CustomInput.br(form)
		}
	}

}

customElements.define('interaction-quiz-truefalse', InteractionQuizTrueFalse);
