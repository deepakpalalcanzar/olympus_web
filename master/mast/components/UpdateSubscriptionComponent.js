Mast.registerComponent('UpdateSubscriptionComponent', {

    template  : '.update-subscription-template',
    outlet    : '#content',

    model: {
        is_default  : '0',
        features    : 'Enter plan name',
        price       : 'Enter plan price',
        quota       : 'Enter quota',
        duration    : 'Enter duration of plan',
        users_limit : 'Enter duration of plan',
        workgroup_limit : 'Enter duration of plan',
        duration        : 'Enter duration of plan',
    },

    events: {
        'change #unlimited-user'    : 'checkUnlimitedUsers',
        'click .plan-update-button' : 'updateSubscription',
        'change #unlimited-space'   : 'checkUnlimitedSpace',
        'change #is_free'           : 'isFree',
    },

    init: function() {
        if(typeof Mast.Session == 'undefined'){
            Mast.navigate("/#subscription");
        }
        this.set(Mast.Session.subscription);
    },

//Set the value of Form
    afterRender : function(){

        var planData =  Mast.Session.subscription;
        $('#duration').val(planData.duration);

    //If plan have unlimited number of users
        if(planData.users_limit === 'Unlimited'){
            $('#unlimited-user').prop('checked', true);
            $('input[name="users_limit"]').prop('disabled', true);
        }

    //If plan have unlimited workgroups of users
        if(planData.price === '0'){
            $('#is_free').prop('checked', true);
            $('input[name="price"]').prop('disabled', true);
        }

    //If plan have unlimited workgroups of users
        if(planData.quota === 'Unlimited'){
            $('#unlimited-space').prop('checked', true);
            $('input[name="quota"]').prop('disabled', true);
        }

    //If plan is marked as default
        if(planData.is_default === 1){
            $('input[name="is_default"]').prop('checked', true);
        }

    },

    updateSubscription:function(){

        var self = this;
        var planData =  Mast.Session.subscription;
        var subscriptionData = this.getFormData();
        if(self.validateForm()){
            Mast.Socket.request('/subscription/updateSubscription', subscriptionData, function(res, err){
                alert('Subscription has been updated.');
                Mast.navigate('#subscription');
            });
        }
    },

    getFormData:function(){
        var planData =  Mast.Session.subscription;
        var features, price, users_limit, duration, quota;
        return {
            id              : planData.id,
            features        : this.$('input[name="features"]').val(),
            price           : $('input[name="is_free"]').is(':checked') === true ? '0' : this.$('input[name="price"]').val(),
            users_limit     : $('input[name=unlimited_user]').is(':checked') === true ? 'Unlimited' : this.$('input[name="users_limit"]').val(),
            duration        : this.$('select[name="duration"]').val(),
            quota           : $('input[name="unlimited_space"]').is(':checked') === true ? '1000' : this.$('input[name="quota"]').val(),
            upd_existing    : $('input[name=upd_existing]').is(':checked') === true ? 1 : 0,
            is_default      : $('input[name=is_default]').is(':checked') === true ? 1 : 0   
        };
    },

    validateForm: function(){
        if (this.$('input[name="features"]').val() === '') {
            alert('Please enter features !');
            return false;
        }else{
            return true;
        }
    },

    checkUnlimitedUsers: function(){
        if(this.$('input[name="unlimited_user"]').is(':checked')){
            $('input[name="unlimited_user"]').prop('checked', true);
            $('input[name="users_limit"]').attr('disabled', true);
        }else{
            $('input[name="unlimited_user"]').prop('checked', false);
            $('input[name="users_limit"]').attr('disabled', false);
            $('input[name="users_limit"]').val('');
        }
    },


    checkUnlimitedSpace: function(){
        if(this.$('input[name="unlimited_space"]').is(':checked')){
            $('input[name="unlimited_space"]').prop('checked',true);
            $('input[name="quota"]').attr('disabled', true);
        }else{
            $('input[name="unlimited_space"]').prop('checked',false);
            $('input[name="quota"]').attr('disabled', false);
            $('input[name="quota"]').val('');
        }
    },

    isFree: function(){

        if(this.$('input[name="is_free"]').is(':checked')){
            $('input[name="is_free"]').prop('checked',true);
            $('input[name="price"]').attr('disabled', true);
        }else{
            $('input[name="is_free"]').prop('checked',false);
            $('input[name="price"]').attr('disabled', false);
            $('input[name="price"]').val('');
        }
    },
});
