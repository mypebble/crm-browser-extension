import Mn from 'backbone.marionette';

const EntityView = Mn.View.extend({
    template: require('templates/entity_item.jst'),
    ui: {
        'clipButton': '.btn-clip'
    },
    triggers: {
        'click @ui.clipButton': 'clip'
    },
    onClip: function(){
        // Open up CRM clipper box
        let url = `{{ crm_location }}/integrations/gmail/add_thread/${this.model.get('id')}/${this.getOption('threadID')}/`;

        let w = 600;
        let h = 400;
        let screen = window.screen;
        let left = (screen.width) ? (screen.width-w) / 2 : 100;
        let top = (screen.height) ? (screen.height-h) / 2 : 100;
        window.open(url, "share",
            `width=${w},height=${h},left=${left},top=${top},scrollbars=yes`);
    },
    templateContext: function(){
        return {
            dog: chrome.extension.getURL('icons/dog.svg')
        }
    }
});

const EmptyView = Mn.View.extend({
    template: require('templates/empty.jst'),
    templateContext: function(){
        return {
            'state': this.getOption('state')
        };
    }
})

const EntityListView = Mn.CollectionView.extend({
    childView: EntityView,
    childViewOptions: function(){
        return {
            threadID: this.getOption('threadID')
        }
    },
    emptyView: EmptyView,
    emptyViewOptions: function(){
        return {
            'state': this.collection.state
        }
    },
    collectionEvents: {
        'state': 'render'
    }
});

export default Mn.View.extend({
    template: require('templates/sidebar.jst'),
    regions: {
        'list': '.list-slot'
    },
    onRender: function(){
        this.showChildView('list', new EntityListView({
            collection: this.getOption('collection'),
            threadID: this.getOption('threadID')
        }));
    }
});
