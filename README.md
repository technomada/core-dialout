# Core Dialout
Simple POTS dialer speakerphone. Make calls from your phone, tablet, or laptop browser.

# Requrements
- Twillio account and number.
- core-auth server


# How to use:
```
$ sudo docker run -d --restart=always --name=dialout -p 3000:3000 -v /path/to/config.js:/app/config.js technomada/core-dialout 
```

Visit
```
https://localhost:3000
```

```
+155512345678 [press enter to dial]
```

# Params
(as env or fields in config.js)
- PORT=3000
- accountSid=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
- authToken=xxxxxxxxxxxxxxxxxxxx
- applicationSid=ASxxxxxxxxxxxxxxxxxxxxxxxxxx
- callerId=+15555555555
- authURL=https://auth.example.com

### Twilio Setup
Need an "app" and provide this app ID in config.

Map app to this url for processing dial out.

/api/twilML/outgoing

e.g. https://dialout.example.com/api/twilML/web-call-outgoing
