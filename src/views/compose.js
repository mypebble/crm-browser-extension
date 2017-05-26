import Mn from 'backbone.marionette';
import {blacklist, BaseCollection, EmptyView} from 'utils';
import $ from 'jquery';

const EntityView = Mn.View.extend({
    template: require('templates/compose_entity.jst'),
    ui: {
        'addButton': '.btn-add'
    },
    triggers: {
        'click @ui.addButton': 'add'
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
        'organisations': '.organisations-slot'
    },

    onRender: function(){
        this.composeView = this.getOption('composeView');

        this.collection = new BaseCollection();
        const entityListView = new EntityListView({
            collection: this.collection
        });
        this.showChildView('organisations', entityListView);
        this.listenTo(entityListView, 'add', function(model){
            // TODO: Make this work properly
            this.composeView.setBccRecipients(['magni+' + model.get('id') + '@talktopebble.co.uk']);
        });

        console.log(this.composeView.isInlineReplyForm());
        if(this.composeView.isInlineReplyForm() && document.location.hostname == "inbox.google.com"){
            return; // TODO: Handle this better
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
