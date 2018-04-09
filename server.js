const express = require('express');
const app = express();
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const SmoochCore = require('smooch-core');
// test keys are alternatives, only privacy secure keys are for main app account
const KEY_ID = 'app_5a93ae6b5ed8ba0022389197';
const SECRET = 'LtbsS1fo7ORUesnHUTvsJYZ7';
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

app.post('/', (req,res)=>{

		smooch.appUsers.linkChannel(req.body.id, {
    type: 'mailgun',
    mail: req.body.email,
    confirmation: {
      type: 'immediate'
    }
		}).then((response) => {
		    console.log(response);
		    res.status(200);
		    res.end()
		}).catch(err=>{
					    console.log(err);
			res.status(500);
			res.end()
		})
	

	});


app.get('/', (req,res)=>{
			res.json('welcome to indira')
	});
app.get('/getChannels', (req,res)=>{
		smooch.appUsers.getChannels(req.query.id).then((response) => {
		    console.log(response);
		    res.status(200);
			res.end()
		}).catch(err=>{
			res.status(500);
			res.end()
			console.log(err)
		})
	});

app.get('/link',(req,res)=>{
			smooch.appUsers.linkChannel(req.query.id, {
    type: 'mailgun',
    address: req.query.email,
    confirmation: {
      type: 'immediate'
    }
		}).then((response) => {
		    console.log(response);
		    res.status(200);
		    res.end()
		}).catch(err=>{
					    console.log(err);
			res.status(500);
			res.end()
		})
})

app.post('/hook', (req,res)=>{
		console.log(req.body);
		console.log(req.body.appUser);
		console.log('appUser is indeed= '+req.body.appUser._id);
		 res.status(200);
		 res.end()
	});
app.post('/message', (req,res)=>{
		console.log(req.body);
		console.log(req.body.appUser);
		console.log('appUser is indeed= '+req.body.appUser._id);
		 res.status(200);
		    res.end()
		/*smooch.appUsers.getChannels(id here).then((response) => {
		    //Async code
		});*/
	});
//create a app:message hook for the alias email receiving an email
//create an link:success hook as well as a link:failure hook

const port = process.env.PORT || PORT;
app.listen(port);