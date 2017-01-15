var hide_lists = function(cb) {
    $('#posts').fadeOut(300);
    $('#projects').fadeOut(300);
    $('#abouts').fadeOut(300);
    $('#posts-btn').removeClass('disabled');
    $('#projects-btn').removeClass('disabled');
    $('#about-btn').removeClass('disabled')
};
var show_projects = function() {
    $('#posts-btn').removeClass('disabled');
    $('#abouts-btn').removeClass('disabled');
    $('#posts, #abouts').fadeOut(300, function() {
        $('#projects').fadeIn(300)
    });
    $('#projects-btn').addClass('disabled')
};
var show_posts = function() {
    $('#projects-btn').removeClass('disabled');
    $('#abouts-btn').removeClass('disabled');
    $('#projects, #abouts').fadeOut(function() {
        $('#posts').fadeIn(300)
    });
    $('#posts-btn').addClass('disabled')
};
var show_about = function() {
    $('#projects-btn').removeClass('disabled');
    $('#posts-btn').removeClass('disabled');
    $('#projects #posts').fadeOut(function() {
        $('#abouts').fadeIn(300)
    });
    $('#abouts-btn').addClass('disabled')
};
