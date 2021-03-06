/**
 * @module Fire.Runtime
 */

var getClassName = Fire.JS.getClassName;

var NodeWrapper = require('./wrappers/node');
var SceneWrapper = require('./wrappers/scene');

var runtimeSceneWrapper = null;
var runtimeMixinOptions = null;

/**
 * 通过注册 runtime 的 type 为某个解释器, 使得这份 type 具备序列化, Inspector 中展示的能力
 * @method registerNodeType
 * @param {function} nodeType
 * @param {NodeWrapper} nodeWrapper
 */
function registerNodeType (nodeType, nodeWrapper) {
    if (! Fire.JS.isChildClassOf(nodeWrapper, NodeWrapper)) {
        Fire.error('%s must be child class of %s!', getClassName(nodeWrapper), getClassName(NodeWrapper));
        return;
    }
    if (nodeType.prototype._FB_WrapperType) {
        Fire.error('%s is already registered!', getClassName(nodeType));
        return;
    }
    if (Fire.JS.isChildClassOf(nodeWrapper, SceneWrapper)) {
        if (runtimeSceneWrapper) {
            Fire.error('The %s can only register once!', getClassName(SceneWrapper));
        }
        else {
            runtimeSceneWrapper = nodeWrapper;
        }
    }

    // Create a subclass for cpp runtime
    nodeType = Fire.Class({
        extends: nodeType
    });

    nodeType.prototype._FB_WrapperType = nodeWrapper;
}

/**
 * 通过注册 mixin 的描述来让 engine-framework 懂得如何 mixin 一份 FireClass 到 runtime 的 nodeType 中。
 * @method registerMixin
 * @param {object} mixinOptions
 * @param {function} mixinOptions.mixin - mixin method
 */
function registerMixin (mixinOptions) {
    runtimeMixinOptions = mixinOptions;
}

/**
 * @module Fire
 */

/**
 * 返回已注册的 NodeWrapper 类型，如果 nodeOrNodeType 是实例，则返回自身类型对应的 NodeWrapper 或继承树上方的最近一个注册的 NodeWrapper。
 * 如果 nodeOrNodeType 是构造函数，则只返回自身对应的 NodeWrapper。
 * @method getWrapperType
 * @param {object|function} nodeOrNodeType
 * @return {Fire.Runtime.NodeWrapper|undefined}
 */
function getWrapperType (nodeOrNodeType) {
    if (typeof nodeOrNodeType !== 'function') {
        return nodeOrNodeType._FB_WrapperType;
    }
    else {
        return nodeOrNodeType.prototype._FB_WrapperType;
    }
}

/**
 * 返回跟 object 相互绑定的 NodeWrapper 实例，如果不存在将被创建。
 * @method node
 * @param {object} object
 * @return {Fire.Runtime.NodeWrapper}
 */
function getWrapper (object) {
    var wrapper = object._FB_wrapper;
    if (!wrapper) {
        var Wrapper = Fire.getWrapperType(object);
        if (!Wrapper) {
            Fire.error('%s not registered for %s', getClassName(NodeWrapper), getClassName(object));
            return null;
        }
        wrapper = new Wrapper(object);
        object._FB_wrapper = wrapper;
    }
    return wrapper;
}



//// 值得注意的是, 不同的 runtime 中, 他们 runtimeType 的 mixin 的关键字将会有些许变动, 比如: 有些 runtime 的 node 不支持 event,
//// 那么 listeners 关键字: 在这些 runtime 中将会失效, 我们可以 warning user.
//Fire.registerMixin = require('./mixin');
//

module.exports = {
    registerNodeType: registerNodeType,
    getWrapperType: getWrapperType,
    getWrapper: getWrapper,
    getRegisteredSceneWrapper: function () {
        return runtimeSceneWrapper;
    },

    registerMixin: registerMixin,
    /**
     * get current registered mixin options
     * @method getMixinOptions
     * @return {object}
     */
    getMixinOptions: function () {
        return runtimeMixinOptions;
    }
};
