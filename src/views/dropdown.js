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
    },
    triggers: {
        'click': 'select'
    }
});

const EntityList = Mn.CollectionView.extend({
    childView: EntityItem,
    onChildviewSelect: function(child){
        this.trigger(child.model)
    }
});

export default Mn.View.extend({
    template: require('templates/dropdown.jst'),

    regions: {
        'dropdown': '.dropdown-slot'
    },

    ui: {
        'input': 'input',
        'dropdown': '.dropdown-slot'
    },

    triggers: {
        'keyup @ui.input': 'input',
        'change @ui.input': 'input',
        'blur @ui.input': 'hide',
        'focus @ui.input': 'show'
    },

    onHide: _.delay(function(){
        this.ui.dropdown.hide();
    }, 100),

    onShow: function(){
        this.ui.dropdown.show();
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

    select: function(){
        this.trigger('select', this.collection.at(this.currentItem));
        this.collection.reset();
        this.ui.input.val('');
    },

    onInput: _.debounce(function(){
        if(this.ui.input.val() == ""){
            this.collection.reset();
            return;
        }
        this.collection.search = this.ui.input.val();
        this.collection.fetch();
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
        this.listenTo(this.dropdown, 'select', function(model){
            this.trigger('select', model)
        });
        this.showChildView('dropdown', this.dropdown);
    }
});
