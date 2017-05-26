import Mn from 'backbone.marionette';
import {EmptyView} from 'utils';

const EntityView = Mn.View.extend({
    template: require('templates/entity_item.jst')
});

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
