import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

import {EmptyView} from 'utils';
import DropdownView from 'views/dropdown';

const SidebarChannel = Radio.channel('sidebar');

const EntityView = Mn.View.extend({
    template: require('templates/entity_item.jst')
});

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
        'list': '.list-slot',
        'dropdown': '.dropdown-slot'
    },

    ui: {
        'addNewEntity': '.btn-add-new-entity'
    },

    triggers: {
        'click @ui.addNewEntity': 'addNewEntity'
    },

    onAddNewEntity: function(){
        SidebarChannel.trigger('addNewEntity');
    },

    onRender: function(){
        this.showChildView('list', new EntityListView({
            collection: this.getOption('collection'),
        }));

        let dropdown = new DropdownView();
        this.showChildView('dropdown', dropdown);
        this.listenTo(dropdown, 'select', function(model){
            SidebarChannel.trigger('attachToEntity', model);
        });
    }
});
