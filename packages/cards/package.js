Npm.depends({
    'twit': '2.1.0'
});

Package.describe({
  name: 'cah:cards',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

var libs = [
    'cah:common'
];

Package.onUse(function(api) {

  api.use(libs);
  api.addFiles('collections/collections.js');
  api.addFiles('cards.js', 'server');

  api.export('Players');
});
