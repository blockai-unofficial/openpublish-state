var request = require('request');

var OpenpublishState = function(baseOptions) {

  var network = baseOptions.network;
  var baseUrl = baseOptions.baseUrl || network == "testnet" ? "http://testnet.d.blockai.com" : "http://livenet.d.blockai.com";

  var processOpenpublishDoc = function(doc) {
    doc.txid = doc.txid || doc.txout_tx_hash;
    return doc;
  };

  var findTips = function(options, callback) {
    var sha1 = options.sha1;
    request(baseUrl + "/opendocs/sha1/" + sha1 + "/tips", function(err, res, body) {
      var tips = JSON.parse(body);
      var totalTipAmount = 0;
      var tipCount = tips.length;
      tips.forEach(function(tip) {
        totalTipAmount += tip.amount;
      });
      var tipInfo = {
        tips: tips,
        totalTipAmount: totalTipAmount,
        tipCount: tipCount
      };
      callback(err, tipInfo)
    });
  };

  var findDoc = function(options, callback) {
    var sha1 = options.sha1;
    request(baseUrl + "/opendocs/sha1/" + sha1, function(err, res, body) {
      var openpublishDoc = JSON.parse(body)[0];
      if (!openpublishDoc) {
        return callback(true, false);
      }
      processOpenpublishDoc(openpublishDoc);
      if (options.includeTips) {
        findTips({sha1:sha1}, function(err, tipInfo) {
          openpublishDoc.totalTipAmount = tipInfo.totalTipAmount;
          openpublishDoc.tipCount = tipInfo.tipCount;
          openpublishDoc.tips = tipInfo.tips;
          callback(err, openpublishDoc);
        });
      }
      else {
        callback(err, openpublishDoc);
      }
    });
  };

  var findAllByType = function(options, callback) {
    var type = options.type;
    var limit = options.limit || 20;
    request(baseUrl + "/opendocs?limit=" + limit + "&type=" + type, function(err, res, body) {
      var openpublishDocuments = JSON.parse(body);
      openpublishDocuments.forEach(processOpenpublishDoc);
      callback(err, openpublishDocuments);
    });
  };

  var findAll = function(options, callback) {
    var limit = options.limit || 20;
    request(baseUrl + "/opendocs?limit=" + limit, function(err, res, body) {
      var openpublishDocuments = JSON.parse(body);
      openpublishDocuments.forEach(processOpenpublishDoc);
      callback(err, openpublishDocuments);
    });
  };

  return {
    findDoc: findDoc,
    findTips: findTips,
    findAll: findAll,
    findAllByType: findAllByType
  }

};

module.exports = OpenpublishState;