const express = require('express');
const app = express();
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const SmoochCore = require('smooch-core');
// test keys are alternatives, only privacy secure keys are for main app account
const KEY_ID = process.env.KEY_ID || 'app_5a93ae6b5ed8ba0022389197';
const SECRET = process.env.SECRET || 'LtbsS1fo7ORUesnHUTvsJYZ7';
const PORT = 8080;
const smooch = new SmoochCore({
      keyId: KEY_ID,
      secret: SECRET,
      scope: 'app', // account or app
  });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
      extended: false
  }));
app.use(cookieParser());
app.use(cors());

const utilLink = (id,email,success,fail)=>{
	return smooch.appUsers.linkChannel(id, {
    type: 'mailgun',
    address: email,
    confirmation: {
      type: 'immediate'
    },
    primary:false
		}).then((response) => {
			if(typeof success === 'function'){
		    success(response)
		    return true
			}else{
				return true
			}
		}).catch(err=>{
				if(typeof fail === 'function'){
		    fail(err)
		    return false
			}else{
				return false
			}
					
		})
}

app.get('/', (req,res)=>{
			res.json('welcome to indira')
	});
app.get('/user',(req,res)=>{
		smooch.appUsers.get(req.query.email).then((response) => {
		 console.log(response)
	   res.json(response);
	});
})
app.get('messages',(req,res)=>{
		smooch.appUsers.getMessages(req.query.id).then((response) => {
			console.log(response)
	    res.json(response)
	});
})

app.get('/getChannels', (req,res)=>{
		smooch.appUsers.getChannels(req.query.id).then((response) => {
		    console.log(response);
		    res.json(response)
		}).catch(err=>{
			res.status(500);
			res.end()
			console.log(err)
		})
	});

app.get('/link',async (req,res)=>{
		const response = await utilLink(req.query.id,req.query.email);
		if(response){
			res.json('success')
		}else{
			res.json('failure')
		}
})

app.post('/hook', (req,res)=>{
		console.log('req.body object===>',req.body);
		console.log('------- end req.body object ------- ')
		console.log('appUser object is to the right'+JSON.stringify(req.body.appUser));
		console.log('appUser is indeed= '+req.body.appUser._id);
		 res.status(200);
		 res.end()
	});
app.post('/message', (req,res)=>{
	const EMAILS = ['andrewjameswilliams.aw@gmail.com','andrewjameswilliams1995@gmail.com','andrew.williams003@mymdc.net']
		console.log(req.body);
		console.log(req.body.appUser);
		console.log('appUser is indeed= '+req.body.appUser._id);
		smooch.appUsers.getChannels(req.body.appUser._id).then((response) => {
			console.log(response);
			const mailgun = response.channels.reduce((sum,value)=>{return value.type==='mailgun'?true:sum;},false);
			const frontendEmail = response.channels.filter((value)=>{return value.type==='frontendEmail'});
		    if(!mailgun&&frontendEmail.length>0&&EMAILS.includes(frontendEmail[0].address)){
		    		utilLink(req.body.appUser._id,frontendEmail[0].address,(value)=>{
		    			console.log(value)
		    		},(err)=>{
		    			console.log(err)
		    		})
		    }
		}).catch(err=>{
			console.log(err)
		})
		res.status(200);
		res.end()
	});

// if in the data dump we check for the email property to see if every user has an email property
// check all messages for those who have a front end email and it doesn't mailgun channel, then link the mailgun channel

const port = process.env.PORT || PORT;
app.listen(port);