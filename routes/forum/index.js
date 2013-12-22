
module.exports = function(router)
{
    router.all(/\/subject\/([0-9a-f]+)\/forum\/?/,require('./forum'));
};
