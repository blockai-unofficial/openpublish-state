# openpublish-state
Request information about the state of [Open Publish](https://github.com/blockai/openpublish) documents.

## About

This module is a client-side library for performing queries on Open Published documents. 

A ```user``` in the context of Open Publish is a Bitcoin wallet address such as the tesnet address ```mqMsBiNtGJdwdhKr12TqyRNE7RTvEeAkaR```.

## Install

```npm install openpublish-state```

## Usage

The ```openpublish-state``` module defaults to using the Open Publish state engines that run at ```https://bsync.blockai.com``` and ```https://bsync-test.blockai.com```.

First we need to create the client and specify which blockchain network we're interested in querying.

```js
var openpublishState = require('openpublish-state')({
  network: "testnet" // "bitcoin"
});
```

### Finding a single document by SHA1

```js
openpublishState.findDoc({sha1: "f072bf66cd807c48e37170137b6f8bd3dc01963e"}, function(err, openpublishDoc) {
  // openpublishDoc looks like the following:
  {
    "sha1":"f072bf66cd807c48e37170137b6f8bd3dc01963e",
    "btih":"e61e35d68a46439a11dd2405f3c20b59c1283699",
    "op":"r",
    "name":"1280x720-OLx.jpg",
    "size":"122193",
    "uri":"https://bitstore-test.blockai.com/mqMsBiNtGJdwdhKr12TqyRNE7RTvEeAkaR/sha1/f072bf66cd807c48e37170137b6f8bd3dc01963e",
    "type":"image/jpeg",
    "created_at":"2015-08-12T18:18:59.404Z",
    "updated_at":"2015-08-12T18:18:59.963Z",
    "output":{
      "tx_hash":"861a340f054cf1dc1af9c951ca1c062b4f3b6d233ac5fd9436c3f2e9242a7cc7",
      "position":1,
      "height":530114,
      "branch":"main"},
    "totalTipAmount":10000,
    "tipCount":1,
    "sourceAddresses":["mqMsBiNtGJdwdhKr12TqyRNE7RTvEeAkaR"]
  };
});
```

### Find all documents by type

```js
openpublishState.findAllByType({type: "image", limit: 10}, function(err, openpublishImageDocs) {
  // returns the 10 latest images that have been published
});
```

### Find all documents published by a user

```js
openpublishState.findAllByUser({address: "mqMsBiNtGJdwdhKr12TqyRNE7RTvEeAkaR"}, function(err, openpublishDocs) {
  // returns all docs published by mqMsBiNtGJdwdhKr12TqyRNE7RTvEeAkaR
});
```
