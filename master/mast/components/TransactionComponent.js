Mast.registerTree('TransactionTable', {
    extendsFrom: 'UITableComponent',
    model: {
        column1: {
            name: 'User Name',
            className: 'transaction-user-column'
        },
        column2: {
            name: 'Plan Name',
            className: 'transaction-activity-column'
        },
        column3: {
            name: 'Price',
            className: 'transaction-clientip-column'
        },
        column4: {
            name: 'Users Limit',
            className: 'transaction-userslimit-column'
        },
        column5: {
            name: 'Date',
            className: 'transaction-date-column'
        },
     
        selectedModel: null,
    },
    template: '.transaction-template',
    events: {
        'click .search-details': 'searchdata',
    },
  
    init: function () {
 
        $('.upload-file').hide();
        this.collection.fetch();
        Mast.Socket.request('/transaction/transactionlist/'+window.location.hash.split( '/' )['1'], null, function (res, err) {
            if (res) {
                var options = "";
                $.each(res, function (i, val) {
                    options = val.Paginator;
                });
                $('#list_pagignation').html(options);
            }
        });
        
    },
    
      // branch properties
    emptyHTML: '<div class="loading-spinner"></div>',
    branchComponent: 'TransactionRow',
    branchOutlet: '.transaction-outlet',
    
    collection: {
        initialize: function(options) {
            console.log(Mast.Session.page);
              this.url = '/transaction/transactionlist/'+Mast.Session.page;
          
        },
        autoFetch: false,
        model: Mast.Model.extend({
            defaults: {
                highlighted: false,
                name: "-",
                text_message: "-",
                plan_name: "-",
                price: "-",
                users_limit: "-",
                created_at: "Default"
            },
            selectedModel: this
        })
    },
    
 
});

// log row component
Mast.registerComponent('TransactionRow', {
    template: '.transaction-row-template',
    events: {
        'click .transaction-user-column': 'transactionUserDetails'
    },
    transactionUserDetails: function () {
        this.model.attributes.id = this.model.attributes.user_id;
        Mast.Session.User = this.model.attributes;
        Mast.navigate('#user/details');
    },
});
