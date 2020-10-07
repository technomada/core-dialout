const express = require('express')
const path = require('path')

const twilio = require('twilio')

const xmlescape = require('xml-escape')

const fetch = require('node-fetch')

let config = {}
try{
	config = require('./config.js')
	}
catch(e){
	console.log('no config.js detected.')
	}

let {authURL,PORT,accountSid,authToken,applicationSid,callerId} = process.env

authURL = authURL || config.authURL || 'http://localhost:3111'
PORT = PORT || config.PORT || 3000
accountSid = accountSid || config.accountSid
authToken = authToken || config.authToken
applicationSid = applicationSid || config.applicationSid // twilML app.
callerId = callerId || config.callerId

const sourcePath  = path.join(__dirname,'')

console.log({accountSid,authToken,applicationSid,callerId,PORT,authURL})

const ClientCapability = twilio.jwt.ClientCapability;
const VoiceResponse = twilio.twiml.VoiceResponse;
let client = new twilio(accountSid, authToken);


;(async n=>{
	// server
	//
	let app = express()
	app.use(express.static(path.join(__dirname,'www')))

	app.use(express.urlencoded({extended:true})) //allow rich objects encoded in params.
	
	/// -------------------------------------
	//
	app.all('/config',(req,res)=>{
		let c = {authURL}
		res.json(c)
		})//func


	// --------------------------------------
	// get browser client key...
	app.all('/api/:key?/twilio/token/:id',async (req,res)=>{
		const {key,id} = req.params

		const ref = req.get('x-auth-token')
		console.log('ref',{ref,refx:req.headers})

		let f = await fetch(authURL+'/api/v1/me/'+ref)
		let u = await f.json()

		console.log({u})

		if(u){ /// have a user (upg: get vars instead to see if have call access and id and such... (upg: how to get generailzed call support via api?)
			const capability = new ClientCapability({accountSid,authToken});
			capability.addScope(new ClientCapability.OutgoingClientScope({applicationSid}))	
			console.log('adding incomming scope as',id)
			capability.addScope(new ClientCapability.IncomingClientScope(id))
			const token = capability.toJwt();
			res.send(token)
			}
		else
			res.send('-bad-key-')
		})


	// ---------------------------------------
	// provide twilio with action commands to process call.
	app.all('/api/twiML/outgoing',async (req,res)=>{
		console.log('web client requesting to make a call',req.body)

		// debug //////////////////
		//req.body = {
		//	From: '22222',
		//	CallSid: '234324',
		//	number: '12345678'
		//	}

		let n = req.body
		let from = n.From 
		let callSid = n.CallSid
		let number = n.number

		console.log({from,callSid,number})

		const response = new VoiceResponse()
		const dial = response.dial({callerId})
		dial.number(xmlescape(number))

		// <?xml version="1.0" encoding="UTF-8"?><Response><Dial callerId="+14158546590"><Number>+18005550123</Number></Dial></Response>
		res.send(response.toString())
		})


	app.listen(PORT,async n=>{
		console.log('port ready',PORT)
		})
	})();
