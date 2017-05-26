import Mn from 'backbone.marionette';
import Bb from 'backbone';
import $ from 'jquery';

import SideBar from 'views/sidebar';
import ComposeView from 'views/compose';
import {blacklist, BaseCollection} from 'utils';

require("style/main.scss");

function magniLog(msg){
    // Makes Magni's debug output stand out from Gmail
    console.log(`%c>> Magni: ${msg}`, 'background-color: #902C35; color: #FFF');
}

InboxSDK.load('2', 'sdk_magni_429e6f5389').then(function(sdk){
    function magnijax(url, cb){
        $.get(`{{ crm_location }}${url}`, cb).fail(function(){
            sdk.ButterBar.showError({
                text: "Magni: Failed to fetch information from Magni"
            });
        });
    }

    magniLog('Gmail extension active');

    sdk.Compose.registerComposeViewHandler(function(composeView){
        // Button needed for Inbox support
        composeView.addButton({
            title: "Clip to Magni",
            iconUrl: chrome.extension.getURL('icons/dog.svg'),
            onClick: function(event){
                magniLog('Clip to Magni button');
                let magniView = new ComposeView({
                    el: event.dropdown.el,
                    composeView: composeView
                });
                magniView.render();
            },
            hasDropdown: true
        });
        // Gmail lets us have custom UI <3
        let statusBar = composeView.addStatusBar({
            height: 100
        });
        let magniView = new ComposeView({
            el: statusBar.el,
            composeView: composeView
        });
        magniView.render();
    });

    sdk.Conversations.registerThreadViewHandler(function(threadView){
        let messagesLeftToLoad = threadView.getMessageViewsAll().length;
        let el = document.createElement("div");
        let col = new BaseCollection();

        let view = new SideBar({
            el: el,
            collection: col,
            threadID: threadView.getThreadID()
        });
        let emailsLoaded = new Set();

        for(let message of threadView.getMessageViewsAll()){
            let emails = new Set();
            message.on('load', () => {
                emails.add(message.getSender());
                for(let email of message.getRecipients()){
                    emails.add(email);
                }
                for(let email of emails){
                    if(!emailsLoaded.has(email)){
                        let bin = false;
                        for(let domain of blacklist){
                            if(email['emailAddress'].indexOf(domain) > 0){
                                bin = true;
                                break;
                            }
                        }
                        if(!bin){
                            magnijax("/entity/?email=" + encodeURIComponent(email['emailAddress']) + "&format=json", function(rsp){
                                col.add(rsp['results']);
                                view.render();
                            });
                        }
                        emailsLoaded.add(email);
                    }
                }
            });
        }

        threadView.addSidebarContentPanel({
            title: "Magni Contacts",
            el: el,
            iconUrl: chrome.extension.getURL('icons/app-13.png')
        });
        view.render();
    });
});
