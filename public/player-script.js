




        let socket
        var queue = new createjs.LoadQueue(true);
        queue.setMaxConnections(50);
        queue.on("complete", event => { console.log("preload successfull", event.currentTarget._loadItemsBySrc) })

        addEventListener("load", function() {
            window.scrollTo(1, 0);
        }, false);


        let started = false
        var noSleep

        let filenames = []





        window.onblur = function () {
            console.log("on focus")
            if(noSleep){
                noSleep.disable();
            }


            if(started){
                socket.emit('pause user', {ID: ID});
                resetContent()
                started = false

                let content = document.getElementById('content')
                content.innerHTML = "Oh, you dropped out. Please refresh your page :)"

                let btn = document.createElement("button")
                btn.innerHTML = "REFRESH"
                btn.addEventListener("click", function(){
                    window.location.reload();
                })
                content.appendChild(btn)

            }
        };

        var queryDict = {}
        location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})
        console.log(queryDict)

        let ID = localStorage.getItem('heni-ID');
        let session = queryDict['session'];
        localStorage.setItem('heni-session', session);

        console.log("ID from storage:", ID)
        if(queryDict['ID']){
            ID = queryDict['ID']
            console.log("ID overwritten via GET parameter to", ID)
        }



        if("debug" in queryDict){
            window.onblur = undefined
        }


        if(location.search.includes('preload')){

        fetch(location.origin + location.pathname + 'filenames')
        .then(res => res.json())
        .then(out =>{

                document.getElementById("join-btn").disabled = true

                let sounds = []
                let images = []

                for(let key in out){
                    console.log(key)
                    if(key.includes("sound") || key.includes("image")){
                        if(key.includes("single") || key.includes("choice") || key.includes("random")){
                            for(let [name, arr] of Object.entries(out[key])){
                                for(let elem of arr){
                                    if(key.includes("sound")){
                                        sounds.push(key+'/'+name+'/'+elem)
                                    }else{
                                        images.push(key+'/'+name+'/'+elem)
                                    }

                                }
                            }
                        }else{
                            for(let [name, url] of Object.entries(out[key])){
                                //filenames.push(key+"/"+url)
                                if(key.includes("sound")){
                                    sounds.push(key+"/"+url)
                                }else{
                                    images.push(key+"/"+url)
                                }
                            }
                        }
                    }
                }

                /*
                for(let s of sounds){
                    queue.loadFile(s);
                }
                */
                if(location.search.includes('preload')){
                    //queue.loadManifest(sounds)
                }else{
                    sounds = sounds.filter(item => item.toLowerCase().includes("whisper"))

                }

                let mani = sounds.map(w => {
                    return {src:w, type:createjs.Types.SOUND}
                })
                console.log(mani)
                queue.loadManifest(mani)

                queue.on("progress", event => {
                    console.log(event.progress)
                    let elem = document.getElementById("preload")
                    if(elem){
                        elem.innerHTML = 'downloading play: ' + Math.round(event.progress*100) + '%'
                    }
                }, this);

                queue.on("complete", event => {
                    console.log(event.progress)
                    let elem = document.getElementById("preload")
                    if(elem){
                        elem.innerHTML = 'Ready to start!'
                    }
                    document.getElementById("join-btn").disabled = false
                    connect()
                }, this);


                /*
                preload.fetch(sounds).then(items => {

                    //document.getElementById("info").innerHTML += `SOUNDS 1 preloaded</br>`
                    document.getElementById("join-btn").disabled = false
                    connect()
                });

                preload.onprogress = event => {
                    console.log(event.progress + '%');
                    let elem = document.getElementById("preload")
                    if(elem){
                        elem.innerHTML = 'preloading: ' + event.progress + '%'
                    }
                }
                */


        })
        .catch(err => { throw err });

        }else{
            connect()
        }





        let midiNote
        var sound
        var bgSound


        //baseURL changed!
        //let baseURL = "https://blptrck.uber.space" + window.location.pathname
        let baseURL = "https://blptrck.uber.space/heni-static/"
        console.log(baseURL)
        let content = document.getElementById("content")
        var audio;
        //findSeat()


        let joinBtn = document.getElementById("join-btn")

        console.log("BUTTON", joinBtn)
        joinBtn.addEventListener("click", function(){
            console.log("click")

            if(!("debug" in queryDict)){
                let elem = document.documentElement
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen();
                    } else if (elem.webkitRequestFullscreen) {
                        elem.webkitRequestFullscreen();
                    } else if (elem.msRequestFullscreen) {
                        elem.msRequestFullscreen();
                    }
            }

            noSleep = new NoSleep();
            noSleep.enable();
            console.log(noSleep)
            resetContent()
            //setTimeout(()=>{
            //    document.getElementById("content").innerHTML += noSleep.enabled
            //}, 500)

            //if(iOS()){
            if(true){


                document.getElementById("content").innerHTML = '<h3>please click here</h3><div class="box"></div><h3>to activate sound</h3>'
                //resetContent()




                sound = new Howl({
                    src: [baseURL+'login.mp3'],
                    autoplay: true,
                    //html5: true
                });

                backgroundSound()

                setTimeout(()=>{
                    document.body.addEventListener("click", freeAudio, {once : true})

                }, 500)




            }else{
                backgroundSound()
                started = true
            }


        })

        function freeAudio(){
            document.body.style.backgroundColor = 'black'
            console.log("free audio")
            //resetContent()
            document.getElementById("content").innerHTML = '<h3 id="welcome">Welcome!</h3><h3>You are all set now :)</h3>'
            started = true
            document.body.removeEventListener("click", freeAudio)
        }


        function connect(){
            socket = io('https://blptrck.uber.space', {path: window.location.pathname + 'socket.io'});
            socket.emit('register', {ID: ID});

            socket.on('remove player', (msg) => {
                if(ID == msg.ID){
                    localStorage.removeItem('heni-ID')
                    console.log("I was kicked")
                    ID = undefined
                }
            })

            socket.on('join', function(msg) {
                ID = msg.ID

                localStorage.setItem('heni-ID', ID);
                console.log("received ID:", ID, msg.socketID)
                //document.getElementById("info").innerHTML += `ID: ${ID}</br>`

            })

            socket.on('session', function(msg) {
                if(!msg.name){
                    resetContent()
                    socket.disconnect()
                    localStorage.removeItem('heni-ID')
                    ID = undefined
                    let content = document.getElementById("content")
                    content.innerHTML += "Session closed"
                    let btn = document.createElement("button")
                    btn.innerHTML = "REFRESH"
                    btn.addEventListener("click", function(){
                        window.location.reload();
                    })
                    content.appendChild(btn)
                }

            })


            socket.on('preload', function(msg) {
                let url = msg.name
                let finalUrl = "sound/"+url
                if(url.includes("/")){
                    finalUrl = url
                }



                    if(!queue.getResult(finalUrl)){

                        queue.loadFile({src:finalUrl, type:createjs.Types.SOUND});

                    }else{
                        console.log("already loaded", queue.getResult(finalUrl) )
                    }



                /*
                let mysrc = [baseURL+finalUrl]
                let form = finalUrl.split(".").pop()
                sound = new Howl({
                    src: mysrc,
                    autoUnlock: true,
                    html5PoolSize: 50,
                    autoSuspend: false,
                    onload: () => {
                        console.log("preload play", mysrc)
                        sound.play()
                    },
                    format: [form],
                    volume: 0
                });
                */
            })

            socket.on('msg', function(msg) {



                if(ID && started){
                    console.log("got:", msg)
                    switch(msg.type){
                        case "question":
                            console.log("recieving textinput")
                            showTextInput(msg.name)
                            break

                        case "text":
                            console.log("recieving text")
                            showText(msg.name)
                            break
                        case "image":
                            console.log("recieving image")
                            showImage(msg.name)
                            break
                        case "sound":
                            console.log("recieving sound")
                            autoplaySound(msg.name)
                            //countDown()
                            break
                        case "poll":
                            console.log("recieving poll")
                            let question = msg.name.shift()
                            showPoll(question, msg.name)
                            break
                        case "midi":
                            console.log("recieving button")
                            midiNote = msg.name.note
                            findSeat(msg.name.info)
                            break
                        case "stop":
                            console.log("recieving stop")
                            console.log(sound)
                            sound.stop()
                            Howler.stop()
                            break
                    }
                }
            })

            socket.on("connect_error", (err) => {
                //document.getElementById("content").innerHTML += `connection: ${err.message}</br>`
                console.error(`connect_error due to ${err.message}`);
            });


            socket.io.on("reconnect", () => {
                //console.log("RECONNECT")
                socket.emit('register', {ID: ID, reconnect:true, session: localStorage.getItem('heni-session') });
            });

        }




        /*socket.on('answer-poll', function(msg) {
            resetContent()
            console.log(msg)
            for(let opt of msg){
                content.innerHTML += `<span><h2>${opt.text}</h2>${opt.voters}</span><br>`
            }

        })*/



        function backgroundSound(){
            sound = new Howl({
                    src: [baseURL+'login.mp3'],
                    autoplay: true,
            });
            console.log("BG Sound")
            setTimeout(backgroundSound, 15000)
        }

        function resetContent(){
            content.innerHTML = ""
            document.body.style.backgroundImage = ""
            if(audio){
                audio.pause()
            }


        }

        function showTextInput(question){
            resetContent()
            content.innerHTML = `<h2 class="pollanswer">${question}</h2><textarea id="usertext" rows="5" placeholder="Please write here..."></textarea><button onclick="submitText()">submit</button>`
        }

        function showText(text){
            resetContent()
            content.innerHTML = `<h1 id="text" >${text}</h1>`
            window.fitText( document.getElementById("text") );
        }

        function submitText(){
            socket.emit('answer-text', {
                text: document.getElementById("usertext").value,
                ID: ID
            });
            resetContent()
        }

        function submitText2Speech(){
            socket.emit('msg', {
                type: "text2speech",
                text: document.getElementById("usertext").value
            });
        }

        function showPoll(text, options){

            resetContent()
            content.innerHTML = `<h2 id="text">${text}</h2>`
            window.fitText( document.getElementById("text") );
            options.forEach(opt => {

                //opt = opt.replace("'", "&apos;")
                console.log(opt)

                content.innerHTML += '<button class="pollanswer" onclick="submitPoll(`'+opt+'`)">'+ opt +'</button>'
                //content.innerHTML += `<button>${opt}</button>`
            })


            let btns = document.querySelectorAll("button")
            btns.forEach(btn => {
                //window.fitText(btn)
                //btn.addEventListener("click", function(){
                //    submitPoll(btn.innerHTML)
                //})

            })

        }

        function submitPoll(text){
            socket.emit('answer-poll', {
                text: text,
                ID: ID
            });
            resetContent()
        }

        function showImage(url){
            if(!content.innerHTML.includes("<img")){
                content.innerHTML = ""
                console.log("deleting welcome")
            }
            console.log(url)
            let finalUrl = "image/"+url
            if(url.includes("/")){
                finalUrl = url
            }
            //document.body.style.backgroundImage = "url('"+baseURL+finalUrl+"')"
            let img = document.createElement("img")
            //if(preload.getItemByUrl(finalUrl)){
            //    img.src = preload.getItemByUrl(finalUrl).blobUrl
            //}else{
                img.src = baseURL+finalUrl
            //}
            img.classList.add("coverimg")
            img.classList.add("hidden")
            img.addEventListener('load', removeOldImages)
            content.appendChild(img)
            //removeOldImages()

        }

        function removeOldImages(){
            let img = document.querySelector(".hidden")
            if(img){

                img.classList.remove("hidden")

                /*
                setTimeout(() => {
                    let list = document.querySelectorAll(".coverimg")
                    console.log(list)
                    list.forEach( (elem, idx, arr) => {
                        if(idx != arr.length-1){
                            elem.remove()
                        }
                    })
                }, 1000)
                */
            }


        }

        /*function playSound(url){
            resetContent()
            let finalUrl = "sound/"+url
            if(url.includes("/")){
                finalUrl = url
            }
            audio = new Audio(baseURL+finalUrl);
            countDown();

        }*/

        function autoplaySound(url){
            resetContent()
            let finalUrl = "sound/"+url
            if(url.includes("/")){
                finalUrl = url
            }

            console.log()
            //document.getElementById("content").innerHTML += 'Sound: '+baseURL+finalUrl+'</br>'
            //audio.src = baseURL+finalUrl
            //audio.play()

            let mysrc
            let form = finalUrl.split(".").pop()

            //if(preload.getItemByUrl(finalUrl)){
            //    mysrc = [preload.getItemByUrl(finalUrl).blobUrl]
            if(queue.getResult(finalUrl)){
                console.log("setting src to ", queue.getResult(finalUrl).src)
                mysrc = queue.getResult(finalUrl).src

                //document.getElementById("content").innerHTML = 'From Preload:</br>' + document.getElementById("content").innerHTML

            }else{
                mysrc = [baseURL+finalUrl]
            }



                sound = new Howl({
                    src: mysrc,
                    autoUnlock: true,
                    html5PoolSize: 50,
                    autoSuspend: false,
                    //autoplay: true,
                    //html5: true,  //dieser fallback macht irgendwie zeug kaputt
                    //onplayerror: (err) => {document.getElementById("content").innerHTML += 'PLAY ERROR'+err+'</br>'},
                    //onloaderror: () => document.getElementById("content").innerHTML += 'LOAD ERROR</br>',
                    onload: () => {
                        //document.getElementById("content").innerHTML += 'loading Sound</br>'
                        sound.play()
                    },
                    //onplay: () => document.getElementById("content").innerHTML += 'Playing Sound</br>',
                    //onunlock: () => document.getElementById("content").innerHTML += 'Sound unlocked</br>',
                    format: [form],

                });





            //sound.play();
        }

        function startPlayback(){
            audio.play()
        }

        function countDown(){

            setTimeout(function(){
                content.innerHTML = `<h1>3<h1>`
                setTimeout(function(){
                    content.innerHTML = `<h1>2<h1>`
                    setTimeout(function(){
                        content.innerHTML = `<h1>1<h1>`
                        setTimeout(function(){

                            content.innerHTML = `<button onclick="startPlayback()">PLAY</button>`



                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);

        }

        function findSeat(info){
            resetContent()
            content.innerHTML = `<button id="seat" class="big-button"></button><h2 class="red">PUSH</h2>`;

            if(info.length > 1){
                content.innerHTML += `<h5 class="red">${info}</h5>`;
            }


            let btn = document.getElementById("seat")
            /*
            btn.onmousedown = function(e){
                socket.emit('button', {
                    press: "down",
                    ID: ID,
                    note: midiNote
                });
            }

            btn.onmouseup = function(e){
                socket.emit('button', {
                    press: "up",
                    ID: ID,
                    note: midiNote
                });
            }
            */

            btn.ontouchstart = function(e){
                socket.emit('button', {
                    press: "down",
                    ID: ID,
                    note: midiNote
                });
            }

            btn.ontouchend = function(e){
                socket.emit('button', {
                    press: "up",
                    ID: ID,
                    note: midiNote
                });
            }


        }

function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}
