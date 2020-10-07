;(async n=>{

	//
	// https://www.twilio.com/docs/voice/client/javascript/connection
	//

	let base = './api' //+key
	let stationID = 'ext10'

	console.log(base,stationID)


	let config = await fetch('./config')
	config = await config.json() // upg: on error
	let {authURL} = config
	console.log({config})

	let dLogin = document.querySelector('.login') // upg: use iframe better not to though.  iframe maybe for app id or?? app id from ref?
	

	dLogin.onclick = e=>{
		console.log('login!')
		window.open(authURL,'auth_login_window','')
		}

	// auth................... 
	let f = await fetch(authURL+'/api/v1/ref',{credentials:'include'}) // upg: inported api for these functions
	let ref = await f.json()

	f = await fetch(authURL+'/api/v1/me/'+ref)
	let me = await f.json()
	if(!me){
		// 'Running as guest (login and reload for custom time.
			dLogin.classList.remove('hidden')
		}

	console.log({ref,me})

	const run = async n=>{
		document.body.xonclick = n=>{ /// upg: make this a gesture? 
			//toggle fullscreen // upg: use polyfill
			if(document.fullscreen)
				document.exitFullscreen()
			else
				document.documentElement.requestFullscreen() 
			}

		let token = await fetch(base+'/twilio/token/'+stationID,{
			method:'POST',
			headers:{
				'X-Auth-Token': ref // custom field.	
				}
			})
		token = await token.text();
		console.log('token',token)
		const td = new Twilio.Device(token)
		
		console.log(td)


		let connection = false // set this when we have a connection
		td.on('ready',device=>{
				console.log('ready',device)
				// token must be correct
				document.querySelector('main').classList.add('ready')
				let n = document.querySelector('input')
				n.focus()	
				})

		td.on('connection',conn=>{
				console.log('connect',conn)
				connection = conn // global rememember connection 
				})

		td.on('disconnect',conn=>{
				console.log('disconnect',conn)
				//dom.querySelector('.dialer').classList.remove('call-live')
				//dom.querySelector('.in-call').classList.add('hidden')
				//_call = false // is there a for sure end of call we can use?
				})

		td.on('incoming',conn=>{
				//upg: accept phone calls (note need to route them here in other call url logic) -- good opertunity to coordinate apps.
				console.log('incoming',conn)
				})

		if(td.audio)
			td.audio.on('deviceChange',e=>console.log('deviceChange',e))

		

		f = document.querySelector('form')

		let i = document.querySelector('input')

		i.onkeydown = e=>{
			let {key} = e
			if('0123456789*#'.includes(key)){
				console.log('try key',key,connection)
				if(connection)
					connection.sendDigits(key)
				}//if
			}

		f.onsubmit = e=>{
			e.preventDefault()
			let n = document.querySelector('input')
			let v = n.value
			console.log(v)

			setTimeout(n=>{
					console.log('calling')
					connection = td.connect({number:v}) // {number:'555-555-5555'} POST/GET params to be passed to your app handler.
					},500)

			}
		}//func

	// -------------------------------
	;(n=>{ // wait for signin
		const check = async n=>{	
			console.log('wait for signin')
			if(!me){
				let f = await fetch(authURL+'/api/v1/me/'+ref)
				me = await f.json()
				console.log({me})
				if(me) {
					dLogin.classList.add('hidden')

					run()
					}
				else
					setTimeout(check,1500)
				}
			else {
				run()
				}
			}

		check()
		})();
	})();
