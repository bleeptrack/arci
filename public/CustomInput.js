export default class CustomInput{
	static textInput(parentNode, nameID, labeltext){
		let question = document.createElement("input")
		question.id = nameID
		question.name = nameID
		let questionLabel = document.createElement("label")
		questionLabel.setAttribute("for", nameID)
		questionLabel.innerHTML = labeltext
		parentNode.appendChild(questionLabel)
		parentNode.appendChild(question)
	}
	
	static textarea(parentNode, nameID, labeltext){
		let question = document.createElement("textarea")
		question.id = nameID
		question.name = nameID
		let questionLabel = document.createElement("label")
		questionLabel.setAttribute("for", nameID)
		questionLabel.innerHTML = labeltext
		parentNode.appendChild(questionLabel)
		parentNode.appendChild(question)
	}
	
	static br(parentNode){
		parentNode.appendChild(document.createElement("br"))
	}
	
	static checkbox(parentNode, nameID){
		let trueBox = document.createElement("input")
		trueBox.setAttribute("type", "checkbox");
		trueBox.id = nameID
		trueBox.name = nameID
		parentNode.appendChild(trueBox)
	}
	
	static filepicker(parentNode, nameID, labeltext){
		let filepickerImage = document.createElement("input")
		filepickerImage.type = "file"
		filepickerImage.id = nameID
		filepickerImage.name = nameID
		let pickerLabelImage = document.createElement("label")
		pickerLabelImage.setAttribute("for", nameID)
		pickerLabelImage.innerHTML = labeltext
		parentNode.appendChild(pickerLabelImage)
		parentNode.appendChild(filepickerImage)
	}

	static makeButtonDragable(button){

		button.addEventListener('dragstart', (event) => {
			console.log("drag start button", button.id)
			
			event.dataTransfer.setData("data", JSON.stringify({'id': button.id}))
			event.dataTransfer.setData("special-cue", true)
			event.dataTransfer.dropEffect = "move";
		})


	}
}
