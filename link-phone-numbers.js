var voiceBaseUrlRegEx = /^https?:\/\/www\.google\.com\/voice/
var voiceBaseCallUrl = "https://www.google.com/voice/m/caller?number="

var phoneNumberRegEx = /(?:\+?1\s?[-\.]?\s?)?(\d{3}|\(\d{3}\))\s?[-\.]?\s?(\d{3})\s?[-\.]?\s?(\d{4}(?!\d))/
var phoneNumberRegExMatcher = new RegExp(phoneNumberRegEx)

if (!window.location.href.match(voiceBaseUrlRegEx)) {
    linkPhoneNumbers(document.body);
}

function linkPhoneNumbers(node) {
    for (var i = 0; i < node.childNodes.length; ++i) {
        var child = node.childNodes[i];
        if (child.nodeName == "SCRIPT" || child.nodeName == "NOSCRIPT"
                || child.nodeName == "OBJECT" || child.nodeName == "EMBED"
                || child.nodeName == "APPLET" || child.nodeName == "IFRAME") {
            continue;
        }

        if (child.childNodes.length > 0) {
            linkPhoneNumbers(child);
        } else if (child.nodeType == 3) {
            var phoneNumbers = phoneNumberRegExMatcher.exec(child.nodeValue);
            if (phoneNumbers) {
                var phoneNumber = phoneNumbers[0].replace(/^\s+|\s+$/g,"");
                var index = child.textContent.indexOf(phoneNumber);
                if (index == -1) {
                    continue;
                }

                var image = document.createElement("img");
                image.src = chrome.extension.getURL("icon48.png");
                image.style.width = "1em";
                image.style.height = "1em";

                var link = document.createElement("a");
                link.href = voiceBaseCallUrl + encodeURIComponent(phoneNumber);
                link.title = "Call " + phoneNumber + " with Google Voice";
                link.style.marginLeft = "0.25em";
                link.appendChild(image);

                child.splitText(index + phoneNumber.length);
                node.insertBefore(link, node.childNodes[++i]);
            }
        }
    }
}
