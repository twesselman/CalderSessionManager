var express = require ('express');
var app = express();

app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'Calder Demo Secret', cookie: { maxAge: 60 * 60 * 1000 }}));
 
// Stuff session manager knows

var ericomurl='http://10.81.108.10:8080/AccessNow/start.html';

var uriWorkspace, uriCSManager;

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: 'my super secret'}));
    app.use(express.static(__dirname + '/website'));    
    });


app.post('/set', function (req, res) {
    console.log('set called');
    req.session.username = req.body.name;
    res.cookie('mycookie', req.body.name);
    res.send('session.username set to ' + req.body.name);
});

app.get('/read', function(req, res) {
   if(req.session.username)
   {
       var result = 'session.username: ' + req.session.username + '<br>';
       result += 'cookie: ' + req.cookies.mycookie +'<br>';
       
       result += req.cookies;
       res.send(result);
   } 
   else
   {
       res.send('no data');
   }  
});

var myApps = {"apps": [
        {"name": "Outlook", "imagefile": "outlook.png", "exe": "/launch/outlook"},        
        {"name": "Word", "imagefile": "word.png", "exe": "/launch/word"},        
        {"name": "Excel", "imagefile": "excel.png", "exe": "/launch/excel"},        
        {"name": "Powerpoint", "imagefile": "powerpoint.png", "exe": "10.81.108.14:3000/launch/msppt"},        
        {"name": "Paint", "imagefile": "mspaint.png", "exe": "10.81.108.14:3000/launch/mspaint"},        
        {"name": "Aptana", "imagefile": "aptana.png", "exe": "/launch/aptana"},
        {"name": "Autocad", "imagefile": "autocad.png", "exe": "#"},
        {"name": "SAP ERP", "imagefile": "erp.png", "exe": "#"}
    ]
};

app.get('/myapps', function(req, res) {
    console.log('get myapps');
    console.log(myApps);
    res.send(JSON.stringify(myApps));
});

app.post('/login', function(req, res) {
    console.log('login: '+req.body.username + ' password: ' + req.body.password);
    
    // do login stuff
    req.session.username = req.body.username;
    req.session.password = req.body.password;
    
    res.redirect('/gotoworkspace');
});

app.get('/gotoworkspace', function(req, res) {
    console.log('gotoworkspace: username: '+req.session.username + ', password: ' + req.session.password);
    
    var uniqueID = 'idval:'+req.session.username;
    var uriRedirect = uriWorkspace+'/workspace?csuserid='+uniqueID+'&csmanager='+uriCSManager;
    res.redirect(uriRedirect);
});

app.get('/launch/:app', function(req, res) {
    console.log('launch called: App: '+req.params.app);
    
    // set cookies (works only if Ericom is on the same server

    res.cookie('EAN_username', 'Tom');
    res.cookie('EAN_password', 'Cisco123!');
    res.cookie('EAN_autostart', 'true');
    res.cookie('EAN_remoteapplicationmode', 'true');

    var appPath;
    switch (req.params.app) {
    case 'aptana': 
        appPath = '"C:\\Users\\Administrator\\AppData\\Local\\Aptana Studio 3\\AptanaStudio3.exe"';
        break;
    case 'desktop': 
        res.cookie('EAN_remoteapplicationmode', 'false');
        console.log('Launching: desktop');
        break;
    default: 
        appPath = req.params.app;
    }

    if (appPath) {
        res.cookie('EAN_alternate_shell', appPath);
        console.log('Launching: ' + appPath);
    } 
    
    var url = ericomurl;
    if (appPath) {
        url += '?autostart=true&remoteapplicationmode=true&username=Tom&password=Cisco123!&alternate_shell=';
        url += appPath;        
    }    
    else {
        url += '?autostart=true&username=Tom&password=Cisco123!';
    }
    
    console.log(url);
    res.redirect(url);
});

// listen
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Calder Session Manager - listening on '+port);
    console.log(process.argv);
    if (process.argv[2]=='c9')
    {
        console.log('running in c9');
        uriWorkspace='cdemo.twesselman.c9.io';
        uriCSManager='caldersessionmanager.twesselman.c9.io';
    }
    else
    {
        console.log('running in openstack');
        uriWorkspace='10.81.108.13:3000';
        uriCSManager='10.81.108.14:3000';
    }
});

