"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReadable = exports.isStream = void 0;
exports.isStream = (stream) => {
    return stream !== null &&
        typeof stream === 'object' &&
        typeof stream.pipe === 'function';
};
exports.isReadable = (stream) => {
    return exports.isStream(stream) &&
        stream.readable !== false &&
        typeof stream._read === 'function';
};
//# sourceMappingURL=utils.js.map