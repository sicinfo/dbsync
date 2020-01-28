/**
 * application: dbsync
 * powered by moreira
 */
/* global System */

if ('object' === typeof module && module.exports) {
  // const server = require('http').create(req, res)
  
} else {

Promise.all([
  System.import('https://cdn.jsdelivr.net/npm/mocha/mocha.js'),
  System.import('https://cdn.jsdelivr.net/npm/chai/chai.js'),
  // System.import('https://cdn.jsdelivr.net/npm/chai-as-promised/lib/chai-as-promised.js')
]).then(a => a.map(b => b.default || b))
  .then(([mocha, chai, chaiAsPromised]) => {
    mocha.setup({ 
      ui: 'bdd', 
      checkLeaks: true, 
      asyncOnly: true, 
      growl: true ,
      'globals': ['_']
    });
    
    // chai.use(chaiAsPromised);
    // chai.should();
    const { expect } = chai;
    
    describe('DBSync test suite', () => {

      describe('Model API', () => {
        
        describe('Model this id, key, from, to', () => {
  
          it('#id, key, from, to attributes with parse', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              (model => {
                expect(model.id).to.equal('id0', '#id should be "id0"');
                expect(model.key).to.equal('key0', '#key should be "key0"');
                expect(model.from).to.equal('from0', '#from should be "from0"');
                expect(model.to).to.equal('to0', '#to should be "to0"');
              })(new Model({ '_id': 'id0', '_key': 'key0', '_from': 'from0', '_to': 'to0' }, {'parse': true}));
            });
          });

          it('#id, key, from, to attributes with parse toJSON', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              const model = new Model(
                { '_id': 'id0', '_key': 'key0', '_from': 'from0', '_to': 'to0' }, 
                {'parse': true}).toJSON();
              expect(model._id).to.equal('id0', '#id should be "id0"');
              expect(model._key).to.equal('key0', '#key should be "key0"');
              expect(model._from).to.equal('from0', '#from should be "from0"');
              expect(model._to).to.equal('to0', '#to should be "to0"');
            });
          });
          
          it('#set attributes __id, __key, __from, __to toJSON', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              const model = new Model()
                .set('_id', 'id0')
                .set('_key', 'key0')
                .set('_from', 'from0')
                .set('_to', 'to0').toJSON();
              expect(model._id).to.equal('id0', '#id should be "id0"');
              expect(model._key).to.equal('key0', '#key should be "key0"');
              expect(model._from).to.equal('from0', '#from should be "from0"');
              expect(model._to).to.equal('to0', '#to should be "to0"');
            });
          });

          it('#toJSON()', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              const model = new Model()
                .set('nome', 'jose');
              expect(model.toJSON().nome).to.equal('jose', '#id should be "jose"');
            });
          });

          it('#set with isNew = false', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              const model = new Model({ '_id': 'a', '_key': 'a', '_from': 'a', '_to': 'a', '_inherit': 'a', 'e': 'a' });
              expect(model.isNew).to.be.false;
              model.set({ '_id': 'b', '_from': 'b', '_to': 'b', '_inherit': 'b', '_key': 'b', 'e': 'b' });
              expect(model.id).to.equal('a');
              expect(model.key).to.equal('a');
              expect(model.from).to.equal('b');
              expect(model.to).to.equal('b');
              expect(model.inherit).to.equal('b');
              expect(model.get('e')).to.equal('b');
              model.set({ '_id': 'c', '_from': 'c', '_to': 'c', '_inherit': 'c', '_key': 'c', 'e': 'c' }, { 'preserveKeys': true });
              expect(model.id).to.equal('a');
              expect(model.key).to.equal('a');
              expect(model.from).to.equal('b');
              expect(model.to).to.equal('b');
              expect(model.inherit).to.equal('b');
              expect(model.get('e')).to.equal('c');
            });
          });

          it('#set()', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              const model = new Model();
              model.set('nome', 'nome');
              expect(model.has('nome')).to.be.true;
              expect(model.get('nome')).to.equal('nome');
            });
          });

          it('#hasChanged() and changedAttrs', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              const model = new Model({ 'numero': 'um', 'nome': 'numero' });
              expect(model.hasChanged()).to.equal(false, 'should be false');
              model.set('numero', 'dois');
              expect(model.hasChanged()).to.equal(true, 'should be true');
              expect(model.hasChanged('numero')).to.equal(true, 'should be true');
              expect(model.hasChanged('nome')).to.equal(false, 'should be false');
              expect(Object.entries(model.changedAttrs())[0].join('')).to.equal('numerodois', 'should be array');
            });
          });

        });
        
        describe('Model: hasChanged', () => {
  
          it('#hasChanged(), geral e model novo (set e unset)', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              (model => {
                expect(model.hasChanged()).to.equal(false, 'novo');
                expect(model.set('nome', 'jose').hasChanged()).to.equal(true, 'incluido valor');
                expect(model.unset('nome').hasChanged()).to.equal(true, 'valor removido');
              })(new Model());
            });
          });
          
          it('#hasChanged(), específico e model iniciado (set e unset)', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              (model => {
                expect(model.hasChanged('nome')).to.equal(false, 'novo');
                expect(model.set('nome', 'jose').hasChanged('nome')).to.equal(true, 'alterado valor');
                expect(model.set('nome', 'maria').hasChanged('nome')).to.equal(true, 'volta valor original');
                expect(model.unset('nome').hasChanged('nome')).to.equal(true, 'valor removido');
              })(new Model({'nome':'maria'}));
            });
          });
          
          it('#hasChanged(), geral e model iniciado (set options: changing)', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              ((model, opts) => {
                expect(model.hasChanged()).to.equal(false, 'novo');
                expect(model.set('nome', 'jose', opts).hasChanged()).to.equal(true, 'alterado valor');
                expect(model.set('nome', 'maria', opts).hasChanged()).to.equal(false, 'volta valor original');
                expect(model.unset('nome', opts).hasChanged()).to.equal(true, 'valor removido');
              })(new Model({ 'nome': 'maria' }), { 'changing': true });
            });
          });
          
          it('#hasChanged(), geral e alternando set: options: changing)', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              ((model, opts) => {
                expect(model.hasChanged(), 'não existe mudança').to.be.false;
                expect(model.set('idade', 25, opts).hasChanged(), 'existe mudança').to.be.true;
                expect(model.set('nome', 'jose').hasChanged(), 'existe mudança').to.be.true;
                expect(model.set('nome', 'maria', opts).hasChanged()).to.equal(true, 'volta valor mas houve mudança original');
                expect(model.set('nome', 'jose', opts).hasChanged()).to.equal(false, 'volta valor da ultima mudança original');
                expect(model.set('idade', '15', opts).hasChanged()).to.equal(true, 'hoive mudança, acrescimo da idade');
              })(new Model({ 'nome': 'maria' }), { 'changing': true });
            });
          });
          
        });

        describe('Model: changedAttrs', () => {
  
          it('#changedAttrs()', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              ((model, opts) => {
                
                model.set('nome','jose', opts);
                expect(model.changedAttrs().nome).to.equal('jose', '#1 deve ser "jose"');
                expect(Object.keys(model.changedAttrs()).length).to.equal(1, '#1 size deve ser 1');
                
                
                model.set('idade',15, opts);
                expect(model.changedAttrs().nome).to.equal('jose', '#2 deve ser "jose"');
                expect(model.changedAttrs().idade).to.equal(15, '#3 deve ser 15');
                expect(Object.keys(model.changedAttrs()).length).to.equal(2, '#2 size deve ser 2');
                
                model.unset('idade', opts);
                expect(model.changedAttrs().nome).to.equal('jose');
                expect(model.changedAttrs().idade).to.be.undefined;
                expect(Object.keys(model.changedAttrs()).length).to.equal(1);
                
                model.set('idade', 15);
                expect(model.changedAttrs().nome, '#6 deve ser undefined').to.be.undefined;
                expect(model.changedAttrs().idade).to.equal(15, '#6 deve ser 15');
                expect(Object.keys(model.changedAttrs()).length).to.equal(1, '#4 size deve ser 1');

                model.set('nome', 'maria');
                expect(model.changedAttrs().nome).to.equal('maria', '#6 deve ser maria');
                expect(model.changedAttrs().idade, '#6 deve ser undefined').to.be.undefined;
                expect(Object.keys(model.changedAttrs()).length).to.equal(1, '#5 size deve ser 1');

              })(new Model(), { 'changing': true });
            });
          });
          
          it('#changedAttrs() with remind = false', function() {
            return System.import('dbsync').then(a => a.default).then(({ Model }) => {
              const model = new Model();
              model.set('nome', 'jose', { 'remind': false });
              expect(model.hasChanged()).to.be.false;
              expect(model.get('nome')).to.equal('jose');
            });
          });
          
        });

      });
      
      describe('Collection API', () => {
        
        describe('#set', function() {

          it('#with simple model ', function() {
            return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
              const collection = new Collection();
              const model = new Model(), cid = model.cid;
              expect(Object.is(collection.set(model), collection)).to.be.true;
              expect(collection.length).to.equal(1);
              expect(collection.set([new Model(), new Model()]).length).to.equal(2);
              expect(collection.set([new Model(), new Model()]).length).to.equal(2);
            });
          });
          
          it('#model set From, To, Inherit', function() {
            return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
              const collection = new Collection();
              const model = new Model({ '_id': 'x0', '_key': 'a0', '_inherit': 'b0', '_from': 'c0', '_to': 'd0', 'e': 'e0' });
              collection.set([
                  model,
                  {  '_id': 'x1', '_key': 'a1', '_from': 'c1', '_to': 'd1', 'e': 'e1' },
                  {  '_id': 'x2', '_key': 'a2', '_inherit': 'b2' }
                ]);
              expect(collection.length).to.equal(3);
              expect(Array.from(collection.models).length).to.equal(3);
              {
                const _keys = collection.ids;
                expect(_keys.next().value).to.equal('x0');
                expect(_keys.next().value).to.equal('x1');
                expect(_keys.next().value).to.equal('x2');
              }
              {
                const _keys = collection.inherits;
                expect(_keys.next().value).to.equal('b0');
                expect(_keys.next().value).to.equal('b2');
              }
              {
                const _keys = collection.froms;
                expect(_keys.next().value).to.equal('c0');
                expect(_keys.next().value).to.equal('c1');
              }
              {
                const _keys = collection.tos;
                expect(_keys.next().value).to.equal('d0');
                expect(_keys.next().value).to.equal('d1');
              }
            });
          });
          
        });

        describe('#get', function() {

          it('#with empty collection ', function() {
            return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
              const collection = new Collection();
              expect(collection.get(), 'without arg').to.be.undefined;
              expect(collection.get('a'), 'string').to.be.undefined;
              expect(collection.get({}), 'object empty').to.be.undefined;
              expect(collection.get({'__id':'a'}), 'object with __id').to.be.undefined;
              expect(collection.get(new Model()), 'model empty').to.be.undefined;
              expect(collection.get(new Model({'__id': 'a'})), 'model with __ids').to.be.undefined;
            });
          });
          
          it('#with one model in collection ', function() {
            return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
              const collection = new Collection();
              const model = new Model({'__id': 'a'}), cid = model.cid;
              collection.set(model);
              expect(collection.get(), 'without arg').to.be.undefined;
              expect(Object.is(collection.get('a'), model), 'id string').to.be.true;
              expect(Object.is(collection.get(cid), model), 'cid string').to.be.true;
              expect(collection.get({}), 'object empty').to.be.undefined;
              expect(Object.is(collection.get({'__id':'a'}), model), 'object with __id').to.be.true;
              // expect(Object.is(collection.get({'_id':'a'}), model), 'object with _id').to.be.true;
              expect(collection.get(new Model()), 'model empty').to.be.undefined;
              expect(Object.is(collection.get(model), model), 'with model').to.be.true;
              expect(collection.get(new Model({'__id': 'a'})), 'other model with __id').to.be.undefined;
              expect(Object.is(collection.set([new Model(), new Model()]).get(model), model), 'with model').to.be.false;
            });
          });
          
          it('#model get From, To, Inherit', function() {
            return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
              const collection = new Collection();
              const model = new Model({ '_id': 'x0', '_key': 'a0', '_inherit': 'b0', '_from': 'c0', '_to': 'd0', 'e': 'e0' });
              collection.set([
                  model,
                  {  '_id': 'x1', '_key': 'a1', '_from': 'c1', '_to': 'd1', 'e': 'e1' },
                  {  '_id': 'x2', '_key': 'a2', '_inherit': 'b2' }
                ]);
              expect(collection.get('x0').get('e')).to.equal('e0');
              expect(collection.getById('x1').get('e')).to.equal('e1');
              expect(collection.getByInherit('b2').id).to.equal('x2');
              expect(collection.getByFrom('c1').get('e')).to.equal('e1');
              expect(collection.getByTo('d1').get('e')).to.equal('e1');
            });
          });
          
        });
        
        describe('#del', function() {

          it('#with empty collection ', function() {
            return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
              const collection = new Collection();
              expect(collection.del(), 'without arg').to.be.false;
              expect(collection.del('a'), 'string').to.be.false;
              expect(collection.del({}), 'object empty').to.be.false;
              expect(collection.del({'__id':'a'}), 'object with __id').to.be.false;
              expect(collection.del(new Model()), 'model empty').to.be.false;
              expect(collection.del(new Model({'__id': 'a'})), 'model with __ids').to.be.false;
            });
          });

          it('#with model defined collection ', function() {
            return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
              const collection = new Collection();
              const model = new Model({'__id':'a'}), { id, cid } = model;
              
              expect(collection.length).to.equal(0, '#with empty collection');
              
              expect(collection.set(model).del('a'), 'string').to.be.true;
              expect(collection.length).to.equal(0, '#string length equal 0');
              
              expect(collection.set(model).del(id), '#string id').to.be.true;
              expect(collection.length).to.equal(0, '#string id length equal 0');

              expect(collection.set(model).del(cid), '#string cid').to.be.true;
              expect(collection.length).to.equal(0, '#string cid length equal 0');


              expect(collection.del({}), 'object empty').to.be.false;
              expect(collection.set(model).del({'__id':'a'}), 'object with __id').to.be.true;
              expect(collection.length).to.equal(0, '#object with __id length equal 0');

              expect(collection.set(model).del(model), 'with model').to.be.true;
              expect(collection.length).to.equal(0, '#object with model length equal 0');

              expect(collection.set(model).del(new Model()), 'with new model').to.be.false;
              expect(collection.length).to.equal(1, '#object with model length equal 1');
              
              expect(collection.set(new Model({'__id':'a'})).del(new Model({'__id':'a'})), 'with new model').to.be.false;
              expect(collection.length).to.equal(1);
            });
          });
          
          it('#model del From, To, Inherit', function() {
            return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
              const collection = new Collection();
              const model = new Model({ '_id': 'x0', '_key': 'a0', '_inherit': 'b0', '_from': 'c0', '_to': 'd0', 'e': 'e0' });
              collection.set([
                  model,
                  {  '_id': 'x1', '_key': 'a1', '_from': 'c1', '_to': 'd1', 'e': 'e1' },
                  {  '_id': 'x2', '_key': 'a2', '_inherit': 'b2' }
                ]);
              expect(collection.del('x0')).to.be.true;
              expect(collection.get('x0')).to.be.undefined;
              expect(collection.getByInherit('b2').id).to.equal('x2');
            });
          });
          

        });

        describe('#toJSON()', function() {

          it('#with empty collection ', function() {
            return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
              expect(new Collection().set(new Model({'nome': 'jose'})).toJSON()[0].nome).to.equal('jose', '#1');
            });
          });
          
        });
        
      });

    });
    
    mocha.run();
    
  });

}