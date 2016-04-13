var winston = require('winston'); //winston logger module

function getLogger(module) {
    var path = module.filename.split('/').slice(-2).join('/'); //filename mark

    return new winston.Logger({
        transports : [ //console transport
            new winston.transports.Console({
                colorize:   true,
                level:      'debug',
                label:      path
            })
        ]
    });
}

module.exports = getLogger;