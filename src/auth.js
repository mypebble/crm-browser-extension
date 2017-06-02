import $ from 'jquery';

$.ajaxSetup({
    beforeSend: function(xhr){
        if(global['authToken']){
            xhr.setRequestHeader('Authorization', `Bearer ${global['authToken']['access_token']}`);
        }
    }
})

export default {
    requireAuth: function(cb){
        chrome.storage.local.get('authToken', (store) => {
            if(!store['authToken']){
                // Open up CRM clipper box
                let redir = encodeURIComponent(chrome.extension.getURL('assets/auth_finish.html'));
                let url = `{{ crm_location }}/oauth/authorize/?client_id=${this.creds['client_id']}&redirect_uri=${redir}&response_type=code&scope=read write`;

                let w = 600;
                let h = 400;
                let screen = window.screen;
                let left = (screen.width) ? (screen.width-w) / 2 : 100;
                let top = (screen.height) ? (screen.height-h) / 2 : 100;
                let ref = window.open(url, "share",
                    `width=${w},height=${h},left=${left},top=${top},scrollbars=yes`);
                let int = setInterval(() => {
                    chrome.storage.local.get('authToken', function(store){
                        if(store['authToken']){
                            cb();
                            clearInterval(int);
                        }
                    });
                }, 1000);
            } else{
                cb();
            }
        });
    },
    ajax: function(){
        let args = arguments;
        chrome.storage.local.get('authToken', (store) => {
            let authToken = store['authToken'];
            global.authToken = authToken;
            if(new Date().getTime() > authToken['expires']){
                $.post('{{ crm_location }}/oauth/token/', {
                    'grant_type': 'refresh_token',
                    'scope': 'read write',
                    'client_id': this.creds.client_id,
                    'client_secret': this.creds.client_secret,
                    'refresh_token': authToken['refresh_token']
                }, function(rsp){
                    let d = new Date();
                    d.setSeconds(d.getSeconds() + rsp['expires_in']);
                    rsp['expires'] = d.getTime();
                    global.authToken = rsp;
                    chrome.storage.local.set({'authToken': rsp}, function(){
                        $.ajax.apply($, args);
                    });
                });
            } else{
                return $.ajax.apply($, args);
            }
        });
    },
    creds: { credentials }
}
