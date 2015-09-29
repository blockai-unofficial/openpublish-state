var request = require('request');
var url = require('url');

var OpenpublishState = function(baseOptions) {

  var network = baseOptions.network;
  var baseUrl = baseOptions.baseUrl;

  var host, protocol;
  if (baseUrl) {
    var parsedBaseUrl = url.parse(baseUrl);
    host = parsedBaseUrl.host;
    protocol = parsedBaseUrl.protocol;
  }
  else {
    protocol = baseOptions.protocol || "https:";
    host = baseOptions.host || network == "testnet" ? "bsync-test.blockai.com" : "bsync.blockai.com";
  }

  var buildUrl = function(pathname, query) {
    if (typeof(baseOptions.minConfirms) === "number") {
      if (!query) {
        query = {};
      }
      query.minConfirms = baseOptions.minConfirms;
    }
    var builtUrl = url.format({
      protocol: protocol,
      host: host,
      pathname: pathname,
      query: query
    });
    return builtUrl;
  }

  var processOpenpublishDoc = function(doc) {
    doc.txid = doc.txid || doc.txout_tx_hash;
    return doc;
  };

  var findTips = function(options, callback) {
    var sha1 = options.sha1;

    request(buildUrl("/opendocs/sha1/" + sha1 + "/tips"), function(err, res, body) {
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
    request(buildUrl("/opentips"), function(err, resp, body) {
      var opentips = JSON.parse(body);
      callback(false, opentips)
    });
  }

  var findDoc = function(options, callback) {
    var sha1 = options.sha1;
    request(buildUrl("/opendocs/sha1/" + sha1), function(err, res, body) {
      var openpublishDoc = JSON.parse(body);
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
    options.limit == options.limit || 20;
    request(buildUrl("/opendocs", options), function(err, res, body) {
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

  var findDocsByUser = function (options, callback) {
    var address = options.address;
    request(buildUrl("/addresses/" + address + "/opendocs", options), function (err, res, body) {
      var assetsJson = JSON.parse(body);
      if (options.includeTips && assetsJson.length) {
        var i = 0;
        assetsJson.forEach(function (asset) {
          asset.sourceAddresses = [address];
          findTips({ sha1: asset.sha1 }, function (err, tipInfo) {
            asset.totalTipAmount = tipInfo.totalTipAmount;
            asset.tipCount = tipInfo.tipCount;
            asset.tips = tipInfo.tips;
            if (++i === assetsJson.length) {
              callback(err, assetsJson);
            }
          });
        });
      }
      else {
        callback(err, assetsJson);
      }
    });
  }

  var findTipsByUser = function (options, callback) {
    var address = options.address;
    request(buildUrl("/addresses/" + address + "/opentips"), function (err, res, body) {
      var tipsJson = JSON.parse(body);
      callback(err, tipsJson)
    });
  }

  var findAll = function(options, callback) {
    options.limit = options.limit || 20;
    request(buildUrl("/opendocs", options), function(err, res, body) {
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
    findDocsByUser: findDocsByUser,
    findTipsByUser: findTipsByUser,
    findAllByType: findAllByType
  }

};

module.exports = OpenpublishState;