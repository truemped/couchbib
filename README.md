
Couch Bib
===

This is a [couchapp][] for managing your (non-)scientific literature. Think of it as a distributed version of
[CiteULike][citeulike].

[couchapp]: http://couchapp.org
[citeulike]: http://www.citeulike.org/


Features
===

- attach custom files (like the article's PDF)
- take notes for yourself
- tag each item and browse through your collection with a tag-cloud
- search the items using [couchdb-lucene][]
- Customizable literature quotations

[couchdb-lucene]: http://github.com/rnewson/couchdb-lucene


Planned Features
===

- central server hosted somewhere in order to allow for collaboration with other
  people
- custom version of [couchdbx-app][] in order to bundle a *standalone-app* 

[couchdbx-app]: http://github.com/janl/couchdbx-app


Installation
===

Clone the project:

    $ git clone http://github.com/truemped/couchbib.git
    $ cd couchbib

Initialize the git submodules

    $ git submodule init
    $ git submodule update

Create a *.couchapprc* for your needs. Example:

    $ echo "{ \"env\" : \"default\" : { \"db\" : \"http://localhost:5984/couchbib\" } }" > .couchapprc

Push the [couchapp][]

    $ couchapp push

Now visit: [your couchbib][yourcouchbib]

[yourcouchbib]: http://localhost:5984/couchbib/_design/couchbib/index.html


If you want to perform fulltext indexing, please install [couchdb-lucene][].


Thanks
===

- The [CouchDB Team][couchdbteam]
- [jQuery][jquery]
- [jQuery UI][jqueryui]
- Robert Newson for [couchdb-lucene][]
- The [Blueprint CSS][blueprint] Project

[couchdbteam]: http://couchdb.apache.org
[blueprint]: http://github.com/joshuaclayton/blueprint-css
[jquery]: http://jquery.com/
[jqueryui]: http://jqueryui.com/

