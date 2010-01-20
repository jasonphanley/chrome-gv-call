var voiceBaseUrlRegEx = /^https?:\/\/www\.google\.com\/voice/
var voiceBaseCallUrl = "https://www.google.com/voice/m/caller?number="

var phoneNumberRegEx = /(?:^|[\s\(])(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?!\.\S|[^\s\)x\.])/
var phoneNumberRegExMatcher = new RegExp(phoneNumberRegEx)

var blankTargetRegEx = /^https?:\/\/mail\.google\.com|https?:\/\/www\.google\.com\/contacts/

var linkClass = "google-voice-link";

if (!window.location.href.match(voiceBaseUrlRegEx)) {
    linkPhoneNumbers(document.body);
    document.body.addEventListener("DOMNodeInserted", OnNodeInserted, false);
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
                var nextChild = child.nextSibling;
                if (nextChild && nextChild.class == linkClass) {
                    continue;
                }

                var phoneNumber = "+1" + (phoneNumbers[1] ? phoneNumbers[1] : phoneNumbers[2]) + phoneNumbers[3] + phoneNumbers[4];
                var formattedPhoneNumber = "(" + (phoneNumbers[1] ? phoneNumbers[1] : phoneNumbers[2]) + ") " + phoneNumbers[3] + "-" + phoneNumbers[4];

                var image = document.createElement("img");
                image.src = chrome.extension.getURL("icon48.png");
                image.style.width = "1em";
                image.style.height = "1em";

                var link = document.createElement("a");
                link.href = voiceBaseCallUrl + phoneNumber;
                if (window.location.href.match(blankTargetRegEx)) {
                    link.target = "_blank";
                }
                link.title = "Call " + formattedPhoneNumber + " with Google Voice";
                link.class = linkClass;
                link.style.marginLeft = "0.25em";
                link.appendChild(image);

                child.splitText(phoneNumbers.index + phoneNumbers[0].length);
                node.insertBefore(link, node.childNodes[++i]);
            }
        }
    }
}

var linking = false;

function OnNodeInserted(event) {
    if (linking) return;
    linking = true;
    linkPhoneNumbers(event.target)
    linking = false;
}
