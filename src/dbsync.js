/***
 * application: dbsync
 * 
 * client-side
 * 
 * powered by moreira 2019-10-28
 * 
 * require systemjs
 */

define(['axios', 'underscore'], (axios, { isEqual }) => {
  
  const 
    
    
    // function(prefix = 'c') {
    //   return `${prefix}${(a => Reflect.set(this, prefix, a +1) && a)((Reflect.get(this, prefix) || 0))}`;
    // },
    
    _wm = new WeakMap(),
    _has = (a, k) => _wm.has(a) && _wm.get(a).has(k),
    _set = (a, k, v) => (_wm.has(a) ? _wm.get(a) : (_m => _wm.set(a, _m) && _m)(new Map())).set(k, v),
    _get = (a, k) => (_m => _m && _m.get(k))(_wm.get(a)),
    _del = (a, k) =>_wm.has(a) && _wm.get(a).delete(k),
    _setFlag = (a, c, v) => (f => (h => h == !!v || (v && f.add(c) || h && f.delete(c)))(f.has(c)))(_get(a, 'flag') || (b => _set(a, 'flag', b) && b)(new Set())),
    _getFlag = (a, c) => (f => !!f && f.has(c))(_get(a, 'flag')),
    
    uniqueId = function* (prefix = '_', _count = 0) {
      while (true) yield `${prefix}${(_count++).toString(36).toUpperCase().padStart(4, '0')}`;
    },
    
    uniqueCid = uniqueId('C'),

    // Internal method to create a model's ties to a collection.
    _addReference = (collection, model, opts) => {
      _isModel(model) && 
      (({ cid, id, from, to, inherit } = model) => {
        _get(collection, 'cids').set(cid, model);
        inherit && _get(collection, 'inherits').set(inherit, model);
        from && _get(collection, 'froms').set(from, model);
        to && _get(collection, 'tos').set(to, model);
        id && _get(collection, 'ids').set(id, model);
      })();
    },
    
    // Internal method to sever a model's ties to a collection.
    _removeReference = (collection, model, opts) => {
      _isModel(model) &&
      _get(collection, `cids`).delete(model.cid) &&
      _get(collection, `ids`).delete(model.id) &&
      Object.is(collection, model.collection) &&
      _del(model, 'collection');
      _get(collection, `inherits`).delete(model.inherit);
      _get(collection, `froms`).delete(model.from);
      _get(collection, `tos`).delete(model.to);
    },

    // Internal method called by both remove and set.
    _removeModels = (collection, models, options) => {
      return models.map(model => {
        _removeReference(collection, model, options)
        return model;
      });
    },
    
    _modelId = (collection, attrs = {}) => {
      return attrs[collection.model.prototype.idAttribute] || attrs[Model.prototype.idAttribute];
    },

    _isModel = (model) => {
      return model instanceof Model;
    },
    
    _validate = () => true;


  class Sync {
    
    constructor(opts) {
      _set(this, 'cid', uniqueCid.next().value);
    }
    
    get baseURL() {
      throw { 'code': 'SYNC', 'message': 'baseURL should be defined' };
    }
    
    get cid() {
      return _get(this, 'cid');
    }
    
    sync(opts) {
      Reflect.has(opts, 'url') ||
      Reflect.set(opts, 'url', `${this.baseURL}/${this.url}`);
      return Reflect.apply(Sync.fetch, opts, []);
    }

    static fetch() {
      return axios(this).then(({ data }) => data).catch(({ response, message }) => {
        alert(`${message} \n ${response.data}`);
      });
    }
    
  }
  
  const 
    privKeys = ['id','key'],
    privWord = privKeys.concat('inherit', 'from', 'to'),
    privAttrs = privWord.map(a => `_${a}`);
    
  class Model extends Sync {
    
    constructor(attrs, opts = {}) {
      super(opts);
      _set(this, 'attrs', {});
      if (attrs) this.set(opts.parse ? this.parse(attrs, opts) : attrs, opts);
      _set(this, 'changed', {});
      if (opts.collection) _set(this, 'collection', opts.collection);
    }
    
    has(attr) {
      return !!this.get(attr);
    }
    
    get(attr) {
      return Reflect.get(_get(this, 'attrs'), attr);
    }
    
    unset(attrs, opts) {
      if (attrs == null) return this;
      if ('object' !== typeof attrs) (key => ((attrs = {})[key] = undefined))(attrs);
      return this.set(attrs, Object.assign({}, opts, { 'unset': true }));
    }
    
    set(attrs, val, opts) {
      if (attrs == null) return this;
      if ('object' === typeof attrs) opts = val;
      else (key => ((attrs = {})[key] = val))(attrs);
      opts || (opts = {});
      
      const 
        { unset, changing, remind = true, preserveKeys } = opts,
        _privKeys = !this.isNew && new Set((preserveKeys ? privWord : privKeys).map(a => Reflect.get(this, `${a}Attribute`))),
        _changing = !!(_getFlag(this, 'changing') && changing);
      

      !(_getFlag(this, 'changing') && changing) &&
      _set(this, 'changed', {}) &&
      _set(this, 'preventAttrs', this.attrs) ||
      (_has(this, 'changed') || _set(this, 'changed', {})) &&
      (_has(this, 'preventAttrs') || _set(this, 'preventAttrs', {}));

      const 
        _attrs = _get(this, 'attrs'),
        _prev = _get(this, 'preventAttrs'),
        _changed = _get(this, 'changed');

      _setFlag(this, 'changing', _changing || changing);
      
      Object.entries(attrs)
      
        // modifica os attributos privados para corresponder
        .map(([key, val]) => [privAttrs.includes(key) && Reflect.get(this, `${key.slice(1)}Attribute`)|| key, val])
        
        // nao alterar id e key se nao for novo registro
        .filter(([attr, val]) => !(_privKeys && _privKeys.has(attr)))
        .filter(([attr, val]) => {

          !remind ||
          isEqual(Reflect.get(_prev, attr), val) &&
          Reflect.deleteProperty(_changed, attr) ||
          Reflect.set(_changed, attr, val);
          
          unset &&
          Reflect.deleteProperty(_attrs, attr) ||
          Reflect.set(_attrs, attr, val);
          
// if ('idade' === attr) {          
// console.log(!unset, attr, val);
// console.log(_prev);          
// console.log(_changed);          
// console.log(_attrs);          
// console.log('-.'.repeat(20));
// }

        });

      return this;
    }
    
    get changing() {
      return _getFlag(this, 'changing');
    }
    
    get attrs() {
      return Object.assign({}, _get(this, 'attrs'));
    }
    
    get collection() {
      return _get(this, 'collection');
    }
    
    get isNew() {
      return !(this.id && this.key);
    }
    
    get id() { 
      return this.get(this.idAttribute);
    }
    
    get idAttribute() { 
      return '__id';
    }
    
    get keyAttribute() { 
      return `__key`;
    }
    
    get key() { 
      return this.get(this.keyAttribute);
    }
    
    get inheritAttribute() { 
      return `__inherit`;
    }
    
    get inherit() { 
      return this.get(this.inheritAttribute);
    }
    
    get fromAttribute() { 
      return `__from`;
    }
    
    get from() { 
      return this.get(this.fromAttribute);
    }
    
    get toAttribute() { 
      return `__to`;
    }
    
    get to() { 
      return this.get(this.toAttribute);
    }

    get url() {
      return (id => `${(this.collection || {}).url}${id}`)
        (this.isNew ? '' : `/${this.id}`);
    }
    
    get baseURL() {
      return (this.collection || {}).baseURL;
    }
    
    fetch(opts) {
      opts = Object.assign({ 'method': 'GET', 'parse': true }, opts);
      return this.sync(opts).then(({ result }) => 
        this.set(opts.parse ? this.parse(result, opts) : result, opts)
      );
    }

    save(attrs, val, opts) {
      attrs == null || 'object' === typeof(attrs) ?
      opts = val : (key => ((attrs = {})[key] = val))(attrs);
      
      opts = Object.assign({ 'validate': true, 'parse': true }, opts);
      
      if (attrs && !this.set(attrs, opts) ||!_validate(this, attrs, opts)) throw 'not validate';
      
      { 
        const 
          method = this.isNew ? 'POST' : opts.update ? 'PUT' : 'PATCH',
          [data, params] = [{}, {}],
          _data = Object.assign({ 'attrs': 'PATCH' === method ? this.changedAttrs() : this.attrs }, opts);
          
        for (const [key, val] of Object.entries(this.toJSON(_data))) {
          (this.isNew || !privAttrs.includes(key)) &&
          Reflect.set(data, key, val);
          // Reflect.set(privAttrs.includes(key) ? this.isNew && params || {} : data, key, val);
        }
        
        if (!(Object.keys(data).length + Object.keys(params).length)) {
          throw { 'message': 'not data to send' };
        }
        
        Object.assign(opts, { method, data, params });
      }

      return this.sync(opts).then(({ result }) => {
        this.set(result, opts);
        _setFlag(this, 'changing');
        _set(this, 'changed', {});
        return this;
      }).catch(err => console.log(err) || err);

    }
    
    toJSON(opts) {
      return Object.fromEntries(
        Object.entries(opts && opts.attrs || this.attrs).map(([k, v]) => 
          [privWord.reduce((a, b) => a || k === Reflect.get(this, `${b}Attribute`) && `_${b}`, '') || k, v]
        )
      );
    }
    
    parse(attrs, opts) {

      Reflect.has(opts, 'method') && 
      'GET' === Reflect.get(opts, 'method') && 
      Object.assign(attrs, Object.entries(attrs)
        .filter(([key, val]) => 'object' === typeof val)
        .reduce((acc, [key, val]) => Reflect.set(acc, key, new Model(val, opts)) && acc, {}));

      return attrs;
    }
    
    hasChanged(attr) {
      const changed = _get(this, 'changed');
      return attr ? Reflect.has(changed, attr) : !!Object.keys(changed).length;
    }
    
    changedAttrs(diff) {
      if (!diff) return Object.assign({}, _get(this, 'changed'));
    }
    
    sync(opts) {
      return super.sync(opts);
    }
    
  }
  
  const
    setOpts = { add: true, remove: true, merge: true },
    addOpts = { add: true, remove: false };

  class Collection extends Sync {
    
    constructor(opts) {
      super(opts);
      [
        'cids',  'ids', 'inherits', 'froms', 'tos'
      ].forEach(key => _set(this, key, new Map()));
    }
    
    has(obj) {
      return !!this.get(obj);
    }
    
    set(models, opts) {
      if (!models) return this;

      opts = Object.assign({}, setOpts, opts);
      if (opts.parse && !_isModel(models)) models = this.parse(models, opts);

      const
        { add, merge, remove, sync } = opts,
        [toAdd, toMerge, toRemove] = [[],[],[]];
      
      for (const model of Array.isArray(models) ? models : [models]) {
        const existing = this.get(model);
        
        if (existing) {
          if (merge) {
            
            const 
              attrs = _isModel(model) && model.toJSON(opts) || model, 
              exist = existing.toJSON(opts);
              
            if (!isEqual(exist, attrs)) toMerge.push(
              existing.set(Object.fromEntries(Object.entries(attrs).filter(([k, v]) => undefined !== v && exist[k] !== v)), opts)
            );
          }
        }
        
        else if (add) {
          const _model = this._prepareModel(model, opts);
          _addReference(this, _model, opts);
          toAdd.push(_model);
        }
  
      }
      
      if (remove) {
        const models = new Set(toMerge.concat(toAdd).map(({ cid }) => cid));
        _removeModels(this, Array.from(this.models).filter(m => !models.has(m.cid)));
      }

      return this;
    }
    
    get(obj) {
      return obj && (
        'string' === typeof obj ? 
        this.getById(obj) || this.getByCid(obj) :
        _isModel(obj) ? this.getByCid(obj.cid) : 
        ((id = _modelId(this, obj))=> id && this.getById(id))() || undefined
      ) || undefined;
    }
    
    getByCid(key) {
      return _get(this, 'cids').get(key);
    }
    
    getById(key) {
      return _get(this, 'ids').get(key);
    }
    
    getByInherit(key) {
      return _get(this, 'inherits').get(key);
    }
    
    getByFrom(key) {
      return _get(this, 'froms').get(key);
    }
    
    getByTo(key) {
      return _get(this, 'tos').get(key);
    }
    
    del(obj) {
      return ((_obj = this.get(obj)) => 
        !!_obj && (({ cid, id, inherit, from, to } = _obj) =>
          ((...a) => a.some(a => a))(
            cid && _get(this, 'cids').delete(cid),
            id && _get(this, 'ids').delete(id),
            inherit && _get(this, 'inherits').delete(inherit),
            from && _get(this, 'froms').delete(from),
            to && _get(this, 'tos').delete(to)
          )
        )()
      )();
    }
    
    add(models, opts) {
      return this.set(models, Object.assign({ 'merge': false }, opts, addOpts));
    }
    
    get model() {
      return Model;
    }
    
    get ids() {
      return _get(this, 'ids').keys();
    }
    
    get cids() {
      return _get(this, 'cids').keys();
    }
    
    get inherits() {
      return _get(this, 'inherits').keys();
    }
    
    get froms() {
      return _get(this, 'froms').keys();
    }
    
    get tos() {
      return _get(this, 'tos').keys();
    }
    
    get models() {
      return _get(this, 'cids').values();
    }
    
    get length() {
      return _get(this, 'cids').size;
    }
    
    get service() {
      throw { 'message': 'service should be defined' };
    }
    
    get url() {
      return this.service;
    }
    
    get length() {
      return _get(this, 'cids').size;
    }
    
    parse(resp, opts) {
      return resp;
    }
    
    fetch(opts = {}) {
      
      Reflect.has(opts, 'method') || Reflect.set(opts, 'method', 'GET');
      Reflect.has(opts, 'parse') || Reflect.set(opts, 'parse', true);
        
      return this.sync(opts).then(({ result }) => 
        this.set(opts.parse ? this.parse(result, opts) : result, opts)
      );
    }
    
    create(attrs, opts) {
      return this._prepareModel(attrs, opts).save(null, opts)
        .then(model => this.add(model, opts) && model);
    }
    
    toJSON(opts) {
      return Array.from(this.models).map(model => model.toJSON(opts));
    } 
    
    // add collection in model, if not model create new model with collection defined
    _prepareModel(attrs, opts) {
      return attrs && 
        _isModel(attrs) &&
        (_has(attrs, 'collection') || _set(attrs, 'collection', this)) && 
        attrs ||
        new this.model(attrs, Object.assign({ 'collection': this }, opts));
    }

  }
  
  return { uniqueId, Sync, Model, Collection };
  
});
