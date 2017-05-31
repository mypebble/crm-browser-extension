import _ from 'underscore';
import Mn from 'backbone.marionette';
import EntityCollection from 'collections/entity';

const EntityItem = Mn.View.extend({
    template: require('templates/compose_entity.jst'),
    className: 'compose-entity',
    select: function(){
        this.$el.addClass('active');
    },
    deselect: function(){
        this.$el.removeClass('active');
    }
});

const EntityList = Mn.CollectionView.extend({
    childView: EntityItem
});

export default Mn.View.extend({
    template: require('templates/dropdown.jst'),

    regions: {
        'dropdown': '.dropdown-slot'
    },

    ui: {
        'input': 'input'
    },

    triggers: {
        'keyup @ui.input': 'input',
        'change @ui.input': 'input'
    },

    events: {
        'keydown @ui.input': 'key'
    },

    key: function(e){
        if(e.keyCode == 40){ // Down
            if(this.currentItem + 1 < this.collection.length){
                this.currentItem += 1;
            }
            this.refreshDropdown();
            e.preventDefault();
            return false;
        } else if(e.keyCode == 38){ // Up
            if(this.currentItem > 0){
                this.currentItem -= 1;
            }
            this.refreshDropdown();
            e.preventDefault();
            return false;
        } else if(e.keyCode == 13){ // Enter
            this.select();
            e.preventDefault();
            return false;
        }
    },

    onInput: _.debounce(function(){
        this.collection.fetch({
            data: { q: this.ui.input.val() }
        })
    }, 500),

    refreshDropdown: function(){
        if(this.oldItem != -1){
            this.dropdown.children.findByIndex(this.oldItem).deselect();
        }
        if(this.currentItem != -1){
            this.dropdown.children.findByIndex(this.currentItem).select();
        }
        this.oldItem = this.currentItem;
    },

    onRender: function(){
        this.collection = new EntityCollection();
        this.listenTo(this.collection, 'sync', function(){
            this.currentItem = -1;
            this.oldItem = -1;
            this.refreshDropdown();
        });
        this.dropdown = new EntityList({
            collection: this.collection
        });
        this.showChildView('dropdown', this.dropdown);
    }
});
