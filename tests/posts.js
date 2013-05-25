//tests/posts.js
var assert = require('assert');

suite('Posts', function() {
  ltest('in the server', function(done, server) {
    server.eval(function() {
      Posts.insert({title: 'hello title'});
      var docs = Posts.find().fetch();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs.length, 1);
      done();
    });
  });

  ltest('using both client and the server', function(done, server, client) {
    server.eval(function() {
      Posts.find().observe({
        added: addedNewPost
      });

      function addedNewPost(post) {
        emit('post', post);
      }
    }).once('post', function(post) {
      assert.equal(post.title, 'hello title');
      done();
    });

    client.eval(function() {
      Posts.insert({title: 'hello title'});
    });
  });

  ltest('using two client', function(done, server, c1, c2) {
    c1.eval(function() {
      Posts.find().observe({
        added: addedNewPost
      });

      function addedNewPost(post) {
        emit('post', post);
      }
      emit('done');
    }).once('post', function(post) {
      assert.equal(post.title, 'from c2');
      done();
    }).once('done', function() {
      c2.eval(insertPost);
    });

    function insertPost() {
      Posts.insert({title: 'from c2'});
    }
  });

});
