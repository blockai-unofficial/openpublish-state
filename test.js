var test = require('tape');

var openpublishState = require('./')({
  network: "testnet",
  minConfirms: -1
});

var sha1 = "dc724af18fbdd4e59189f5fe768a5f8311527050";

test('should find a document with a sha1', function(t) {

  openpublishState.findDoc({
    sha1: sha1
  }, function(err, openpublishDoc) {
    t.equal(openpublishDoc.output.tx_hash, '268b39d77bc1f7286bf0c54553e9ee5cf5d448460656a0da6898a41fa9fab33a', 'txid');
    t.equal(openpublishDoc.sourceAddresses[0], 'msLoJikUfxbc2U5UhRSjc2svusBSqMdqxZ', 'sourceAddresses');
    t.equal(openpublishDoc.name, 'test.txt', 'name');
    t.equal(openpublishDoc.btih, '335400c43179bb1ad0085289e4e60c0574e6252e', 'btih');
    t.equal(openpublishDoc.sha1, 'dc724af18fbdd4e59189f5fe768a5f8311527050', 'sha1');
    t.ok(!openpublishDoc.tips, 'no tips');
    t.end();
  });

});

test('should find a document with a sha1 and include the tips', function(t) {

  openpublishState.findDoc({
    sha1: sha1,
    includeTips: true
  }, function(err, openpublishDoc) {
    t.equal(openpublishDoc.output.tx_hash, '268b39d77bc1f7286bf0c54553e9ee5cf5d448460656a0da6898a41fa9fab33a', 'txid');
    t.equal(openpublishDoc.sourceAddresses[0], 'msLoJikUfxbc2U5UhRSjc2svusBSqMdqxZ', 'sourceAddresses');
    t.equal(openpublishDoc.name, 'test.txt', 'name');
    t.equal(openpublishDoc.btih, '335400c43179bb1ad0085289e4e60c0574e6252e', 'btih');
    t.equal(openpublishDoc.sha1, 'dc724af18fbdd4e59189f5fe768a5f8311527050', 'sha1');
    t.ok(openpublishDoc.tipCount > 0, 'tipCount');
    t.ok(openpublishDoc.totalTipAmount > 0, 'totalTipAmount');
    t.ok(openpublishDoc.tips.length > 0, 'tips');
    t.end();
  });

});

// test('should not find a document with a sha1 of XXX', function(t) {

//   openpublishState.findDoc({
//     sha1: "XXX"
//   }, function (err, openpublishDoc) {
//     t.ok(err, 'err is true');
//     t.ok(openpublishDoc === false, 'openpublishDoc is false');
//     t.end();
//   });

// });

test('should find the tips for a document with a sha1', function(t) {

  openpublishState.findTips({
    sha1: sha1,
  }, function(err, tipInfo) {
    t.ok(tipInfo.tipCount > 0, 'tipCount');
    t.ok(tipInfo.totalTipAmount > 0, 'totalTipAmount');
    t.ok(tipInfo.tips.length > 0, 'tips');
    t.end();
  });

});

test('should not find the tips for a document with a sha1 of XXX', function(t) {

  openpublishState.findTips({
    sha1: "XXX"
  }, function(err, tipInfo) {
    // this should actually return an err and tipInfo == false, but we need an api change on bsync
    t.ok(!err, 'err is false');
    t.ok(tipInfo.tips.length === 0, 'tipInfo.tips is empty');
    t.end();
  });

});


test('should find all open tips', function (t) {
  openpublishState.findAllTips({},
    function(err, tips) {
      t.ok(!err, 'err is false');
      t.ok(tips.length > 0, "at least found some open tips");
      t.ok(tips[0].tx_out_hash !== null, "txid of tip is not null");
      t.ok(tips[0].sha1 !== null, "sha1 of tip is not null");
      t.end();
    }
  );
});

test('should find all opendocs by specified user', function (t) {
  openpublishState.findDocsByUser({address: "msLoJikUfxbc2U5UhRSjc2svusBSqMdqxZ"},
    function (err, docs) {
      t.ok(!err, 'err is false');
      t.ok(docs.length > 0, "found some posts at this address");
      var doc = docs[0];
      t.ok(doc.sha1 !== null, "doc's sha1 should not be null");
      t.ok(doc.btih !== null, "doc's btih should not be null");
      t.ok(doc.name !== null, "doc's name should not be null");
      t.ok(doc.size !== null, "doc's size should not be null");
      t.ok(doc.type !== null, "doc's type should not be null");
      t.end();
    }
  );
});

test('should find all opendocs and opendocs\' tips by specified user', function (t) {
  openpublishState.findDocsByUser({
    address: "msLoJikUfxbc2U5UhRSjc2svusBSqMdqxZ",
    includeTips: true
  }, function (err, docs) {
    t.ok(!err, 'err is false');
    t.ok(docs.length > 0, "found some posts at this address");
    var doc = docs[0];
    t.ok(doc.sha1 !== null, "doc's sha1 should not be null");
    t.ok(doc.btih !== null, "doc's btih should not be null");
    t.ok(doc.name !== null, "doc's name should not be null");
    t.ok(doc.size !== null, "doc's size should not be null");
    t.ok(doc.type !== null, "doc's type should not be null");
    t.ok(doc.tipCount >= 0, 'tipCount');
    t.ok(doc.totalTipAmount >= 0, 'totalTipAmount');
    t.ok(doc.tips.length >= 0, 'tips');
    t.end();
  });
});

test('should find all opentips for a specified user', function (t) {
  openpublishState.findTipsByUser({address: "msLoJikUfxbc2U5UhRSjc2svusBSqMdqxZ"},
    function(err, tips) {
      t.ok(!err, 'err is false');
      t.ok(tips.length > 0, "found some posts at this address");
      t.end();
    }
  );
});

test('should find all documents that have been registered with Open Publish', function(t) {

  openpublishState.findAll({}, function(err, openpublishDocuments) {
    t.ok(openpublishDocuments.length > 0, 'has some documents');
    var openpublishDoc = openpublishDocuments[0];
    t.ok(openpublishDoc.output.tx_hash, 'txid');
    t.ok(openpublishDoc.sourceAddresses[0], 'sourceAddresses');
    t.ok(openpublishDoc.name, 'name');
    t.ok(openpublishDoc.btih, 'btih');
    t.ok(openpublishDoc.sha1, 'sha1');
    t.end();
  });

});

test('should find only 3 documents that have been registered with Open Publish', function(t) {

  openpublishState.findAll({limit: 3}, function(err, openpublishDocuments) {
    t.ok(openpublishDocuments.length === 3, 'has 3 documents');
    t.end();
  });

});

test('should find 10 images that have been registered with Open Publish', function(t) {

  openpublishState.findAllByType({type:'image', limit: 2}, function(err, openpublishDocuments) {
    t.ok(openpublishDocuments.length === 2, 'has 2 documents');
    var openpublishDoc = openpublishDocuments[0];
    t.ok(openpublishDoc.output.tx_hash, 'txid');
    t.ok(openpublishDoc.sourceAddresses[0], 'sourceAddresses');
    t.ok(openpublishDoc.name, 'name');
    t.ok(openpublishDoc.btih, 'btih');
    t.ok(openpublishDoc.sha1, 'sha1');
    t.end();
  });

});

// test('should find the transfers for a document with a sha1', function(t) {

//   openpublishState.findTransfers({
//     sha1: "dc724af18fbdd4e59189f5fe768a5f8311527050",
//   }, function(err, transfers) {
//     t.ok(transfers.length > 0, 'transfers.length');
//     t.equal(transfers[0].opendoc_sha1, "724c0e92a180844cb4dd69903e58f173ac6de682", "opendoc_sha1");
//     t.equal(transfers[0].from, "msLoJikUfxbc2U5UhRSjc2svusBSqMdqxZ", "from");
//     t.equal(transfers[0].to, "mwaj74EideMcpe4cjieuPFpqacmpjtKSk1", "to");
//     t.equal(transfers[0].value, 50000000, "value");
//     t.equal(transfers[0].btc_value, 12345, "btc_value");
//     t.equal(transfers[0].ttl, 365, "ttl");
//     t.end();
//   });

// });

