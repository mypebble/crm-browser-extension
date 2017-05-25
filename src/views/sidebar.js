import Mn from 'backbone.marionette';

const EntityView = Mn.View.extend({
    template: require('templates/entity_item.jst'),
    templateContext: function(){
        return {
            'state': this.getOption('state')
        };
    }
});

const EmptyView = Mn.View.extend({
    template: require('templates/empty.jst')
})

const EntityListView = Mn.CollectionView.extend({
    childView: EntityView,
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
            collection: this.getOption('collection')
        }));
    }
});
