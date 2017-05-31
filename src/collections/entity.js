import Bb from 'backbone';

export default Bb.Collection.extend({
    url: '{{ crm_location }}/entity/',
    parse: function(r){
        return r['results'];
    }
});
