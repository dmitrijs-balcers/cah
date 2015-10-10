FlowRouter.route('/test', {
    action: function(params) {
        BlazeLayout.render('layout', {main: 'test'});
    }
});

