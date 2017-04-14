/*---------------------
  :: TransactionDetails
  -> controller
---------------------*/

var destroy = require('../services/lib/account/destroy'),
    crypto = require('crypto'),
    emailService = require('../services/email');

var TransactionDetailsController = {

  register: function (req, res) {
        TransactionDetails.findOne({
                account_id : req.body.account_id,
                is_deleted : 0
            }).then(function (transaction){
                transaction.is_deleted = 1;
                transaction.save(function (err) {
                  if (err) return res.json({
                     error: err.message,
                     type: 'error'
                   });
                   // return res.json(transaction, 200);
                });
            });

        TransactionDetails.createAccount(req.body, function(err, trans) {
            if (err) return res.json({error: 'Error creating transaction history',type: 'error'});
            return  res.json({
                  transaction: {
                    id              : trans.id,
                    plan_name       : trans.plan_name,
                    duration        : trans.duration,
                    transaction_id  : trans.transaction_id,
                    created_date    : trans.created_date,
                    price           : trans.price,
                    paypal_status   : trans.paypal_status,
                  }
              });
        });
    },

};

module.exports = TransactionDetailsController;
