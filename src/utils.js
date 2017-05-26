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
