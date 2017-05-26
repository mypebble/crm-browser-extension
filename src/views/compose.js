import Mn from 'backbone.marionette';
import {blacklist, BaseCollection, EmptyView} from 'utils';
import $ from 'jquery';

const EntityView = Mn.View.extend({
    template: require('templates/compose_entity.jst')
});

const EntityListView = Mn.CollectionView.extend({
    childView: EntityView,
    emptyView: EmptyView
})

export default Mn.View.extend({
    template: require('templates/compose.jst'),
    regions: {
        'organisations': '.organisations-slot'
    },

    onRender: function(){
        this.collection = new BaseCollection();
        this.showChildView('organisations', new EntityListView({
            collection: this.collection
        }));

        this.composeView = this.getOption('composeView');

        console.log(this.composeView.isInlineReplyForm());
        if(this.composeView.isInlineReplyForm() && document.location.hostname == "inbox.google.com"){
            return; // TODO: Handle this better
        }

        this.listenTo(this.composeView, 'toContactAdded', this.refreshCollection);
        this.listenTo(this.composeView, 'toContactRemoved', this.refreshCollection);
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
