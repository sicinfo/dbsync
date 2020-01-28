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
    
    // describe('DBSync test suite', () => {

      // describe('Model functions internal', () => {

      // });
      
      // describe('Model API', () => {
        
        // describe('Model this id, key, from, to', () => {
  
        //   it('#id, key, from, to attributes with parse', function() {
        //     return System.import('dbsync').then(a => a.default).then(({ Model }) => {
        //       (model => {
        //         expect(model.id).to.equal('id0', '#id should be "id0"');
        //         expect(model.key).to.equal('key0', '#key should be "key0"');
        //         expect(model.from).to.equal('from0', '#from should be "from0"');
        //         expect(model.to).to.equal('to0', '#to should be "to0"');
        //       })(new Model({ '_id': 'id0', '_key': 'key0', '_from': 'from0', '_to': 'to0' }, {'parse': true}));
        //     });
        //   });

        //   it('#id, key, from, to attributes with parse toJSON', function() {
        //     return System.import('dbsync').then(a => a.default).then(({ Model }) => {
        //       const model = new Model(
        //         { '_id': 'id0', '_key': 'key0', '_from': 'from0', '_to': 'to0' }, 
        //         {'parse': true}).toJSON();
        //       expect(model._id).to.equal('id0', '#id should be "id0"');
        //       expect(model._key).to.equal('key0', '#key should be "key0"');
        //       expect(model._from).to.equal('from0', '#from should be "from0"');
        //       expect(model._to).to.equal('to0', '#to should be "to0"');
        //     });
        //   });

        //   it('#set()', function() {
        //     return System.import('dbsync').then(a => a.default).then(({ Model }) => {
        //       const model = new Model();
        //       model.set('nome', 'nome');
        //       expect(model.get('nome')).to.equal('nome', 'should be "nome"');
        //     });
        //   });

        //   it('#hasChanged() and changedAttrs', function() {
        //     return System.import('dbsync').then(a => a.default).then(({ Model }) => {
        //       const model = new Model({ 'numero': 'um', 'nome': 'numero' });
        //       expect(model.hasChanged()).to.equal(false, 'should be false');
        //       model.set('numero', 'dois');
        //       expect(model.hasChanged()).to.equal(true, 'should be true');
        //       expect(model.hasChanged('numero')).to.equal(true, 'should be true');
        //       expect(model.hasChanged('nome')).to.equal(false, 'should be false');
        //       expect(Array.from(model.changedAttrs())[0].join('')).to.equal('numerodois', 'should be array');
        //     });
        //   });

        // });
        
        // describe('Model: hasChanged', () => {
  
        //   it('#hasChanged(), geral e model novo (set e unset)', function() {
        //     return System.import('dbsync').then(a => a.default).then(({ Model }) => {
        //       (model => {
        //         expect(model.hasChanged()).to.equal(false, 'novo');
        //         expect(model.set('nome', 'jose').hasChanged()).to.equal(true, 'incluido valor');
        //         expect(model.unset('nome').hasChanged()).to.equal(true, 'valor removido');
        //       })(new Model());
        //     });
        //   });
          
        //   it('#hasChanged(), específico e model iniciado (set e unset)', function() {
        //     return System.import('dbsync').then(a => a.default).then(({ Model }) => {
        //       (model => {
        //         expect(model.hasChanged('nome')).to.equal(false, 'novo');
        //         expect(model.set('nome', 'jose').hasChanged('nome')).to.equal(true, 'alterado valor');
        //         expect(model.set('nome', 'maria').hasChanged('nome')).to.equal(true, 'volta valor original');
        //         expect(model.unset('nome').hasChanged('nome')).to.equal(true, 'valor removido');
        //       })(new Model({'nome':'maria'}));
        //     });
        //   });
          
        //   it('#hasChanged(), geral e model iniciado (set options: changing)', function() {
        //     return System.import('dbsync').then(a => a.default).then(({ Model }) => {
        //       ((model, opts) => {
        //         expect(model.hasChanged()).to.equal(false, 'novo');
        //         expect(model.set('nome', 'jose', opts).hasChanged()).to.equal(true, 'alterado valor');
        //         expect(model.set('nome', 'maria', opts).hasChanged()).to.equal(false, 'volta valor original');
        //         expect(model.unset('nome', opts).hasChanged()).to.equal(true, 'valor removido');
        //       })(new Model({ 'nome': 'maria' }), { 'changing': true });
        //     });
        //   });
          
        //   it('#hasChanged(), geral e alternando set: options: changing)', function() {
        //     return System.import('dbsync').then(a => a.default).then(({ Model }) => {
        //       ((model, opts) => {
        //         expect(model.hasChanged(), 'não existe mudança').to.be.false;
        //         expect(model.set('idade', 25, opts).hasChanged(), 'existe mudança').to.be.true;
        //         expect(model.set('nome', 'jose').hasChanged(), 'existe mudança').to.be.true;
        //         expect(model.set('nome', 'maria', opts).hasChanged()).to.equal(true, 'volta valor mas houve mudança original');
        //         expect(model.set('nome', 'jose', opts).hasChanged()).to.equal(false, 'volta valor da ultima mudança original');
        //         expect(model.set('idade', '15', opts).hasChanged()).to.equal(true, 'hoive mudança, acrescimo da idade');
        //       })(new Model({ 'nome': 'maria' }), { 'changing': true });
        //     });
        //   });
          
        // });

        // describe('Model: changedAttrs', () => {
  
        //   it('#changedAttrs()', function() {
        //     return System.import('dbsync').then(a => a.default).then(({ Model }) => {
        //       ((model, opts) => {
                
        //         model.set('nome','jose', opts);
        //         expect(Object.fromEntries(model.changedAttrs()).nome).to.equal('jose', '#1 deve ser "jose"');
        //         expect(Array.from(model.changedAttrs()).length).to.equal(1, '#1 size deve ser 1');
                
                
        //         model.set('idade',15, opts);
        //         expect(Object.fromEntries(model.changedAttrs()).nome).to.equal('jose', '#2 deve ser "jose"');
        //         expect(Object.fromEntries(model.changedAttrs()).idade).to.equal(15, '#3 deve ser 15');
        //         expect(Array.from(model.changedAttrs()).length).to.equal(2, '#2 size deve ser 2');
                
        //         model.unset('idade', opts);
        //         expect(Object.fromEntries(model.changedAttrs()).nome).to.equal('jose', '#4 deve ser "jose"');
        //         expect(Object.fromEntries(model.changedAttrs()).idade, '#5 deve ser undefined').to.be.undefined;
        //         expect(Array.from(model.changedAttrs()).length).to.equal(1, '#3 size deve ser 1');
                
        //         model.set('idade', 15);
        //         expect(Object.fromEntries(model.changedAttrs()).nome, '#6 deve ser undefined').to.be.undefined;
        //         expect(Object.fromEntries(model.changedAttrs()).idade).to.equal(15, '#6 deve ser 15');
        //         expect(Array.from(model.changedAttrs()).length).to.equal(1, '#4 size deve ser 1');

        //         model.set('nome', 'maria');
        //         expect(Object.fromEntries(model.changedAttrs()).nome).to.equal('maria', '#6 deve ser maria');
        //         expect(Object.fromEntries(model.changedAttrs()).idade, '#6 deve ser undefined').to.be.undefined;
        //         expect(Array.from(model.changedAttrs()).length).to.equal(1, '#5 size deve ser 1');

        //       })(new Model(), { 'changing': true });
        //     });
        //   });
          
        // });

      // });
      
      // describe('Collection libs internal', () => {

      //   it('Collection static _isModel', function() {
      //     return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //       expect(Collection._isModel(new Model())).to.equal(true, 'deve ser instancia de Model');
      //     });
      //   });
        
      //   describe('Collection this _modelId', () => {
  
      //     it('#id - with attrs ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         expect(new Collection()._modelId({})).to.equal(undefined, 'deve ser undefined!');
      //         expect(new Collection()._modelId()).to.equal(undefined, 'deve ser undefined!');
      //         expect(new Collection()._modelId({'__id': 'id0'})).to.equal('id0', 'deve ser igual "id0"');
      //         (collection => {
      //           expect(collection._modelId({'id': 'id1'})).to.equal('id1', 'deve ser igual "id1"');
      //           expect(collection._modelId({'__id': 'id2'})).to.equal('id2', 'deve ser igual "id2"');
      //         })(new (class extends Collection {
      //           get model() {
      //             return class extends Model {
      //               get idAttribute() { return 'id' }
      //             };
      //           }
      //         })());
      //       });
      //     });

      //   });

      //   describe('Collection this _prepareModel', () => {
  
      //     it('#with attrs ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         expect(new Collection()._prepareModel()).to.be.an.instanceof(Model, 'should be an instance of Model');
      //         const collection = new Collection();
      //         const model = collection._prepareModel();
      //         expect(Object.is(model.collection, collection)).to.equal(true, 'should be fixed collection attribute');
      //       });
      //     });
          
      //     it('#with model ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         ((collection) => {
      //           expect(collection._prepareModel(new Model())).to.be.an.instanceof(Model, 'should be an instance of Model');
      //           expect(collection._prepareModel(new Model()).collection).to.equal(collection, 'should be fixed collection attribute');
      //         })(new Collection());
      //       });
      //     });

      //   });
        
      //   describe('Collection this _addReference', () => {
  
      //     it('#without id ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         ((collection, model) => {
      //           collection._addReference(model);
      //           expect(collection.get(model.cid)).to.deep.equal(model, 'deve ser igual ao model');
      //           expect(collection.get(model).cid).to.deep.equal(model.cid, 'deve ser igual ao model');
      //           expect(collection.get(model.id)).to.equal(undefined, 'deve ser undefined');
      //         })(new Collection(), new Model());
      //       });
      //     });
          
      //     it('#with id ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         ((collection, model) => {
      //           collection._addReference(model);
      //           expect(collection.get(model.cid)).to.deep.equal(collection.get(model.id), 'devem ser iguais');
      //           expect(collection.get(model.cid).id).to.equal('id0', 'deve ser igual "id0"');
      //           expect(collection.get(model).id).to.equal('id0', 'deve ser igual "id0"');
      //         })(new Collection(), new Model({'__id': 'id0'}));
      //       });
      //     });
          
      //   });
        
      //   describe('Collection this _removeReference', () => {
  
      //     it('#without id ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         ((collection) => {
      //           const model = collection._prepareModel(new Model({ __id: 'id0' }));
      //           collection._addReference(model);
      //           expect(Object.is(collection.get(model.cid), model)).to.equal(true, '#cid - deve ser igual ao model');
      //           expect(Object.is(collection.get(model.id), model)).to.equal(true, '#id - deve ser igual ao model');
      //           expect(Object.is(model.collection, collection)).to.equal(true, 'deve ser igual ao collection');
      //           collection._removeReference(model);
      //           expect(collection.get(model.cid)).to.equal(undefined, '#cid - deve ser undefined');
      //           expect(model.collection).to.equal(undefined, 'collection deve ser undefined');
      //         })(new Collection());
      //       });
      //     });
          
      //     it('#with id ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         ((collection, model) => {
      //           collection._addReference(model);
      //           expect(collection.get(model.cid)).to.deep.equal(collection.get(model.id), 'devem ser iguais');
      //           expect(collection.get(model.cid).id).to.equal('id0', 'deve ser igual "id0"');
      //           expect(collection.get(model).id).to.equal('id0', 'deve ser igual "id0"');
      //         })(new Collection(), new Model({'__id': 'id0'}));
      //       });
      //     });
          
      //   });
        
      //   describe('Collection this _removeModels', () => {
  
      //     it('#without id ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         ((collection) => {
      //           // const model = collection._prepareModel(new Model({ __id: 'id0' }));
      //           // collection._addReference(model);
      //           // expect(Object.is(collection.get(model.cid), model)).to.equal(true, '#cid - deve ser igual ao model');
      //           // expect(Object.is(collection.get(model.id), model)).to.equal(true, '#id - deve ser igual ao model');
      //           // expect(Object.is(model.collection, collection)).to.equal(true, 'deve ser igual ao collection');
      //           // collection._removeReference(model);
      //           // expect(collection.get(model.cid)).to.equal(undefined, '#cid - deve ser undefined');
      //           // expect(model.collection).to.equal(undefined, 'collection deve ser undefined');
      //         })(new Collection());
      //       });
      //     });
          
      //     it('#with id ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         ((collection, model) => {
      //           // collection._addReference(model);
      //           // expect(collection.get(model.cid)).to.deep.equal(collection.get(model.id), 'devem ser iguais');
      //           // expect(collection.get(model.cid).id).to.equal('id0', 'deve ser igual "id0"');
      //           // expect(collection.get(model).id).to.equal('id0', 'deve ser igual "id0"');
      //         })(new Collection(), new Model({'__id': 'id0'}));
      //       });
      //     });
          
      //   });
        

      // });
      
      // describe('Collection API', () => {
        
      //   describe('Collection this.get', function() {

      //     it('#with null arg ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         const collection = new Collection();
      //         expect(collection.get()).to.equal(undefined, 'should be undefined');
      //       });
      //     });

      //     it('#with string arg ', function() {
      //       return System.import('dbsync').then(a => a.default).then(({ Collection, Model }) => {
      //         const model = new Collection()._prepareModel();
      //         model.collection._addReference(model);
      //         expect(Object.is(model.collection.get(model.cid), model)).to.equal(true, 'should be same model');
      //       });
      //     });

      //   });

      // });

    // });
    
    mocha.run();
    
  });

}