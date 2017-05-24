function magniLog(msg){
    // Makes Magni's debug output stand out from Gmail
    console.log(`%c>> Magni: ${msg}`, 'background-color: #902C35; color: #FFF');
}
let magni = {};

function updateSidebar(el, threadView){
    let emails = new Set();
    for(let message of threadView.getMessageViewsAll()){
        if(message.isLoaded()){
            emails.add(message.getSender());
            for(let email of message.getRecipients()){
                emails.add(email);
            }
        }
    }

    let qs = '';
    for(let email of emails){
        qs = qs + "&email=" + encodeURIComponent(email['emailAddress']);
    }
    qs = qs.substr(1);

    el.setAttribute("src", '{{ crm_location }}/sidebar/?' + qs);
}

chrome.runtime.onMessage.addListener(function(message){
    magniLog(JSON.stringify(message));
    if(message['message'] == 'sidebarRender'){
        magni.el.style.height = (message['height'] + 15) + 'px';
    }
});

InboxSDK.load('2', 'sdk_magni_429e6f5389').then(function(sdk){
    magniLog('Gmail extension active');
    sdk.Conversations.registerThreadViewHandler(function(threadView){
        let messagesLeftToLoad = threadView.getMessageViewsAll().length;
        let el = document.createElement("iframe");
        magni.el = el;
        el.style.width = "200px";
        el.style.border = "0px";

        for(let message of threadView.getMessageViewsAll()){
            message.on('load', () => {
                updateSidebar(el, threadView);
            });
        }

        threadView.addSidebarContentPanel({
            title: "Magni",
            el: el,
            iconUrl: chrome.extension.getURL('icons/app-13.png')
        });
    });
});
