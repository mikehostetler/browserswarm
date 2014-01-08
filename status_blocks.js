var common = require('strider/lib/common');
module.exports = statusBlocks;

function statusBlocks(req, res, next) {
  res.send(common.statusBlocks);
}