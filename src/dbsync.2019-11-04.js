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
    
    fetch(opts = {}) {
      return axios(assign({ 'url': `${this.baseURL}/${this.url}` }, opts))
        .then(({ data }) => data)
        .catch(({response, message}) => {
          if ('Unauthorized' === response.statusText) localStorage.removeItem('authorization');
          alert(`${message} \n ${response.data}`);
        });
    }
  }
  
  const 
    privKeys = new Set(['id','key']),
    privWord = new Set(Array.from(privKeys).concat('from', 'to')),
    privAttrs = new Set(Array.from(privWord).map(a => `_${a}`));
    
  class Model extends Sync {
    
    constructor(attrs, opts = {}) {
      super(opts);
      _set(this, 'attrs', new Map());
      if (attrs) this.set(opts.parse ? this.parse(attrs, opts) : attrs, opts);
      _set(this, 'changed', new Map());
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
        _privKeys = !this.isNew && new Set(Array.from(privKeys).map(a => this[`${a}Attribute`])),
        changing = !!_get(this, 'changing');

      _set(this, 'changing', true);
      
      if (!changing) {
        _set(this, 'preventAttrs', new Map(this.attrs));
        _set(this, 'changed', new Map());
      }
      
      const 
        _attrs = _get(this, 'attrs'),
        _prev = _get(this, 'preventAttrs'),
        _changed = _get(this, 'changed');

      Object.entries(attrs)
        // modifica os attributos privados para corresponder
        .map(([key, val]) => [privAttrs.has(key) && this[`${key.slice(1)}Attribute`] || key, val])
        // nao alterar id e key se nao for novo registro
        .filter(([attr, val]) => !(_privKeys && _privKeys.has(attr)))
        .filter(([attr, val]) => {

          if (!isEqual(_prev.get(attr), val)) _changed.set(attr, val);
          else if (_changed.get(attr)) _changed.delete(attr);

          unset ? _attrs.delete(attr) : _attrs.set(attr, val);
        });

      if (changing) return this;
      
      _set(this, 'changing', false);

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
      return (privWord => Object.fromEntries(Array.from(this.attrs)
          .map(([k, v]) => [privWord.reduce((a, b) => a || k === this[`${b}Attribute`] && `_${b}`, ''), v]))
        )(Array.from(privWord));
    }
    
    parse(attrs, opts) {
      return attrs;
    }
    
    hasChanged(attr) {
      return (a => attr ? a.has(attr) : !!a.size)(_get(this, 'changed'));
    }
    
    changedAttrs(diff) {
      if (!diff) return this.hasChanged() && _get(this, 'changed').entries();
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
      if (opts.parse && !Collection._isModel(models)) models = this.parse(models, opts);

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
        
        else if (add) (model => {
          this._addReference(model, opts);
          toAdd.push(model);
        })(this._prepareModel(model, opts));
  
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
      return _get(this, 'cids').size;
    }
    
    parse(resp, opts) {
      return resp;
    }
    
    fetch(opts) {
      opts = assign({ 'method': 'GET', 'parse': true }, opts);
      return super.fetch(opts).then(({ result }) => {
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
