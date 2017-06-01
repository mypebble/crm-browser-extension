import Bb from 'backbone';

export default Bb.Collection.extend({
    url: function(){
        return `{{ crm_location }}/entity/?search=${this.search}`;
    },
    parse: function(r){
        return r['results'];
    },
    fetch: function(){
        if(this.isFetching) return;
        else{
            this.isFetching = true;
            return Bb.Collection.prototype.fetch.call(this, arguments).always(() => {
                this.isFetching = false;
            });
        }
    },
    initialize: function(){
        this.isFetching = false;
    }
});
