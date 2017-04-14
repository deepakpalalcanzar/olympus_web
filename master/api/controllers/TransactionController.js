var UUIDGenerator = require('node-uuid');
var cacheRoute = require('booty-cache');
var request = require('request');
var pagination = require('pagination');


var TransactionController = {
    transactionlist: function (req, res) {

        if (req.session.Account.isSuperAdmin === 1) {

            var sql = "SELECT tran . * , DATE_FORMAT( tran.createdAt,  '%b %d %Y %h:%i %p' ) " +
                    " AS created_at, a.id AS user_id, a.name AS name, a.email AS email, a.title AS title, a.phone AS phone, e.name AS ent_name, e.id AS ent_id " +
                    "FROM transactiondetails tran LEFT JOIN account a ON a.id = tran.account_id " +
                    "LEFT JOIN enterprises e ON a.id = e.account_id " +
                    "ORDER BY id DESC";
            sql = Sequelize.Utils.format([sql]);
        }

        sequelize.query(sql, null, {
            raw: true
        }).success(function (log) {

            /*Looking for data if not found return appropriate*/
            if (log.length) {

                var totalpage = (log.length / 50) + 1;
                var range = ((req.param('id') * 50) - 50) + "," + 50;

                var boostrapPaginator = new pagination.TemplatePaginator({
                    prelink: '/', current: req.param('id'), rowsPerPage: 1,
                    totalResult: log.length, slashSeparator: false,
                    template: function (result) {
                        var i, len, prelink;
                        var html = "<div>";
                        if (result.pageCount < 2) {
                            html += "</div>";
                            return html;
                        }
                        prelink = this.preparePreLink(result.prelink);
                        if (result.previous) {
                            html += "<a href='#transaction/" + result.previous + "'>" + this.options.translator("PREVIOUS") + "</a> &nbsp; | &nbsp; ";
                        }
                        if (result.range.length) {
                            for (i = 0, len = result.range.length; i < len; i++) {
                                if (totalpage > result.range[i]) {
                                    if (result.range[i] === result.current) {
                                        html += "<a href='#transaction/" + result.range[i] + "'>" + result.range[i] + "</a> &nbsp; | &nbsp;";
                                    } else {
                                        html += "<a href='#transaction/" + result.range[i] + "'>" + result.range[i] + "</a> &nbsp; | &nbsp;";
                                    }
                                }
                            }
                        }
                        if (result.next) {
                            if (totalpage > result.next) {
                                html += "<a href='#transaction/" + result.next + "' class='paginator-next'>" + this.options.translator("NEXT") + "</a> &nbsp; ";
                            }
                        }
                        html += "</div>";
                        return html;
                    }
                });
                var Paginator = boostrapPaginator.render();
                if (req.session.Account.isSuperAdmin === 1) {
                    var sql = "SELECT tran . * , DATE_FORMAT( tran.createdAt,  '%b %d %Y %h:%i %p' ) " +
                            " AS created_at, a.id AS user_id, a.name AS name, a.email AS email, a.title AS title, a.phone AS phone, e.name AS ent_name, " +
                            "e.id AS ent_id, " + '"' + Paginator + '" ' + " as Paginator FROM transactiondetails tran LEFT JOIN account a ON a.id = tran.account_id " +
                            "LEFT JOIN enterprises e ON a.id = e.account_id " +
                            "ORDER BY id DESC LIMIT " + range + " ";

                    sql = Sequelize.Utils.format([sql]);
                }
                sequelize.query(sql, null, {
                    raw: true
                }).success(function (logdata) {
                    if (logdata.length) {

                        res.json(logdata, 200);
                    }
                });
            } else {
                res.json({
                    text_message: 'error_123',
                    notFound: true,
                });
            }
        }
        ).error(function (e) {
            throw new Error(e);
        });

    },
};
_.extend(exports, TransactionController);