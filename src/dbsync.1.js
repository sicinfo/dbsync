/**
 * application: dbsync
 * 
 * powered by moreira 2019-10-28
 * 
 * require systemjs
 */
/* global localStorage */
define(['axios', 'underscore'], (axios, { isEqual }) => {
  
  const 
    uniqueId = (a => a())(function* () {
      let count = 0;
      while (true) yield `c${count++}`;
    }),
    
    { keys, assign, fromEntries } = Object,
    { isArray, from } = Array,
    
    _wm = new WeakMap(),
    _has = (a, k) => _wm.has(a) && _wm.get(a).has(k),
    _set = (a, k, v) => (_wm.has(a) ? _wm.get(a) : (_m => _wm.set(a, _m) && _m)(new Map())).set(k, v),
    _get = (a, k) => (_m => _m && _m.get(k))(_wm.get(a)),
    _del = (a, k) =>_wm.has(a) && _wm.get(a).delete(k);
    
    // _hasIt = (a, k, i) => _has(a, k) && _get(a, k).has(i),
    // _setIt = (a, k, i, v) => (_has(a, k) || _set(a, k, new Map())) && _get(a, k).set(i, v),
    // _getIt = (a, k, i) => (m => m && m.get(i))(_get(a, k)),
    // _delIt = (a, k, i) => _has(a, k) && _get(a, k).delete(i),
    // _keysIt = (a, k) => (_has(a, k) || _set(a, k, new Map())) && _get(a, k).keys(),
    // _valuesIt = (a, k) => (_has(a, k) || _set(a, k, new Map())) && _get(a, k).values(),
    // _sizeIt = (a, k) => _has(a, k) ? _get(a, k).size : 0;

  class Sync {
    
    constructor(opts) {
      // _set(this, 'cid', `c${_uniqueId++}`);
      _set(this, 'cid', uniqueId.next().value);
    }
    
    get baseURL() {
      throw { 'code': 'SYNC', 'message': 'baseURL should be defined' };
    }
    
    get cid() {
      return _get(this, 'cid');
    }
    
    static fetch(opts = {}) {
      (({ authorization }) => authorization && assign(opts.headers || (opts.headers = {}), { authorization }))(localStorage);
      return axios(assign({ 'baseURL': this.baseURL, 'url': this.url }, opts))
        .then(({ headers, data }) => {
          (cb => cb(headers))(({ authorization }) => undefined === authorization || assign(localStorage, { authorization }));
          return data;
        });
    }
  }
  
  const 
    privWord = ['id', 'key', 'from', 'to'],
    privKeys = privWord.slice(0, 2),
    privAttrs = privWord.map(a => `_${a}`);

  class Model extends Sync {
    
    constructor(attrs, opts = {}) {
      super(opts);
      _set(this, 'attrs', new Map());
      _set(this, 'changed', new Map());
      if (attrs) this.set(opts.parse ? this.parse(attrs, opts) : attrs, opts);
      if (opts.collection) _set(this, 'collection', opts.collection);
    }
    
    has(attr) {
      !!this.get(attr);
    }
    
    set(attrs, val, opts) {
      if (attrs == null) return this;
      
      if ('object' === typeof attrs) opts = val;
      else (key => ((attrs = {})[key] = val))(attrs);
      opts || (opts = {});
      
      const 
        { unset } = opts,
        _privKeys = this.isNew && [] || privKeys.map(a => this[`${a}Attribute`]),
        changing = !!this._changing;

      this._changing = true;
      
      if (!changing) {
        this._preventAttrs = Object.assign({}, this._attrs);
        this._changed = {};
      }
      
      const { _attrs, _preventAttrs, _changed } = this;
      
      Object.entries(attrs)
        .map(([key, val]) => [privAttrs.includes(key) && this[`${key.slice(1)}Attribute`] || key, val])
        .filter(([attr, val]) => !(_privKeys.length && _privKeys.includes(attr)))
        .filter(([attr, val]) => {
          
          if (!isEqual(_preventAttrs[attr], val)) { _changed[attr] = val }
          else { delete _changed[attr] }
          
          unset ? delete _attrs[attr] : _attrs[attr] = val;
      });
      
      if (changing) return this;

      this._pending = false;
      this._changing = false;

      return this;
    }
    
    get(attr) {
      return _get(this, 'attrs').get(attr);
    }
    
    unset(attr, opts) {
      return this.set(attr, undefined, assign({}, opts, { 'unset': true }));
    }
    
    get attrs() {
      return _get(this, 'attrs').entries();
    }
    
    get collection() {
      return _get(this, 'collection');
    }
    
    get isNew() {
      return !(this.id && this.key);
    }
    
    get idAttribute() { return '__id' }
    get id() { return this.get(this.idAttribute) }
    
    get keyAttribute() { return `__key` }
    get key() { return this.get(this.keyAttribute) }
    
    get fromAttribute() { return `__from` }
    get from() { return this.get(this.fromAttribute) }
    
    get toAttribute() { return `__to` }
    get to() { return this.get(this.toAttribute) }

    get url() {
      return (id => `${(this.collection || {}).url}${id}`)
        (this.isNew ? '' : `/${this.id}`);
    }
    
    get baseURL() {
      return (this.collection || {}).baseURL;
    }
    
    toJSON(opts) {
      return Object.fromEntries(this.attrs
        .map(([k, v]) => [privWord.reduce((a, b) => a || k === this[`${b}Attribute`] && `_${b}`, ''), v]));
    }
    
    parse(attrs, opts) {
      return attrs;
    }
    
  }
  
  const
    setOpts = { add: true, remove: true, merge: true },
    addOpts = { add: true, remove: false };

  class Collection extends Sync {
    
    constructor(opts) {
      super(opts);
      _set(this, 'cids', new Map());
      _set(this, 'ids', new Map());
    }
    
    set(models, opts) {
      if (!models) return this;
      
      opts = assign({}, setOpts, opts);
      if (opts.parse && !this._isModel(models)) models = this.parse(models, opts);

      const
        { add, merge, remove, sync } = opts,
        [toAdd, toMerge, toRemove] = [[],[],[]];
      
      for (const model of isArray(models) ? models : [models]) (existing => {
        
        if (existing) ((attrs, exist) => {
          if (merge && !isEqual(exist, attrs)) toMerge.push(
            existing.set(Object.fromEntries(
              Object.entries(attrs).filter(([k, v]) => undefined !== v && exist[k] !== v)
            ), opts)
          );
        })(this._isModel(model) && model.toJSON(opts) || model, existing.toJSON(opts));
        
        else if (add) toAdd.push(this._addReference(model, opts));

      })(this.get(model));

      if (remove) toRemove.push((models => this._removeModels(
        Object.keys(this._cids).filter(cid => !models[cid]).map(cid => this._cids[cid])
      )(toMerge.concat(toAdd).map(m => (a => ((a[m.cid] = m), a))({})))));
      
      if (add && remove && (toMerge.length || toAdd.length)) {
        
      }
      
      return this;
    }
    
    get(obj) {
      return obj && (
        'string' === typeof obj && (_get(this, 'ids').get(obj) || _get(this, 'cids').get(obj)) ||
        (({ id, cid }) => id && _get(this, 'ids').get(id) || cid && _get(this, 'cids').get(cid))(obj) ||
        (id => id && _get(this, 'ids').get(id))(this._modelId(obj))
      ) || undefined;
    }
    
    get model() {
      return Model;
    }
    
    get models() {
      return _get(this, 'cids').values();
    }
    
    get length() {
      return this.models.length;
    }
    
    get service() {
      throw { 'message': 'service should be defined' };
    }
    
    get url() {
      return this.service;
    }
    
    get length() {
      return get(this, 'cids').size;
    }
    
    parse(resp, opts) {
      return resp;
    }
    
    fetch(opts) {
      opts = assign({ 'method': 'GET', 'parse': true }, opts);
      return Sync.fetch.call(this, opts).then(({ result }) => {
        return this.set(opts.parse ? this.parse(result, opts) : result, opts);
      });
    }
    
    static _isModel(model) {
      return model instanceof Model;
    } // tested
    
    _modelId(attrs = {}) {
      return attrs[this.model.prototype.idAttribute] || attrs[Model.prototype.idAttribute];
    } // tested

    // add collection in model, if not model create new model with collection defined
    _prepareModel(attrs, opts) {
      return attrs && Collection._isModel(attrs) &&
        (_has(attrs, 'collection') || _set(attrs, 'collection', this)) && attrs ||
        new this.model(attrs, assign({'collection': this}, opts));
    } // tested
    
    // Internal method to create a model's ties to a collection.
    _addReference(model, opts) {
      Collection._isModel(model) && (({ cid, id }) => {
        _get(this, 'cids').set(cid, model);
        if (id) _get(this, 'ids').set(id, model);
        })(model);
    } // tested
    
    // Internal method to sever a model's ties to a collection.
    _removeReference(model, opts) {
      if (Collection._isModel(model)) {
        _get(this, `cids`).delete(model.cid);
        _get(this, `ids`).delete(model.id);
        if (Object.is(this, model.collection)) _del(model, 'collection');
      }
    } // tested

    // Internal method called by both remove and set.
    _removeModels(models, options) {
      
      // models.next()
      
      // var removed = [];
      // for (var i = 0; i < models.length; i++) {
      //   var model = this.get(models[i]);
      //   if (!model) continue;

      //   var index = this.indexOf(model);
      //   this.models.splice(index, 1);
      //   this.length--;

      //   // Remove references before triggering 'remove' event to prevent an
      //   // infinite loop. #3693
      //   delete this._byId[model.cid];
      //   var id = this.modelId(model.attributes);
      //   if (id != null) delete this._byId[id];

      //   if (!options.silent) {
      //     options.index = index;
      //     model.trigger('remove', model, this, options);
      //   }

      //   removed.push(model);
      //   this._removeReference(model, options);
      // }
      // return removed;
    }
    
  }
  
  return { Sync, Model, Collection };
  
});







// define(['backbone', 'underscore', 'myfetch'], (Backbone, _, { fetchAuth }) => {

//   const { keys, assign } = Object, { isArray } = Array,
//   isObject = a => !!a && 'object' === typeof a && Object === a.constructor && a,
//     parseObject = (o, k, v) => (undefined === v ? delete o[k] : o[k] = v, o),
//     urlRoot = `http://sv-dssti-app-p00.tjgo.ldc/WS/labti`,
//     _kwr = new WeakMap(), // palavras chaves reservadas
    
//     // [_set, _get, _has, _keys] = (wm => [
//     //   (a, k, v) => assign((wm.has(a) ? wm : wm.set(a, {})).get(a), (o => (o[k] = v, o))({})),
//     //   (a, k) => (o => o && o[k])(wm.get(a)),
//     //   (a, k) => (o => o && k in o)(wm.has(a)),
//     //   k => ['_key', '_from', '_to', '_new', 'keyAttribute', ].includes(k)
//     // ])(new WeakMap()),
    
//     // _key = new WeakMap(),
//     // _from = new WeakMap(),
//     // _to = new WeakMap(),
    
//     // _isnew = new WeakMap(),
//     // _keyAttribute = new WeakMap(),
//     // _fromAttribute = new WeakMap(),
//     // _toAttribute = new WeakMap(),
//     _service = new WeakMap(),
    
//     wrapError = (model, options) => {
//       const { error } = options;
//       options.error = function(resp) {
//         if (error) error.call(options.context, model, resp, options);
//         model.trigger('error', model, resp, options);
//       };
//     },
    
//     // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
//     methodMap = {
//       create: 'POST',
//       update: 'PUT',
//       patch: 'PATCH',
//       delete: 'DELETE',
//       read: 'GET'
//     },
    
//     sync = (method, model, options) => fetchAuth(
//       options.url || model.url, 
//       assign({ 'method': methodMap[method] })
//     ).then(resp => resp.json());

//   class Model extends Backbone.Model {

//     constructor(attributes, options) {
//       super(attributes, options);
      
//       for (const _key of ['_id', '_key', '_from', '_to']) {
        
//         _key in this.attributes && 
//         this.setKwr(_key, this.attributes[_key]) &&
//         this.set(_key, undefined, { 'unset': true, 'silent': true, 'validate': false });
        
//         const 
//           keyName = `${_key}Attribute`, 
//           keyValue = (a => a && a.split('.')[0])(options[keyName.slice(1)]);
          
//         keyValue &&
//         this.setKwr(keyName, keyValue) &&
//         this.on(`change:${keyValue}`, (model, val, opts) => {
//           this.isNew() && this.setKwr(_key, val);
//           this.set(keyValue, undefined, { 'unset': true, 'silent': true, 'validate': false });
//         });
        
//         this.on(`change:${_key}`, (model, val, opts) => {
//           this.isNew() && this.setKwr(_key, val);
//           this.set(_key, undefined, { 'unset': true, 'silent': true, 'validate': false });
//         });
//       }
      
      
      
      
      
//       // (({ idAttribute, keyAttribute, fromAttribute, toAttribute }) => {
        
//       // })(options || {})
      
      
      
      
// //       options || (options = {});
// //       this.set('_isnew', !options.add && !options.merge && !options.remove);

// //       ['_id', '_key', '_from', '_to'].forEach(_key => {
        
// //         const 
// //           key = `${_key}Attribute`, 
// //           keyAttribute = options[key.slice(1)];

// // // console.log(_key, this.attributes, super.attributes, this.has(_key), super.has(_key));
// // // console.log(this.attributes[_key], this.attributes[_key] != null);
        
// //         super.has(_key) && 
// //         (value => {
// //           // (console.log)(_key, value, key, keyAttribute);
// //           super.unset(_key, { 'silent': true });
// //           this.set(_key, value);
// //           keyAttribute && this.set(keyAttribute, value, { 'silent': true });
// //         })(super.get(_key));
        
// //         keyAttribute && 
// //         this.set(key, keyAttribute) &&
// //         this.isNew() && 
// //         this.on(`change:${keyAttribute.split('.')[0]}`, (key, val) => this.set(_key, val));

//       // });

//       // (({ keyAttribute, fromAttribute, toAttribute, add, merge, remove }) => {
//       //   this.set('_isnew', !add && !merge && !remove);
//       //   if (!keyAttribute) return;
        
        
//       //   ['_key', ]
        
//       //   super.has('_key') && (value => {
//       //     super.unset('_key');
//       //     this.set('_key', value);
//       //     this.set(keyAttribute, value, { 'silent': true });
//       //   })(super.get('_key'));
        
//       //   this.set('_keyAttribute', keyAttribute);
//       //   fromAttribute && this.set('_fromAttribute', fromAttribute);
//       //   toAttribute && this.set('_toAttribute', toAttribute);
        
//       //   this.isNew() && [
//       //     ['_key', keyAttribute], 
//       //     ['_from', fromAttribute], 
//       //     ['_to', toAttribute]
//       //   ].forEach(([_key, _val]) => {
//       //     _val && this.on(`change:${_val.split('.')[0]}`, (key, val) => this.set(_key, val));
//       //   });
        
//       // })(options || {});
//     }
    
//     isKwr(key) {
//       return key.startsWith('_');
//     }
    
//     getNameKwr(arg) {
//       return ['id', 'key', 'from', 'to']
//         .reduce((a, b) => a || arg === this[`${b}Attribute`] && `_${b}`, '');
//     }
    
//     setKwr(key, val, opts) {
//       return (key => key && parseObject(
//           (_kwr.has(this) ? _kwr : _kwr.set(this, {})).get(this), key, val
//         ))(this.isKwr(key) && key || this.getNameKwr(key));
//     }
    
//     getKwr(key) {
//       return (key => key && (obj => obj && obj[key])(_kwr.get(this)))
//         (this.isKwr(key) && key || this.getNameKwr(key));
//     }
    
//     hasKwr(key) {
//       return _kwr.has(this) && key in _kwr.get(this);
//     }
    
//     has(key) {
//       return this.isKwr(key) ? this.hasKwr(key) : super.has(key);
//     }

//     get(key) {
//       return this.getKwr(key) ||
//       ((a, ...b) => b.reduce((r, k) => r && r.get(k), super.get(a)))(...key.split('.'));


//       // return (key => key && this.getKwr(key))(this.isKwr(key) && key || this.getNameKwr(key)) ||
//       //   ((a, ...b) => b.reduce((r, k) => r && r.get(k), super.get(a)))(...key.split('.'));
//     }

//     set(key, ...vals) {
//       return 'string' === typeof key && 
//         key.includes('.') && 
//         (([a, b]) => this.get(b).set(a, ...vals))
//         ((a => [a.slice(-1)[0], a.slice(0, -1).join('.')])(key.split('.'))) ||
//         super.set(key, ...vals);
//     }

//     // key = string || collection
//     setKeyIfVal(arg, attribute = 'value') {
//       return (value, opts) => {
        
//         'string' === typeof value || value && (
//           value = value[attribute]
//         );
        
//         const [key, val] = isObject(arg) ?
//           [arg.service, value && arg.getByKey(value)]:
//           [arg, value];
        
//         return key && (val && this.set(key, val, opts) || this.unset(key, undefined, opts)) || this;
//       };

//       // return (value, opts) => (([key, val]) => key && (val && this.set(key, val, opts) || this.unset(key, undefined, opts)))(
//       //   'string' === typeof key && [key, value] || [key.service, value && key.getByKey(value)]
//       // );
//     }

//     // isNew() {
//     //   return super.isNew() && !this.has('_key');
//     // }
    
//     get id() {
//       return this.getKwr('_id');
//     }

//     get key() {
//       return this.getKwr('_key');
//     }

//     get from() {
//       return this.getKwr('_from');
//     }

//     get to() {
//       return this.getKwr('_to');
//     }

//     get idAttribute() {
//       return '_id';
//     }

//     get keyAttribute() {
//       return this.getKwr('_keyAttribute');
//     }

//     get fromAttribute() {
//       return this.getKwr('_fromAttribute');
//     }

//     get toAttribute() {
//       return this.getKwr('_toAttribute');
//     }

//     get urlRoot() {
//       return ['from', 'to'].reduce((acc, key) => 
//         (val => (arg => `${acc}${arg}`)(val && `&_${key}=${val}`))
//         ((val => 
//         // (console.log)(val) || 
//         val && ('string' === typeof val && val || val.id) || '')(this[key])),
//       `${this.collection.url}?_key=${this.key}`);
      
//       // return (([a, b]) => `${this.collection.url}?_key=${this.key}${a || ''}${b || ''}`)(
//       //     ['from', 'to'].map(key => (({ id }) => id && `&_${key}=${id}`)(this[key] || {}))
//       // );
//     }
    
//     get url() {
//       return super.url();
//     }

//     // parse model
//     parse(data, options = {}) {

//       if (!options.save) for (const _key of ['_from', '_to']) if (_key in data) {
//         data[_key] = ((keyAttribute, attrs) =>
//           keyAttribute ? new Model(attrs, { keyAttribute, 'parse': true }) : attrs._id || attrs
//         )((a => a && a.split('.')[1])(options[`${_key.slice(1)}Attribute`]), data[_key]);
//       }

//       return data;
//     }

//     // save(attrs, val, options) {
//     //   if ('object' === typeof attrs) val && (options = val);
//     //   else attrs = parseObject({}, attrs, val);

//     //   return super.save(attrs, assign({}, options, { 'save': true }));
//     // }

//     // Set a hash of model attributes, and sync the model to the server.
//     // If the server returns an attributes hash that differs, the model's
//     // state will be `set` again.
//     save(attrs, val, options) {
      
//       if ('object' === typeof(attrs)) val && (options = val);
//       else (attrs = {})[attrs] = val;
      
//       options = assign({ 'save': true, 'validate': true, 'parse': true }, options);
      
//       if (!this._validate(attrs, options)) return Promise.reject();

//       const method = this.isNew ? 'create' : options.update ? 'update' : 'patch';
//       'patch' === method && assign(options, { attrs });

//       return sync(method, this, options).then(({ result }) => {
//         return this.set(options.parse ? this.parse(result) : result, options);
//       });
        
      
      
      
      
      
//       // var wait = options.wait;

//       // // If we're not waiting and attributes exist, save acts as
//       // // `set(attr).save(null, opts)` with validation. Otherwise, check if
//       // // the model will be valid when the attributes, if any, are set.
//       // if (attrs && !wait) {
//       //   if (!this.set(attrs, options)) return false;
//       // } else if (!this._validate(attrs, options)) {
//       //   return false;
//       // }

//       // // After a successful server-side save, the client is (optionally)
//       // // updated with the server-side state.
//       // var model = this;
//       // var success = options.success;
//       // var attributes = this.attributes;
//       // options.success = function(resp) {
//       //   // Ensure attributes are restored during synchronous saves.
//       //   model.attributes = attributes;
//       //   var serverAttrs = options.parse ? model.parse(resp, options) : resp;
//       //   if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
//       //   if (serverAttrs && !model.set(serverAttrs, options)) return false;
//       //   if (success) success.call(options.context, model, resp, options);
//       //   model.trigger('sync', model, resp, options);
//       // };
//       // wrapError(this, options);

//       // // Set temporary attributes if `{wait: true}` to properly find new ids.
//       // if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

//       // var method = this.isNew() ? 'create' : options.patch ? 'patch' : 'update';
//       // if (method === 'patch' && !options.attrs) options.attrs = attrs;
//       // var xhr = this.sync(method, this, options);

//       // // Restore attributes.
//       // this.attributes = attributes;

//       // return xhr;
//     }



//     toJSON(options) {
//       return (attrs => {
//         for (const key in attrs)
//           if ((a => a.cid && a.toJSON)(attrs[key])) {
//             attrs[key] = attrs[key].toJSON(options);
//           }
//         return attrs;
//       })(super.toJSON(options));
//     }
    
//     // Fetch the model from the server, merging the response with the model's
//     // local attributes. Any changed attributes will trigger a "change" event.
//     fetch(options) {
//       options = assign({ parse: true }, options);
//       return sync('read', this, options)
//         .then(({ result }) => {
//           const attrs = options.parse ? this.parse(attrs) : result;
//           return this.set(attrs, options) && this;
//         });
//     }

//   }

//   class Collection extends Backbone.Collection {
    
//     constructor(options = {}) {

//       (({ keyAttribute, fromAttribute, toAttribute, model }) => {
//         model || (model => assign(options, { model }))(
//           class extends Model {
//             constructor(attributes, options) {
//               super(
//                 attributes, 
//                 assign({},
//                   keyAttribute && { keyAttribute },
//                   fromAttribute && { fromAttribute },
//                   toAttribute && { toAttribute },
//                   options
//                 )
//               );
//               this.on('remove', model => model.destroy({
//                 'success': console.log
//               }));
//             }
//           }
//         );
//       })(options);

//       super(null, options);
//       (({ service }) => service && _service.set(this, service))(options);
      
//       this.on('add', ({ cid, id, key, from, to }) => cid && 
//         [['id', id], ['key', `${key}${from || ''}${to || ''}`]]
//           .forEach(([k, v]) => v && this.setKwr(`_${k}:${v}`, cid))
//       );
        
//       this.on('delete', ({ id, key, from, to }) => 
//         [['id', id], ['key', `${key}${from || ''}${to || ''}`]]
//           .forEach(([k, v]) => v && this.setKwr(`_${k}:${v}`))
//       );
      
//     }
    
//     isKwr(key) {
//       return key.startsWith('_');
//     }
    
//     setKwr(key, val, opts) {
//       return this.isKwr(key) && 
//         parseObject((_kwr.has(this) ? _kwr : _kwr.set(this, {})).get(this), key, val);
//     }
    
//     getKwr(key) {
//       return (obj => obj && obj[key])(_kwr.get(this));
//     }
    
//     hasKwr(key) {
//       return _kwr.has(this) && key in _kwr.get(this);
//     }
    
//     get(key, from = '', to = '') {
//       return super.get('string' === typeof arg && (
//         (kwr => kwr && kwr[`_id:${key}`] || kwr[`_key:${key}${from}${to}`])(_kwr.get(this))
//       ) || key);
//     }
    
//     get(arg) {
//       return super.get('string' === typeof arg && (
//           (kwr => kwr && kwr[`_id:${arg}`] || kwr[`_key:${arg}`])(_kwr.get(this))
//         ) || arg);
//     }
  
//     get url() {
//       throw new Error('url not defined');
//     }
  
//     get service() {
//       return _service.get(this);
//     }
  
//     // collection parse
//     parse(result = [], options) {
//       return result.map(data => new this.model(data, assign({ 'parse': true }, options)));
//     }
    
//     // add(model, opts) {
      
//     //   ['_id', '_key', '_from', '_to']
//     //   console.log(model);
//     //   console.log(opts);
//     //   return super.add(model, opts);
//     // }
    
//       // Fetch the default set of models for this collection, resetting the
//     // collection when they arrive. If `reset: true` is passed, the response
//     // data will be passed through the `reset` method instead of `set`.
//     fetch(options = {}) {
//       options = assign({ 'parse': true }, options);
//       return sync('read', this, options)
//         .then(({ result }) => {

// console.log(result);          
          
          
//           this[options.reset ? 'reset' : 'set'](result, options);
//           return this;
//         });
      
      
//       // options = _.extend({parse: true}, options);
      
      
      
//       // var success = options.success;
//       // var collection = this;
//       // options.success = function(resp) {
//       //   var method = options.reset ? 'reset' : 'set';
//       //   collection[method](resp, options);
//       //   if (success) success.call(options.context, collection, resp, options);
//       //   collection.trigger('sync', collection, resp, options);
//       // };
//       // wrapError(this, options);
//       // return this.sync('read', this, options);
//     }

//     // create(model, options = {}) {
//     //   const { success } = options;
//     //   return super.create(model, assign(options, {
//     //     'wait': true,
//     //     'success': (model, response, options) => {
//     //       model._previousAttributes = {};
//     //       model.changed = {};
//     //       success && success(model, response, options);
//     //     }
//     //   }));
//     // }

//     create(model, options) {
//       options = assign({}, options);
//       model = this._prepareModel(model, options);
//       return !model ? Promise.reject() :
//         model.save(null, options).then(model => {
//           model._previousAttributes = {};
//           model._changed = {};
//           return model;
//         });

//     //   options = options ? _.clone(options) : {};
//     //   var wait = options.wait;
//     //   model = this._prepareModel(model, options);
//     //   if (!model) return false;
//     //   if (!wait) this.add(model, options);
//     //   var collection = this;
//     //   var success = options.success;
//     //   options.success = function(m, resp, callbackOpts) {
//     //     if (wait) collection.add(m, callbackOpts);
//     //     if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
//     //   };
//     //   model.save(null, options);
//     //   return model;
//     }
//   }

//   class Login extends Backbone.Model {
  
//     isNew() {
//       return false;
//     }
  
//     get urlRoot() {
//       return `${urlRoot}/login`;
//     }
  
//   }
  
//   class Cadastros extends Collection {
  
//     get url() {
//       return `${urlRoot}/cadastro/${this.service}`;
//     }
  
//   }
  
//   return {
//     Model,
//     Collection,
//     Login,
//     urlRoot,
//     Cadastros
//   };

// });
 