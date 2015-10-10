FlowRouter.route('/room', {
    action: function(params) {
        console.log('room');
        BlazeLayout.render('layout', {main: 'room'});
    }
});