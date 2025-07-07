import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

export class PlayerConnector{
	constructor(idChangeCallback){
		this.socket = io();
		this.idChangeCallback = idChangeCallback
		
		this.socket.on("connect", () => {
			console.log(this.socket.id); 
			
		});
		
		this.socket.io.on("reconnect", () => {
			this.registerUser(this.id, this.sessionToken)
		});
		
	}
	
	registerUser(id, sessionToken){
		this.sessionToken = sessionToken
		
		this.socket.emit("player:register", id, sessionToken, (response) => {
			console.log(response); 
			if(response.success){
				this.id = response.info.id
			}
			this.idChangeCallback(response)
		})

	}
	
	pauseUser(){
		this.socket.emit("player:left")
	}
}




