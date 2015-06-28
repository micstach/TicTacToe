"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 8080;

// websocket and http servers
var express = require('express') ;

var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var path = require('path');

/**
 * Global variables
 */
// latest 100 messages
var history = [ ];

// list of currently connected clients (users)
var clients = [ ] ;

// loged players
var players = [ ] ;

var map = [] ;

var challengeMap = [] ;

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function createGuid()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function isPlayerInChallenge(guid)
{
    for (var challengeGuid in challengeMap)
    {
        var challenge = challengeMap[challengeGuid] ;
     
        if (challenge.challenger.guid == guid)
            return true ;
        if (challenge.challenged.guid == guid)
            return true ;
    }
    
    return false ;
}

function sendPlayersListToAll()
{
    for (var guid in map)
    {
        sendPlayersList(guid) ;
    }
}

function sendPlayersList(guid)
{
    var _players = new Array() ;

    for (var i=0; i<players.length; i++){
        if (players[i].guid !== guid) {
            
            var idx = _players.push(players[i]) - 1;

            _players[idx].isInChallenge = isPlayerInChallenge(_players[idx].guid);
        }
    }

    var playersList = {
        players: _players,
        type: "players-list"
    };

    map[guid].sendUTF(JSON.stringify(playersList)) ;
}

function getUserData(name)
{
    var userPath = __dirname + '/db/users/' + name.toLowerCase() + ".json" ;

    return JSON.parse(fs.readFileSync(userPath)) ;
}

function saveUserData(userData)
{
    var userPath = __dirname + '/db/users/' + userData.name.toLowerCase() + ".json" ;
    
    fs.writeFileSync(userPath, JSON.stringify(userData)) ;
}

function updatePlayerData(userData)
{
    for (var i=0; i<players.length; i++) {
        if (players[i].guid === userData.guid) {
            players[i] = userData ;
            return ;
        }
    }                    
}

/**
 * HTTP server
 */
var app = express()
	.use(express.static(__dirname)) ;
	/*
	.use(express.bodyParser())
	.use(express.cookieParser())
	.use(function(req, res) {
		res.cookie("secret", "secret-value", {expires: new Date(Date.now() + 86400000)}) ;
		res.end(JSON.stringify(req.query) +"\n") ;
	}) ;
	*/

app.get('/status', function(req, res){
    res.writeHead(200, {'Content-Type': 'application/json'});
    var responseObject = {
        currentClients: players.length,
        totalHistory: history.length
    }
    res.end(JSON.stringify(responseObject));
}) ;

app.post('/logoff/:guid', function(req, res){
    console.log('logoff: ' + req.params.guid) ;
    
    for (var i=0; i<players.length; i++){
        if (players[i].guid == req.params.guid) {
            players.splice(i, 1);
            break ;
        }
    }
    
    var result = { };
    
    sendPlayersListToAll() ;
    
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result));
});

app.post('/login/:name', function(req, res){
    console.log("User login: " + req.params.name) ;
    
    var userPath = __dirname + '/db/users/' + req.params.name.toLowerCase() + ".json" ;
    console.log(userPath) ;
    
    if (!fs.existsSync(userPath)) {
        var userObject = {
            name: req.params.name,
            guid: createGuid(),
            registered: new Date().getTime(),
            winnings: 0,
            lost: 0,
            draws: 0            
        };
        fs.writeFileSync(userPath, JSON.stringify(userObject));
    }
    var userData = fs.readFileSync(userPath) ;
    
    if (userData == null)
        console.log("User file not found !") ;
    
    var loggedUser = JSON.parse(userData) ;
    var addClient = true ;
    for (var i=0; i<players.length; i++)
    {
        if (players[i].guid === loggedUser.guid) {
            
            // update players data
            players[i] = loggedUser ;
            
            // do not add it
            addClient = false ;
        }
    }
    
    if (addClient)
        players.push(loggedUser) ;
    
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(userData);
});

app.get('/players', function(req, res) {
    console.log('get players');
    console.log('player guid: ' + req.query.guid);
    var playerGuid = req.query.guid ;
    
    
    var _players = new Array() ;
    
    for (var i=0; i<players.length; i++){
        if (players[i].guid !== playerGuid) {
            _players.push(players[i]) ;
        }
    }
            
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(_players));
});

var server = http.createServer(app) ;

server.listen(webSocketsServerPort);
console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);


/**
 * WebSocket server
 */

var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

console.log((new Date()) + " WebSocket server started " + webSocketsServerPort);

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;

    console.log((new Date()) + ' Connection accepted.');

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            
            var msg = JSON.parse(message.utf8Data) ;
            
            if (msg.type == 'login-request')
            {
                console.log("login-request: " + msg.guid);
                map[msg.guid] = this ;
                
                sendPlayersListToAll() ;
            }
            else if (msg.type == 'players-request')
            {
                console.log("players-request: " + msg.guid);
                sendPlayersList(msg.guid) ;
            }
            else if (msg.type == 'challenge-request')
            {
                if (msg.challenge.guid == null)
                    msg.challenge.guid = createGuid() ;
                
                challengeMap[msg.challenge.guid] = msg.challenge ;
                                
                var payload = {
                    type: "challenge-request",
                    challenge: msg.challenge
                }
                
                sendPlayersListToAll();
                
                map[msg.challenge.challenged.guid].sendUTF(JSON.stringify(payload)) ;
            }
            else if (msg.type == 'challenge-response')
            {
                if (msg.challenge.status == "rejected")
                    delete challengeMap[msg.challenge.guid];
                
                sendPlayersListToAll() ;
                
                var payload = {
                  type: 'challenge-response',  
                  challenge: msg.challenge
                };
                
                map[msg.challenge.challenger.guid].sendUTF(JSON.stringify(payload)) ;
            }
            else if (msg.type == 'challenge-playing')
            {
                var destination = msg.challenge.challenged.guid ;
                
                if (msg.challenge.status == "start")
                {
                    var payload = {
                      type: 'challenge-playing',  
                      challenge: msg.challenge
                    };

                    map[msg.challenge.challenger.guid].sendUTF(JSON.stringify(payload)) ;
                    map[msg.challenge.challenged.guid].sendUTF(JSON.stringify(payload)) ;
                }
                else
                {
                    if (msg.challenge.status == "moving") {
                        if (msg.challenge.nextTurn.guid == destination)
                            destination = msg.challenge.challenger.guid;
                    }
                    else if (msg.challenge.status == "click"){
                        destination = msg.challenge.nextTurn.guid;
                    }

                    var connection = map[destination];

                    var payload = {
                      type: 'challenge-playing',  
                      challenge: msg.challenge
                    };

                    connection.sendUTF(JSON.stringify(payload)) ;
                }
            }
            else if (msg.type == 'challenge-finished')
            {
                delete challengeMap[msg.challenge.guid];
                
                var challengerData = getUserData(msg.challenge.challenger.name) ;
                var challengedData = getUserData(msg.challenge.challenged.name) ;
                
                if (msg.challenge.gameboard.winner === 1) {
                    // challenged wins
                    challengerData.lost += 1 ;
                    challengedData.winnings += 1 ;
                    
                    msg.challenge.winner = msg.challenge.challenged;
                }
                else if (msg.challenge.gameboard.winner === 2)
                {
                    // challenger wins
                    challengerData.winnings += 1 ;
                    challengedData.lost += 1 ;
                    
                    msg.challenge.winner = msg.challenge.challenger;
                }
                else if (msg.challenge.gameboard.winner == 0)
                {
                    // draw
                    challengerData.draws += 1 ;
                    challengedData.draws += 1 ;
                }

                updatePlayerData(challengerData) ;
                updatePlayerData(challengedData) ;
                
                saveUserData(challengerData) ;
                saveUserData(challengedData) ;

                // send user data
                map[msg.challenge.challenger.guid].sendUTF(JSON.stringify({
                    type: "player-data",
                    user: challengerData})) ;

                map[msg.challenge.challenged.guid].sendUTF(JSON.stringify({
                    type: "player-data",
                    user: challengedData})) ;
                
                var payload = {
                  type: 'challenge-finished',  
                  challenge: msg.challenge
                };                
                
                map[msg.challenge.challenger.guid].sendUTF(JSON.stringify(payload)) ;
                map[msg.challenge.challenged.guid].sendUTF(JSON.stringify(payload)) ;
                
                sendPlayersListToAll();
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        // remove user from the list of connected clients
        if (players[index] !== undefined)
            delete map[players[index].guid] ;
        
        clients.splice(index, 1);
        players.splice(index, 1);
                
        sendPlayersListToAll() ;
    });

});