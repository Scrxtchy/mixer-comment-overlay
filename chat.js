




var chatUserId = 0;


var usernameRegx = /user=(.+)&?/
var username = usernameRegx.exec(document.URL);


if (username) {
    username = username[1];
} else {
    window.location = document.URL + "?user=tenryuu";
}

var channelrequest = new XMLHttpRequest();
channelrequest.open('GET', 'https://beam.pro/api/v1/channels/' + username, true);

channelrequest.onload = function () {
    if (this.status >= 200 && this.status < 400) {
        // Success!
        var data = JSON.parse(this.response);
        //chatUserId = data.Id;

        var socketrequest = new XMLHttpRequest();
        socketrequest.open('GET', 'https://beam.pro/api/v1/chats/' + data.id, true);
        socketrequest.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                var chatdata = JSON.parse(this.response);
                var endpoints = chatdata.endpoints
                beamSocketConnect(endpoints, data.id);
            } else {
                // We reached our target server, but it returned an error
                console.log('There was a connection error, server sie');
            }
        };

        socketrequest.onerror = function () {
            // There was a connection error of some sort
            console.log('There was a connection error');
        };

        socketrequest.send();


    } else {
        // We reached our target server, but it returned an error
        console.log('There was a connection error, server side');
    }
};

channelrequest.onerror = function () {
    // There was a connection error of some sort
    console.log('There was a connection error');
};

channelrequest.send();



// General Settings
var flyouts = {};
var chatTime = 0;
timeToShowChat = chatTime; // in Milliseconds

// CHAT
// Connect to Beam Websocket
function beamSocketConnect(endpoints, UserID) {
    if ("WebSocket" in window) {

        // Let us open a web socket
        var randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        var ws = new ReconnectingWebSocket(randomEndpoint);
        console.log('Connected to ' + randomEndpoint);

        ws.onopen = function () {
            // Web Socket is connected, send data using send()
            var connector = JSON.stringify({ type: "method", method: "auth", arguments: [UserID], id: 1 });
            ws.send(connector);
            console.log('Connection Opened...');
            createText("Connected to chat");

            // Error Handling & Keep Alive
            setInterval(function () {
                errorHandle(ws);
            }, 10000)
        };

        ws.onmessage = function (evt) {
            chat(evt);

            // Debug - Log all chat events.
            // console.log(evt);
        };

        ws.onclose = function () {
            // websocket is closed.
            console.log("Connection is closed...");
        };

    } else {
        // The browser doesn't support WebSocket
        console.error("Woah, something broke. Abandon ship!");
    }
}

// Chat Messages
function chat(evt) {
    var evtString = JSON.parse(evt.data);
    var eventType = evtString.event;
    var eventMessage = evtString.data;
    //console.log(evtString)
    var completeMessage = "<img style='width: 0.8em; height: 0.8em;' src='https://beam.pro/api/v1/users/" + eventMessage.user_id + "/avatar'/>:"; //Avatar
    var messageID = eventMessage.id;

    if (eventType == "ChatMessage") {
        //console.log(evtString)
        var username = eventMessage.user_name;
        // var userrolesSrc = eventMessage.user_roles;
        // var userroles = userrolesSrc.toString().replace(/,/g, " ");
        var usermessage = eventMessage.message.message;
        console.log(usermessage);
        if (usermessage.length > 1) { //if message has two or more parts
            if (usermessage[1].type == "tag") {
                return; //and the first one is a tag, do not display
            } else if (usermessage[1].type == "emoticon") { //If it's an emoticon
                var count = 0; //Start counting from 1
                var display = true; //We'll assume it's correct

                usermessage.forEach(function (element) {
                    count = count + 1; //Count +1
                    console.log(count);
                    if (count % 2 == 0) { //if it's in a emoticon spot
                        if (element.type != "emoticon") { //If it's not what we want (an emoticon)
                            display = false; //Return and say we want to show the author
                            return;
                        }
                    } else {

                        if (element.type != "text" || (element.type == "text" && !/^\ ?$/.test(element.text))) { //If it's not what we want (a blank message)
                            display = false; //Return and say we want to show the author
                            console.log('"' + element.text + '" made us lose!');
                            return;
                        }
                    }
                });
                if (display) completeMessage = ""; //if we are going to display it as an emoticon message, hide the author set above
            }

        }

        //$.each(usermessage, function() {
        usermessage.forEach(function (message) {

            var type = message.type;

            if (type == "text") {
                var messageTextOrig = message.data;
                var messageText = messageTextOrig.replace(/([<>&])/g, function (chr) {
                    return chr === "<" ? "&lt;" : chr === ">" ? "&gt;" : "&amp;";
                });
                completeMessage += messageText;
            } else if (type == "emoticon") {
                var emoticonSource = message.source;
                var emoticonPack = message.pack;
                var emoticonCoordX = message.coords.x;
                var emoticonCoordY = message.coords.y;
                if (emoticonSource == "builtin") {
                    completeMessage += '<span class="emoticon" style="background-image:url(https:\/\/beam.pro/_latest/emoticons/' + emoticonPack + '.png); background-position:-' + emoticonCoordX + 'px -' + emoticonCoordY + 'px; height:24px; width:24px; display:inline-block;"></span>';
                } else if (emoticonSource == "external") {
                    completeMessage += '<span class="emoticon" style="background-image:url(' + emoticonPack + '); background-position:-' + emoticonCoordX + 'px -' + emoticonCoordY + 'px; height:24px; width:24px; display:inline-block;"></span>';
                }
            } else if (type == "link") {
                var chatLinkOrig = message.text;
                var chatLink = chatLinkOrig.replace(/(<([^>]+)>)/ig, "");
                completeMessage += chatLink;
            } else if (type == "tag") {
                var userTag = message.text;
                completeMessage += userTag;
            }
        });


        createText(completeMessage, messageID);

    } else if (eventType == "ClearMessages") {
        // If someone clears chat, then clear all messages on screen.
        //('.chatmessage').remove();
        document.getElementById('content').innerHTML = "";
    } else if (eventType == "DeleteMessage") {
        var item = flyouts[eventMessage.id];
        item.remove();
        // If someone deletes a message, delete it from screen.
        //('#'+eventMessage.id).remove();
    }
}







function createText(text, id) {
    var item = document.createElement('DIV');
    flyouts[id] = item;
    item.id = 'te';
    item.innerHTML = text;
    document.getElementById('content').appendChild(item);
    //item.style.paddingRight = item.offsetWidth * 2;
    //item.style.paddingLeft = item.offsetWidth * 2;
    item.style.top = Math.random() * (window.innerHeight - item.clientHeight) + "px";
    setTimeout(function () {
        item.remove();
        delete flyouts[id];
    }, 5000);
}

// Error Handling & Keep Alive
function errorHandle(ws) {
    var wsState = ws.readyState;
    if (wsState !== 1) {
        // Connection not open.
        console.log('Ready State is ' + wsState);
    } else {
        // Connection open, send keep alive.
        ws.send('{"type": "method", "method": "ping", "arguments": [], "id": 12}');
    }
}