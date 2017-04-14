Mast.routes['log/:page'] = function (query, page) {
    $("#content").empty();
    Mast.Session.page = Mast.history.getFragment(query, page);
    var logPage = new Mast.components.LogPage();
};
Mast.routes['transaction/:page'] = function (query, page) {
    $("#content").empty();
    Mast.Session.page = Mast.history.getFragment(query, page);
    var TransactionPage = new Mast.components.TransactionPage();
};




