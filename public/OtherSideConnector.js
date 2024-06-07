export default class OtherSideConnector{
	constructor(adress){
		this.adress = adress
	}
	sendData(data){
		console.log("otherside connector sending:", data)
		fetch(`https://${this.adress}/connection`, {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		}).then((response) => {
			console.log("response.status =", response.status); // response.status = 200
    
		})
	}
	
}
