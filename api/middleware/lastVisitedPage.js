
module.exports = function(req, res, next) {
    const isStaticAsset = req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|woff2)$/i);
  
    if (!isStaticAsset) {
      const lastVisitedPage = req.session.lastVisitedPage || '/orgs';
    
      if (req.url !== lastVisitedPage) {
        req.session.lastVisitedPage = req.url; 
      }
      
      res.locals.lastVisitedPage = lastVisitedPage;
    }
  
    return next();
  };

  
    