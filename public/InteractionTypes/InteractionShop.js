'use strict';
import CustomInput from '../CustomInput.js';

export default class InteractionShop extends HTMLElement {
	
	static name = "Shop"
	static icon = "shopping_cart"
	
	constructor(msg, callback) {
		super();
		
		this.info = msg
		
		this.shadow = this.attachShadow({ mode: 'open' });

		const container = document.createElement('template');
		

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<link href="${window.location.origin}/static/player-style-classes.css" rel="stylesheet" />
			<style>
				
				#bgimg{
					position: fixed;
					width: 100vw;
					height: 100vh;
					top: 0;
					left: 0;
					background-size: cover;
					background-repeat: no-repeat;
					background-position: center center;
					background-image: url('./media/${this.info.bgfilename}')
				}
				#content{
					position: relative;
					z-index: 10;
				}
				#shopping{
					display: grid;
					grid-template-columns: 1fr 1fr;
					grid-template-rows: 1fr 1fr;
					height: 80%;
					overflow: scroll;
				}
				.item{
					background-size: contain;
					background-repeat: no-repeat;
					background-position: center center;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					margin: 3vw;
				}
				button{
					font-size: 1.4em !important; 
				}
			</style>
			<div id="bgimg"></div>
			<div id="content">
				<h1>${this.info.question}</h1>
				<h1 id="budget">${this.info.money}</h1>
				<div id="shopping">
				</div>
			</div>
		`;

		//background-image: url("${this.mediaPath}");
		this.shadow.appendChild(container.content.cloneNode(true));
		
		this.preload()
		
		callback({status: "ok"})
		console.log("OK")
		
	}

	preload(){
		let paths = [ this.info.bgfilename ]
		for(let item of this.info.items){
			paths.push(item.filename)
		}
		paths = paths.map( x => `./media/${x}`)
		paths.forEach( img => {
			let i = new Image()
			i.src = img
		})
		
	}
	
	addShopItem(info, idx){
		if(info.price.length > 0){
			let div = this.shadow.getElementById("shopping")
		
			let item = document.createElement("div")
			item.classList.add("item")
			item.style.backgroundImage = "url(./media/" + info.filename + ")"
			let itemName = document.createElement("h3")
			itemName.innerHTML = info.answer
			item.appendChild(itemName)
			
			let buy = document.createElement("button")
			buy.innerHTML = "buy for "+InteractionShop.sanitizeMoney(info.price)+"€"
			item.appendChild(buy)
			div.appendChild(item)
			
			buy.addEventListener("click", () => {
				this.dispatchEvent(new CustomEvent("interaction:answer", {detail: { answer: idx, info: this.info }}));
			})
		}
	}
	
	static sanitizeMoney(str){
		str = str.replace(",", ".")
		return Number.parseFloat(str)
	}
	
	handleAdditionalInfo(){
	}
	
	updateInformation(data){
		this.shadow.getElementById("budget").innerHTML = Math.round(this.info.money - data.sum)
	}

	// fires after the element has been attached to the DOM
	connectedCallback() {
		
		this.handleAdditionalInfo()
		
		for(let [idx, item] of this.info.items.entries()){
			this.addShopItem(item, idx)
		}
	}
	
	static handleAnswer(header, container, msg){
		
		
		if(msg.startup){
			header.innerHTML = ""
			container.innerHTML = ""
			
			header.innerHTML = `${msg.info.question}`
			header.setAttribute("cueID", msg.info.id)
			for(let [idx, item] of msg.info.items.entries()){
				
				let fieldset = document.createElement("fieldset")
				let legend = document.createElement("legend")
				legend.innerHTML = item.answer
				fieldset.id = `item-${idx}`
				fieldset.setAttribute("count", 0)
				fieldset.setAttribute("price", InteractionShop.sanitizeMoney(item.price))
				
				let span = document.createElement("span")
				fieldset.appendChild(legend)
				fieldset.append(span)
				container.appendChild(fieldset)
				
			}
		}else{
			let box = container.querySelector(`#item-${msg.answer}`)
			let span = container.querySelector(`#item-${msg.answer}>span`)
			let c = parseInt(box.getAttribute("count"))
			span.innerHTML = c+1
			box.setAttribute("count", c+1)
			
			let result = {
				sum: 0,
				id: msg.info.id
			}
			for(let [idx, item] of msg.info.items.entries()){
				
				let box = container.querySelector(`#item-${idx}`)
				result.sum += parseInt(box.getAttribute("count")) * parseFloat(box.getAttribute("price"))
				
			}
			
			
			container.dispatchEvent(new CustomEvent("interaction:show-update", {detail: result }))
		}
	}
	
	static createFields(form){

		CustomInput.textInput(form, "question", "Title:")
		CustomInput.br(form)
			
		CustomInput.textInput(form, "money", "Budget:")
		CustomInput.br(form)
			
		CustomInput.filepicker(form, "bgfilename", "Choose a Background Image:")
		CustomInput.br(form)
			
		let list = document.createElement("ul")
		list.setAttribute("name", "items")
		
		let btn = document.createElement("button")
		btn.innerHTML = "+"
		btn.id = "add"
		list.appendChild(btn)
		btn.addEventListener("click", (e) => {
			e.preventDefault()
			InteractionShop.addFields(list)
		})
		
		form.appendChild(list)
		CustomInput.br(form)
		
	}
	
	static addFields(list){
		
		let row = document.createElement("li")

		CustomInput.textInput(row, "answer", "Item:")
		CustomInput.textInput(row, "price", "Price:")
		CustomInput.filepicker(row, "filename", "Choose an Image:")
		
		let delBtn = document.createElement("button")
		delBtn.innerHTML = "X"
		delBtn.addEventListener("click", (e) => {
			e.preventDefault()
			row.remove()
		})
		row.appendChild(delBtn)
		
		let btn = list.querySelector("#add")
		btn.before(row)
	}

}

customElements.define('interaction-shop', InteractionShop);
