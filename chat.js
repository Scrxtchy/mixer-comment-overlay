var chatUserId = 0;
//document.getElementById('#te').style.animationDuration = TTL + 's';
var usernameRegx = /user=(\w+)&?/
var oauthRegx = /oauth=([0-z]+)&?/
var TTLregex = /TTL=((\d+\.\d+)|(\d+))&?/
var ClientRegex = /client=([0-z]+)&?/
var username = usernameRegx.exec(document.URL);
var oauth  = oauthRegx.exec(document.URL);
var TTL = TTLregex.exec(document.URL); // Secons to live
var ClientID = ClientRegex.exec(document.URL);

if (username && oauth) {
	username = username[1].toLowerCase();
	oauth = oauth[1];
} else {
	var username = window.prompt("Please enter your username", "KappaCares");
	var oauth = window.prompt("Please enter your oauth key", "eno2689zeovrbb1b8ikoluqimh0824")
	window.location += "?user=" + username + "&oauth=" + oauth;
}

if (TTL){
	if (TTL[2]) {
		TTL = TTL[2]
	} else {
		TTL = TTL[1]
	}
} else {
	TTL = 5;
}

var TTLcss = document.createElement('style');
TTLcss.type = 'text/css';
TTLcss.innerHTML = '#te {animation-duration: ' + TTL + 's !important;}';
document.getElementsByTagName('head')[0].appendChild(TTLcss);
// General Settings
var flyouts = {};
var chatTime = 0;
timeToShowChat = chatTime; // in Milliseconds
//twitchSocket()

// CHAT

client = new window.tmi.client({options:{debug:true},channels:[username]});

client.addListener('message', handleChat);
client.connect();

function handleChat(channel, user, message, self){
var avatar = ''


var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
	if (xhr.readyState == XMLHttpRequest.DONE) {
		avatar = "<img class='imgAvatar' style='width: 0.8em; height: 0.8em;' src='" + JSON.parse(xhr.responseText).logo + "'/>:";
		createText(avatar + message, user['id'])
	}
}
xhr.open('GET', 'https://api.twitch.tv/kraken/users/' + user['user-id'], true);
xhr.setRequestHeader("Client-ID", ClientID)
xhr.setRequestHeader("Accept", 'application/vnd.twitchtv.v5+json')
xhr.send(null);



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
	}, TTL * 1000);
}













//Chat Messages
// function chat(evt) {
	// var evtString = JSON.parse(evt.data);
	// var eventType = evtString.event;
	// var eventMessage = evtString.data;
//	console.log(evtString)
	// var completeMessage = "<img class='imgAvatar' style='width: 0.8em; height: 0.8em;' src='https://mixer.com/api/v1/users/" + eventMessage.user_id + "/avatar'/>:"; //Avatar
	// var messageID = eventMessage.id;
// 
	// if (eventType == "ChatMessage") {
//		console.log(evtString)
		// var username = eventMessage.user_name;
//		console.log(eventMessage);
		// var usermessage = eventMessage.message.message;
		// if (usermessage.length > 140) return; //Only show messages shorter than 140Char
		// if (usermessage.length > 1) { //if message has two or more parts
			// if (usermessage[1].type == "tag") {
				// return; //and the first one is a tag, do not display
			// } else if (usermessage[1].type == "emoticon") { //If it's an emoticon
				// var count = 0; //Start counting from 1
				// var display = true; //We'll assume it's correct
// 
				// usermessage.forEach(function (element) {
					// count = count + 1; //Count +1
//					console.log(count);
					// if (count % 2 == 0) { //if it's in a emoticon spot
						// if (element.type != "emoticon") { //If it's not what we want (an emoticon)
							// display = false; //Return and say we want to show the author
							// return;
						// }
					// } else {
// 
						// if (element.type != "text" || (element.type == "text" && !/^\ ?$/.test(element.text))) { //If it's not what we want (a blank message)
							// display = false; //Return and say we want to show the author
							// return;
						// }
					// }
				// });
				// if (display) completeMessage = ""; //if we are going to display it as an emoticon message, hide the author set above
			// }
// 
		// }
// 
//		$.each(usermessage, function() {
		// var txtLength = 0;
		// usermessage.forEach(function (message) {
			// var type = message.type;
			// if (type == "text") {
				// txtLength = txtLength + message.data.length;
				// var messageTextOrig = message.data;
				// var messageText = messageTextOrig.replace(/([<>&])/g, function (chr) {
					// return chr === "<" ? "&lt;" : chr === ">" ? "&gt;" : "&amp;";
				// });
				// completeMessage += messageText;
			// } else if (type == "emoticon") {
				// var emoticonSource = message.source;
				// var emoticonPack = message.pack;
				// var emoticonCoordX = message.coords.x;
				// var emoticonCoordY = message.coords.y;
				// if (emoticonSource == "builtin") {
					// completeMessage += '<span class="emoticon" style="background-image:url(https:\/\/mixer.com/_latest/emoticons/' + emoticonPack + '.png); background-position:-' + emoticonCoordX + 'px -' + emoticonCoordY + 'px; height:24px; width:24px; display:inline-block;"></span>';
				// } else if (emoticonSource == "external") {
					// completeMessage += '<span class="emoticon" style="background-image:url(' + emoticonPack + '); background-position:-' + emoticonCoordX + 'px -' + emoticonCoordY + 'px; height:24px; width:24px; display:inline-block;"></span>';
				// }
			// } else if (type == "link") {
				// txtLength = txtLength + message.data.length;
				// var chatLinkOrig = message.text;
				// var chatLink = chatLinkOrig.replace(/(<([^>]+)>)/ig, "");
				// completeMessage += chatLink;
			// } else if (type == "tag") {
				// txtLength = txtLength + message.data.length;
				// var userTag = message.text;
				// completeMessage += userTag;
			// }
		// });
// 
//		console.log(txtLength);
		// if (txtLength > 150) return;
		// createText(completeMessage, messageID);

//	} else if (eventType == "ClearMessages") {
		// If someone clears chat, then clear all messages on screen.
		//('.chatmessage').remove();
//		document.getElementById('content').innerHTML = "";
//	} else if (eventType == "DeleteMessage") {
//		var item = flyouts[eventMessage.id];
//		item.remove();
		// If someone deletes a message, delete it from screen.
		//('#'+eventMessage.id).remove();
//	}
//}