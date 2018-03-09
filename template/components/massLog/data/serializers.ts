
import * as _ from 'lodash';

export default {
    req(params): any {
        return _.pick(params, ['body', 'query', 'headers']);
    },
    res(params): any {
        return _.pick(params, ['headers']);
    },
    params(params): any {
        return _.pick(params, ['port', 'name', 'params']);
    },
    processEnv(params): any {
        return _.pick(params, ['NODE_ENV', 'NODE_PATH']);
    },
    trackers(params): any {
        return _.pick(params, ['correlationId', 'sessionId']);
    },
};
