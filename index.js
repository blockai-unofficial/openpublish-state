var request = require('request');

var OpenpublishState = function(baseOptions) {

  var network = baseOptions.network;
  var baseUrl = baseOptions.baseUrl || network == "testnet" ? "https://bsync-test.blockai.com" : "https://bsync.blockai.com";
  var coinvoteBaseUrl = (network === "testnet") ? "http://coinvote-testnet.herokuapp.com" : "http://coinvote.herokuapp.com";

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

  var findAllTips = function(options, callback) {
    request(baseUrl + "/opentips", function(err, resp, body) {
      var opentips = JSON.parse(body);
      callback(false, opentips)
    });
  }

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
      try {
        var openpublishDocuments = JSON.parse(body);
        openpublishDocuments.forEach(processOpenpublishDoc);
        callback(err, openpublishDocuments);
      }
      catch (e) {
        callback(true, []);
      }
    });
  };

  var findAssetsByUser = function(options, callback) {
    var address = options.address;
    request(coinvoteBaseUrl + "/getPosts/user?address=" + address, function(err, res, body){
      var assetsJson = JSON.parse(body);
      callback(err, assetsJson)
    });
  }

  var findTipsByUser = function(options, callback) {
    var address = options.address;
    request(coinvoteBaseUrl + "/getTips?user=" + address, function (err, res, body) {
      var tipsJson = JSON.parse(body);
      callback(err, tipsJson)
    });
  }

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
    findAllTips: findAllTips,
    findAssetsByUser: findAssetsByUser,
    findTipsByUser: findTipsByUser,
    findAllByType: findAllByType
  }

};

module.exports = OpenpublishState;