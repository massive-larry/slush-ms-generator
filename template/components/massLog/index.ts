import * as _ from 'lodash';
import * as bunyan from 'bunyan';
import { config } from '../../config/index';
import { serializers as defaultSerializers } from '../../futureModules/serializers';

const serializers = _.merge({}, defaultSerializers);

const logger = bunyan.createLogger(_.merge(
    { serializers },
    config.log.bunyan.init)
);

process.on('unhandledRejection', (reason, p: any) => {
    logger.error('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
    logger.error(p._trace ? p._trace.stack : p);
});
process.on('uncaughtException', (err: any) => {
    logger.error('An uncaught exception occurred!');
    logger.error(err.stack ? err.stack : err);
});

export { logger };
