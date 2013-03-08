var express = require ('express');
var app = express();

app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'Calder Demo Secret', cookie: { maxAge: 60 * 60 * 1000 }}));
 
// Stuff session manager knows

var ericomurl='http://10.81.108.10:8080/AccessNow/start.html';

var uriWorkspace='10.81.108.13';
var uriCSManager='10.81.108.14';

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: 'my super secret'}));
    app.use(express.static(__dirname + '/website'));    
    });

var myApps = {"apps": [
        {"name": "Outlook", "imagefile": "outlook.png", "exe": "http://10.81.108.14:3000//launch/outlook"},        
        {"name": "Word", "imagefile": "word.png", "exe": "http://10.81.108.14:3000//launch/word"},        
        {"name": "Excel", "imagefile": "excel.png", "exe": "http://10.81.108.14:3000//launch/excel"},        
        {"name": "Powerpoint", "imagefile": "powerpoint.png", "exe": "#"},        
        {"name": "Paint", "imagefile": "mspaint.png", "exe": "http://10.81.108.14:3000/launch/mspaint"},        
        {"name": "Aptana", "imagefile": "aptana.png", "exe": "http://10.81.108.14:3000//launch/aptana"},
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
    var uriRedirect = 'http://' + uriWorkspace+':3000/workspace?csuserid='+uniqueID+'&csmanager='+uriCSManager;
    console.log('uriRedirect: ' + uriRedirect);
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
var port = process.env.PORT || 3001;
app.listen(port, function () {
    console.log('Calder Session Manager - listening on '+port);
    console.log(process.argv);
});

