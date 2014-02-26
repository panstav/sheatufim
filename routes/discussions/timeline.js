

module.exports = function(req,res){
    res.render('timeline_embed.ejs',{source:req.query.source});
}