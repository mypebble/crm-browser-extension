import Mn from 'backbone.marionette';
import Bb from 'backbone';
import $ from 'jquery';

import SideBar from 'views/sidebar';

require("style/main.scss");

function magniLog(msg){
    // Makes Magni's debug output stand out from Gmail
    console.log(`%c>> Magni: ${msg}`, 'background-color: #902C35; color: #FFF');
}

const BaseCollection = Bb.Collection.extend({
    state: 'initial',
    setState(state){
        this.state = state;
        this.trigger('state', state);
    }
})

InboxSDK.load('2', 'sdk_magni_429e6f5389').then(function(sdk){
    function magnijax(url, cb){
        $.get(`{{ crm_location }}${url}`, cb).fail(function(){
            sdk.ButterBar.showError({
                text: "Magni: Failed to fetch information from Magni"
            });
        });
    }

    magniLog('Gmail extension active');

    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: "Clip to Magni",
        iconUrl: chrome.extension.getURL('icons/dog.svg'),
        section: 'METADATA_STATE',
        onClick: function(event){
            let threadView = event.threadView;
            magniLog('Clip button activated');
            magniLog('Thread id: ' + threadView.getThreadID());

            // Open up CRM clipper box
            let url = `{{ crm_location }}/integrations/gmail/add_thread/${threadView.getThreadID()}/`;

            let w = 600;
            let h = 400;
            let screen = window.screen;
            let left = (screen.width) ? (screen.width-w) / 2 : 100;
            let top = (screen.height) ? (screen.height-h) / 2 : 100;
            window.open(url, "share",
             `width=${w},height=${h},left=${left},top=${top},scrollbars=yes`);
        }
    });

    sdk.Conversations.registerThreadViewHandler(function(threadView){
        let messagesLeftToLoad = threadView.getMessageViewsAll().length;
        let el = document.createElement("div");
        let col = new BaseCollection();

        let view = new SideBar({
            el: el,
            collection: col
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
                        magnijax("/entity/?email=" + encodeURIComponent(email['emailAddress']) + "&format=json", function(rsp){
                            col.add(rsp['results']);
                            view.render();
                        });
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
        console.log(view);
    });
});
