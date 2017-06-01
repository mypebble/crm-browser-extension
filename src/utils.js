import Mn from 'backbone.marionette';
import Bb from 'backbone';

export let blacklist = [
    'talktopebble.co.uk',
    'google.com',
    'mypebble.co.uk'
]

export const BaseCollection = Bb.Collection.extend({
    state: 'initial',
    setState(state){
        this.state = state;
        this.trigger('state', state);
    }
});

export const EmptyView = Mn.View.extend({
    template: require('templates/empty.jst'),
    templateContext: function(){
        return {
            'state': this.getOption('state')
        };
    }
})

/**
 * Returns true if the email is blacklisted
 * @param {string} email 
 */
export function blacklisted(email){
    let bin = false;
    for(let domain of blacklist){
        if(email['emailAddress'].indexOf(domain) > 0){
            bin = true;
            break;
        }
    }
    return bin;
}
