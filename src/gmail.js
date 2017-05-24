import Mn from 'backbone.marionette';
import Bb from 'backbone';
import $ from 'jquery';
require("style/main.scss");

function magniLog(msg){
    // Makes Magni's debug output stand out from Gmail
    console.log(`%c>> Magni: ${msg}`, 'background-color: #902C35; color: #FFF');
}

function magnijax(url, cb){
    $.get(`{{ crm_location }}${url}`, cb);
}

const EntityView = Mn.View.extend({
    template: require('templates/entity_item.jst')
});

const EntityListView = Mn.CollectionView.extend({
    childView: EntityView
});


InboxSDK.load('2', 'sdk_magni_429e6f5389').then(function(sdk){
    magniLog('Gmail extension active');
    sdk.Conversations.registerThreadViewHandler(function(threadView){
        let messagesLeftToLoad = threadView.getMessageViewsAll().length;
        let el = document.createElement("div");
        let col = new Backbone.Collection();

        let view = new EntityListView({
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
                            console.log(rsp, col);
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
