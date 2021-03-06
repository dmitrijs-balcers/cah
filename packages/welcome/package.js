Package.describe({
  name: 'cah:welcome',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.2');
  api.use('cah:common');

  api.use('reactive-var', 'client');

  api.addFiles('collections/collections.js');
  api.addFiles('router/router.js');

  api.addFiles('server/winningCards.js', 'server');

  api.addFiles('welcome.html', "client");
  api.addFiles('welcome.js', "client");

  api.export('WinningCards');
});