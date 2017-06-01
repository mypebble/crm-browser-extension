function parseQuery(qstr) {
    var query = {};
    var a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
}

let qs = parseQuery(document.location.search.substr(1));
let credentials = {{ credentials }};

$.post("{{ crm_location }}/oauth/token/", {
    'client_id': credentials['client_id'],
    'client_secret': credentials['client_secret'],
    'code': qs['code'],
    'grant_type': 'authorization_code',
    'scope': 'read write',
    'redirect_uri': chrome.extension.getURL('assets/auth_finish.html')
}, function(rsp){
    let d = new Date();
    d.setSeconds(d.getSeconds() + rsp['expires_in']);
    rsp['expires'] = d.getTime();
    chrome.storage.local.set({'authToken': rsp}, function(){
        window.close();
    });
});
