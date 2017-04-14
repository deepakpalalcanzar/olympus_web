Mast.registerComponent('TransactionPage', {
    template: '.transaction-page-template',
    outlet: '#content',
    regions: {
        '.transaction-table-region': 'TransactionTable'
    },
    init: function () {
        console.log(window.location);
    },
});