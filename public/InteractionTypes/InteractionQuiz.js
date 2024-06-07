'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionQuizTrueFalse extends HTMLElement {
	
	static name = "Quiz"
	static icon = "quiz"
	
	constructor(msg, callback) {
		super();
		
		this.info = msg
		this.shadow = this.attachShadow({ mode: 'open' });

		const container = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<link href="${window.location.origin}/static/player-style-classes.css" rel="stylesheet" />
			<style>
				
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
					background-color: white;
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
				}
			</style>
			<div id="content">
				<h1>${this.info.question}</h1>
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		
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
		let cummulative = Object.values(this.info.additionalInfo.answers).reduce( (a,b) => Number(a)+Number(b), 0)
		this.shadow.getElementById("content").innerHTML = `<h2>${this.info.question}</h2><div id="chart"></div><h3>${cummulative} total votes</h3>`
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
			if(this.info.additionalInfo.correct.includes(name)){
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
		if(this.info.additionalInfo){
			this.handleAdditionalInfo()
		}else{
		
			let content = this.shadow.getElementById("content")
			for(let i = 1; i<5; i++){
				if(this.info[i]  && this.info[i]?.length > 0){
					let btn = document.createElement("button")
					btn.id = i
					btn.classList.add("answerbutton")
					btn.innerHTML = this.info[i]
					content.appendChild(btn)
				}
			}
			
			this.shadow.querySelectorAll(".answerbutton").forEach( e => {
				e.addEventListener("click", () => {
					this.dispatchEvent(new CustomEvent("interaction:answer", {detail: { answer: e.id, info: this.info }}));
					//navigator.vibrate(150)
					setTimeout(() => {
						this.shadow.getElementById("content").innerHTML = ""
					}, 150)
					
				})
			})
		
		}
		
		
	}
	
	static handleAnswer(header, container, msg){
		console.log("id compare", header.getAttribute("cueID"), msg.info.id)
		if(msg.startup && header.getAttribute("cueID") != msg.info.id){
			header.innerHTML = ""
			container.innerHTML = ""
			header.innerHTML = `${msg.info.question}`
			header.setAttribute("cueID", msg.info.id)
			for(let i = 1; i<=4; i++){
				if(msg.info[i]  && msg.info[i]?.length > 0){
					let fieldset = document.createElement("fieldset")
					let legend = document.createElement("legend")
					legend.innerHTML = `${msg.info[i]}`
					fieldset.id = `answer-${i}`
					fieldset.setAttribute("count", 0)
					fieldset.setAttribute("votes", JSON.stringify([]))
					if(msg.info["correct-"+i]){
						fieldset.classList.add("correct")
					}
					fieldset.appendChild(legend)
					container.appendChild(fieldset)
				}
			}
			let btn = document.createElement("button")
			btn.innerHTML = "Send Answers"
			btn.addEventListener("click", () => {
				let result = {
					answers: {},
					correct: [],
					id: msg.info.id
				}
				for(let i = 1; i<=4; i++){
					if(msg.info[i]  && msg.info[i]?.length > 0){
						result["answers"][`${msg.info[i]}`] = container.querySelector(`#answer-${i}`).getAttribute("count")
						if(msg.info["correct-"+i]){
							result["correct"].push(msg.info[i])
						}
					}
				}
				console.log("dispatch show answer event", result)
				container.dispatchEvent(new CustomEvent("interaction:show-answer", {detail: result }));
			})
			container.appendChild(btn)
		}else{
			
			//console.log(container.querySelector(`#answer-${msg.answer}`))
			let hasVoted = false;
			container.querySelectorAll("fieldset").forEach(set => {
				let votes = JSON.parse(set.getAttribute("votes"))
				if(votes.includes(msg.playerID)){
					hasVoted = true
				}
			})
			
			if(!hasVoted){
				let box = container.querySelector(`#answer-${msg.answer}`)
				box.innerHTML += ` ${msg.playerID}`
				box.setAttribute("count", Number(box.getAttribute("count"))+1)
				let votes = JSON.parse(box.getAttribute("votes"))
				votes.push(msg.playerID)
				box.setAttribute("votes", JSON.stringify(votes))
			}
			
			//let d = document.createElement("div")
			//d.innerHTML = `${msg.answer}:${msg.playerID}`
		}
	}
	
	static createFields(form){	
		CustomInput.textInput(form, "question", "Question:")	
		CustomInput.br(form)
		
		for(let i = 1; i<5; i++){
			CustomInput.textInput(form, i, `Answer ${i}:`)
			CustomInput.checkbox(form, "correct-"+i)
			CustomInput.br(form)
		}
	}

}

customElements.define('interaction-quiz-truefalse', InteractionQuizTrueFalse);
