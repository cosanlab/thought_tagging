# Thought Tagging

This is a front-end only, web-app for segmenting audio-recordings into separate *thoughts*. It's built using [Svelte](https://svelte.dev/), [Bulma](https://bulma.io/documentation/), [Peaks.js](https://github.com/bbc/peaks.js), and uses [Firebase](https://firebase.google.com/) to store data.

# Developing  

## Getting setup

1. First `git clone` this repository
2. `cd` into the `thought-tagging` folder
3. run `npm install` to setup the app dependencies on your local machine (you only need to do this once)
4. start a local server to edit interact using `npm run dev` and go to `localhost:5000`

## Project structure

The only folder that matters for changing and updating code is the `src/` folder. Svelte will automatically put everything required to run the app into the `public/` folder so there's no real reason to mess with it. Specifically, Svelte will create: `public/index.html`, `public/bundle.js`, and `public/bundle.css` and potentially additional `.min` or `.map` files with the same names. Together, those files contain everything needed to run the app without a web-server at all. 

### Main files  

`src/App.svelte`: is the main file that contains all the html, js, and css for the app; *this is the main file to work off of*    
`src/assets`: contains a single file that sets some global styling in Bulma; probably don't need to mess with it  
`src/firebase.js`: contains the configuration info to setup a connection to the firebase database; shouldn't need to alter this  
`src/main.js`: just sets up the main app; shouldn't need to alter this  

### Extra files  

`package.json`: tells `npm some-command` what to do as well as indicates the requirements and dependencies of the app; should rarely need to modify this file directly because `npm` will do it for you  
`rollup.config.js`: configuration for how Svelte will automatically create everything; shouldn't really need to mess with this much now either


# Deploying

We have a few options static hosting options including netlify, now, surge and firebase hosting. Each of them have instructions so we can see what works best with mTurk. We can build the app using `npm run build` but some of these providers will run that command for us. 

