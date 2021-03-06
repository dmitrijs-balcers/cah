Package.describe({
    name: 'cah:common',
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
    'kadira:flow-router@2.6.2',
    'meteorhacks:fast-render@2.10.0',
    'kadira:blaze-layout@2.1.0',
    'ecmascript',
    'meteor-base',
    'mobile-experience',
    'mongo',
    'blaze-html-templates',
    'session',
    'jquery',
    'tracker',
    'standard-minifiers',
    'es5-shim',
    'ecmascript',
    'semantic:ui-css'
];

Package.onUse(function (api) {
    api.versionsFrom('1.2.0.2');
    api.imply(libs);
    api.use(libs);
});
