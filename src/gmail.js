import Mn from 'backbone.marionette';
import Bb from 'backbone';
import Radio from 'backbone.radio';
import $ from 'jquery';

import SideBar from 'views/sidebar';
import ComposeView from 'views/compose';
import {blacklisted, BaseCollection, } from 'utils';
import AuthService from 'auth';

const SidebarChannel = Radio.channel('sidebar');

require("style/main.scss");

function magniLog(msg){
    // Makes Magni's debug output stand out from Gmail
    console.log(`%c>> Magni: ${msg}`, 'background-color: #902C35; color: #FFF');
}

function getEmails(threadView){
    let emails = new Set();
    for(let message of threadView.getMessageViewsAll()){
        if(!message.isLoaded()) continue;
        if(!blacklisted(message.getSender())){
            emails.add(message.getSender());
        }
        for(let email of message.getRecipients()){
            if(!blacklisted(email)){
                emails.add(email);
            }
        }
    }
    return emails;
}

function updateEntity(e_id, data, cb){
    AuthService.requireAuth(function(){
        AuthService.ajax({
            url: `{{ crm_location }}/entity/${ed_id}/?format=json`,
            method: 'PUT',
            data: data,
            success: function(rsp){
                cb(new Bb.Model(rsp));
            }
        });
    });
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
                if(composeView.isInlineReplyForm() && document.location.hostname == "inbox.google.com"){
                    composeView.popOut();
                    sdk.ButterBar.showError({
                        text: "Click the Magni button again (blame Google Inbox)"
                    })
                    console.log('>> Magni: Popout Compose View');
                    return;
                }
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
                        if(!blacklisted(email)){
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

        SidebarChannel.reset(); // Remove old handler
        // Create a new entity based on the few details we have
        SidebarChannel.on('addNewEntity', function(){
            magniLog('Add New Entity');
            let emails = getEmails(threadView);
            let el = $("<div>").html(require('templates/create_new_entity.jst')({
                emails: emails.values()
            }));
            sdk.Widgets.showModalView({
                el: el.get(0),
                title: 'Create New Entity',
                buttons: [
                    {
                        text: 'Create',
                        title: 'Create new Entity',
                        onClick: function(e){
                            e.modalView.close();
                            let data = {
                                'what': $('input[name=what]:checked', el).val(),
                                'name': $('.name-field', el).val(),
                                'data': {
                                    'email': $('input[name=attachToEmail]:checked', el).val()
                                }
                            }
                            AuthService.requireAuth(function(){
                                AuthService.ajax({
                                    url: `{{ crm_location }}/entity/?format=json`,
                                    method: 'POST',
                                    data: JSON.stringify(data),
                                    contentType: 'application/json',
                                    processData: false,
                                    success: function(rsp){
                                        sdk.ButterBar.showError({
                                            text: "Entity Created"
                                        });
                                        col.add(new Bb.Model(rsp));
                                    }
                                });
                            });
                        },
                        type: 'PRIMARY_ACTION'
                    },
                    {
                        text: 'Cancel',
                        title: 'Cancel this operation',
                        onClick: function(e){
                            e.modalView.close();
                        }
                    }
                ]
            });
            $("div:first-child input", el).click();
        });

        // Attach to entity listener (using gmail code)
        SidebarChannel.on('attachToEntity', function(model){
            magniLog('Attach to Entity');
            let emails = getEmails(threadView);
            let el = $("<div>").html(require('templates/attach_to_entity.jst')({
                emails: emails.values(),
                name: model.get('name')
            }));
            sdk.Widgets.showModalView({   
                el: el.get(0),
                title: 'Attach to Entity',
                buttons: [
                    {
                        text: 'Attach',
                        title: 'Attach this entity to the selected email address',
                        onClick: function(e){
                            e.modalView.close();
                            updateEntity(model.get('id'), {
                                'email': $('input:checked', el).val()
                            }, function(model){
                                col.add(model);
                                sdk.ButterBar.showError({
                                    text: "Attached to entity"
                                });
                            });
                        },
                        type: 'PRIMARY_ACTION'
                    },
                    {
                        text: 'Cancel',
                        title: 'Cancel this operation',
                        onClick: function(e){
                            e.modalView.close();
                        }
                    }
                ]
            });
            $("input", el).get(0).click();
        });

        threadView.addSidebarContentPanel({
            title: "Magni Contacts",
            el: el,
            iconUrl: chrome.extension.getURL('icons/app-13.png')
        });
        view.render();
    });
});
