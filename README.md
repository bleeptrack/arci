<p align="center">
  <img src="public/logo.png" alt="arci logo" width="200"/>
</p>

# arci
interactive stage performances via smartphone

arci is in active developement and is _not_ yet recommended for productive use. Feel free to experiment with it though :)

Developement by [bleeptrack](https://www.bleeptrack.de) and [Henrike Iglesias](https://henrikeiglesias.com/).

# Requirements

- webserver:
  - running node and npm
  - capable of serving static files (f.e. nginx)
  - reachable in your local network or publicly, depending on your use case

# Installation

Clone the repo and run

```npm install```



In the cloned folder, you will find a file called ```config.json```. Here, set the information as follows:

```absolute-static-file-path``` is the path to a folder where your static files can be served
```port``` is the port number that the arci server can run on

# Usage

Start the server with ```npm run```

You can now open the arci control page at ```http://<your-domain>/control```.
Create your cues, order them in the cue list and when you are ready, start a session with the "start session" button. Only then people are able to connect.

Guide your audience to ```http://<your-domain>/seat/```

In case people on stage need to be assigned a certain participant ID, then guide them to ```http://<your-domain>/seat/<ID>```

# Creating custom Interaction Types

You can create your own Interaction Types by adding a file to the ```public/InteractionTypes/``` folder on your server. A template with description of available methods can be found in ```interaction-template.js```.

# Examples

  - ["Flames to Dust" Performance by Henrike Iglesias](https://vimeo.com/783255056)
  - [Behind the Scenes of "Flames to Dust"](https://youtu.be/FHuoa7xH7Dw)

# License 

arci uses the [Blue Oak Model 1.0 License](https://blueoakcouncil.org/license/1.0.0)

We also kindly ask you to mention arci(bleeptrack, Henrike Iglesias) in your performance credits :)

# Thank you!

This project is supported by Prototype Fund and BMBF.

Big thank you to Lasse Marburg and [machina ex](https://machinaex.org/) for your inspiration!
