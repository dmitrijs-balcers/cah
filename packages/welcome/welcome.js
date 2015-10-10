FlowRouter.route('/', {
    action: function(params) {
        BlazeLayout.render('layout', {main: 'welcome'});
    }
});