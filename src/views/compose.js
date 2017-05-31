import Mn from 'backbone.marionette';
import {blacklist, BaseCollection, EmptyView} from 'utils';
import $ from 'jquery';

import DropdownView from 'views/dropdown';

const EntityView = Mn.View.extend({
    template: require('templates/compose_entity.jst'),
    triggers: {
        'click': 'add'
    },
    className: 'compose-entity',
    onRender: function(){
        if(this.model.get('active')){
            this.$el.addClass('active');
        } else{
            this.$el.removeClass('active');
        }
    },
    onAdd: function(){
        this.model.set('active', !this.model.get('active'));
        this.render();
    }
});

const EntityListView = Mn.CollectionView.extend({
    childView: EntityView,
    emptyView: EmptyView,
    onChildviewAdd: function(child){
        this.trigger('add', child.model);
    }
})

export default Mn.View.extend({
    template: require('templates/compose.jst'),
    regions: {
        'organisations': '.organisations-slot',
        'dropdown': '.dropdown-slot'
    },

    updateBCC: function(){
        let bcc = this.collection.where(function(model){
            return model.get('active');
        }).map(function(model){
            return 'magni+' + model.get('id') + '@talktopebble.co.uk'
        });
        this.composeView.setBccRecipients(bcc);
    },

    onRender: function(){
        this.composeView = this.getOption('composeView');

        let parent = this.$el;
        if(parent.is(".inboxsdk__compose_statusbar")){
            parent.addClass('magni-status-view').css(
                'background-image', `url('${chrome.extension.getURL("icons/dog-faded.svg")}')`)
        }

        const dropdown = new DropdownView();
        this.showChildView('dropdown', dropdown);
        this.listenTo(dropdown, 'select', function(model){
            model.set('active', true);
            this.collection.push(model);
            this.updateBCC();
        });

        this.collection = new BaseCollection();
        const entityListView = new EntityListView({
            collection: this.collection
        });
        this.showChildView('organisations', entityListView);
        this.listenTo(entityListView, 'add', function(model){
            this.updateBCC();
        });

        if(this.composeView.isInlineReplyForm() && document.location.hostname == "inbox.google.com"){
            return;
        }

        this.composeView.on('toContactAdded', () => {
            this.refreshCollection();
        })
        this.composeView.on('toContactRemoved', () => {
            this.refreshCollection();
        })
        this.refreshCollection();
    },

    refreshCollection: function(){
        let emails = this.composeView.getToRecipients();
        this.collection.reset();
        for(let email of emails){
            $.get(
                "{{ crm_location }}/entity/?format=json&email=" + encodeURIComponent(email['emailAddress']),
                (data) => {
                    this.collection.add(data['results']);
                });
        }
    }
});
