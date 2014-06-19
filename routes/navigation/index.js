
module.exports = function(router) {
    router.get('/',require('./home'));

    router.get('/about',require('./about'));

    router.get('/about-en',require('./about-en'));

    router.get('/contact',require('./contact'));

    router.get('/team',require('./team'));

    router.get('/terms-of-use',require('./terms_of_use'));

    router.get('/qa',require('./qa'));

    router.get('/founders',require('./founders'));

    router.get('/page/:link',require('./page'));
};

