Mast.registerTree('ListUsersTable', {
    extendsFrom: 'UITableComponent',
    model: {
        column1: {
            name: 'Users',
            className: 'list-user-name'
        },
        column2: {
            name: 'Enterprise',
            className: 'list-enterprise-name'
        },
        column3: {
            name: 'Subscription',
            className: 'list-subscription-name'
        },
        column4: {
            name: 'Impersonate',
            className: 'list-impersonate-name'
        },
        selectedModel: null
    },
    template: '.listusers-template',
// branch properties
    emptyHTML: '<div class="loading-spinner"></div>',
    branchComponent: 'ListUsersRow',
    branchOutlet: '.listusers-outlet',
    collection: {
        
         initialize: function(options) {
            console.log(Mast.Session.page);
              this.url = '/account/listUsers/'+Mast.Session.page;
          
        },
        
        model: Mast.Model.extend({
            defaults: {
                highlighted: false,
                name: 'Afzal',
                avatar_image: '/images/38.png',
            },
            selectedModel: null
        })

    },
    init: function (collection) {
        $('.searchbar').show();
        $('.upload-file').hide();
        this.collection.fetch();
        Mast.Socket.request('/account/listUsers/' + window.location.hash.split('/')['1'], null, function (res, err) {
            if (res) {
                var options = "";
                $.each(res, function (i, val) {
                    options = val.Paginator;
                });
                $('#list_pagignation').html(options);
            }
        });


    },
    afterRender: function () {
        console.log(this);
        console.log(this.model);
    },
    bindings: {
// set highlight to false except for newly selected user
        selectedModel: function (newModel) {
            this.collection.invoke('set', 'highlighted', false);
            newModel.set({highlighted: true});
        }
    },
    loading: function (newModel) {
        if (newVal) {
            $('.subscription-template .loading-spinner').show();
        } else {
            $('.subscription-template .loading-spinner').hide();
        }
    },
});


// user row component
Mast.registerComponent('ListUsersRow', {
    template: '.listusers-row-template',
    bindings: {
        highlighted: function (newVal) {
            if (newVal) {
                this.addHighlight();
            } else {
                this.removeHighlight();
            }
        }
    },
    events: {
        'click .list-user-name': 'listUserDetails',
        'click .btn-table-listing': 'impersonateUser',
    },
// Selects the user that was clicked on. gives the parent the current users model
    selectUser: function () {
        console.log(this.model);
        this.parent.set({selectedModel: this.model});
    },
// Add highlight to the User row
    addHighlight: function () {
        this.$el.addClass('highlighted');
    },
// Remove highlight from the User row
    removeHighlight: function () {
        this.$el.removeClass('highlighted');
    },
    listUserDetails: function () {
        Mast.Session.User = this.model.attributes;
        Mast.navigate('#user/details');
    },
    impersonateUser: function () {
        console.log(this.model);
        var options = {
            email: this.model.attributes.email,
        }

        Mast.Socket.request('/enterprises/impersonate', options, function (req, err) {
            if (req == 200) {
                /*var getUrl = window.location;
                var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
                console.log(baseUrl);//https://dev2.olympus.io/*/
                // console.log(Mast.Socket.baseurl);//https://dev2.olympus.io
                window.open(Mast.Socket.baseurl, '_blank');
                // window.open('https://dev1.olympus.io/', '_blank');
                window.focus();
            }
        });
        return;
    },
});




