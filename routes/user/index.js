
module.exports = function(router){
   router.all('', require('./user'));
   router.all(/\/([0-9a-f]+)\/?$/,require('./user'));

};



