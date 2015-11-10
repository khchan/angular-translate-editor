(function() {
	'use strict';
	angular
	  .module('khchan.translate-editor', ['ui.bootstrap', 'angular-translate-templates'])
	  .directive('translateEditor', translateEditor)
	  .controller('TranslateEditorController', TranslateEditorController);

	translateEditor.$inject = [];
	TranslateEditorController.$inject = ['$scope'];

	function translateEditor() {
	  return {
	    restrict: 'E',
	    scope: {
	      languages: '=',      // array of allowable locales
	      translations: '=',   // dictionary of language-translations
	      queries: '=',        // predefined queries to build buttons on
	      onUpdate: '=',			 // callback on update one
	      onRemove: '='				 // callback on remove one
	    },
	    replace: true,
	    templateUrl: 'translate-editor.tpl.html',
	    controller: 'TranslateEditorController',
	    controllerAs: 'locale',
	    bindToController: true
	  };
	}

	function TranslateEditorController($scope) {
	  var vm = this;

	  // from directive
	  vm.languages = vm.languages || [];
	  vm.translations = vm.translations || {};
	  vm.queries = vm.queries || [];
	  vm.onUpdate = vm.onUpdate || angular.noop();
	  vm.onRemove = vm.onRemove || angular.noop();

	  // bindable variables
	  vm.tabs = {};
	  vm.insertNewObject = {};
	  vm.bindings = {};        // stores results of xPath query
	  vm.xmlDefinitions = {};  // xml equivalents of translation jsons
	  vm.hasError = false;     // boolean determining whether there was a query error

	  // bindable methods
	  vm.isEmpty = _.isEmpty;
	  vm.isString = _.isString;
	  vm.updateObject = updateObject;
	  vm.writeObjectByKey = writeObjectByKey;
	  vm.deleteObjectByKey = deleteObjectByKey;
	  vm.updateTranslations = updateTranslations;
	  vm.findByKey = findByKey;
	  vm.callbackUpdate = callbackUpdate;
	  vm.callbackRemove = callbackRemove;

	  init();

	  ////////////////////////////////////////////////////////////////////////////

	  /**
	   * Private Methods
	   */

	  function init() {
	    _.each(vm.languages, function (lang) {
	    	vm.insertNewObject[lang] = false;
	    	vm.tabs[lang] = {
	    		$isOpen: true
	    	};
	      vm.bindings[lang] = {
	        forms: []
	      };
	      vm.xmlDefinitions[lang] = JSON.toXML(vm.translations[lang]);
	    });
	  }

	  function syncJsonToXML() {
	    _.each(vm.languages, function (lang) {
	      vm.xmlDefinitions[lang] = JSON.toXML(vm.translations[lang]);
	    });
	  }

	  function clearBindings() {
	    _.each(vm.languages, function (lang) {
	      vm.bindings[lang].forms = [];
	    });
	  }

	  function isFlat(object) {
	  	return _.all(object, function (value, key) {
        return _.isString(value);
      });
	  }

	  function traverseObject(object, path) {
	    var curr = object;
	    _.each(path, function (key) {
	      curr = curr[key];
	    });
	    return curr;
	  }

	  function getPathToNode(node, path) {
	    path = path || [];
	    if (node.parentNode) {
	      path = getPathToNode(node.parentNode, path);
	    }

	    if (node.previousSibling) {
	      var count = 1;
	      var sibling = node.previousSibling;
	      do {
	        if (sibling.nodeType == 1 && sibling.nodeName == node.nodeName) { count++; }
	        sibling = sibling.previousSibling;
	      } while(sibling);
	      if (count == 1) { count = null; }
	    } else if(node.nextSibling) {
	      var nextSibling = node.nextSibling;
	      do {
	        if (nextSibling.nodeType == 1 && nextSibling.nodeName == node.nodeName) {
	          nextSibling = null;
	        } else {
	          nextSibling = nextSibling.previousSibling;
	        }
	      } while(nextSibling);
	    }

	    if (node.nodeType == 1) {
	      path.push(node.nodeName);
	    }
	    return path;
	  }

	  /**
	   * Public Methods
	   */

	  $scope.$watch(function() {
	  	return vm.languages;
	  }, function (curr, orig) {
	  	if (curr != orig) {
	  		init(); // re-initialize bindings when languages are added/removed
	  	}
	  }, true);

	  /**
	   * updateObject
	   * @description Given a flat json object, updates and syncs a particular key/value pair
	   */
	  function updateObject(object, form, key, value) {
	    var curr = traverseObject(object, form.path);
	    curr[key] = value;
	    form.value = curr;
	    curr = null;

	    // sync changed json back to xml model
	    syncJsonToXML();
	  }

	  /**
	   * writeObjectByKey
	   * @description Writes a new value to an object by traversing down through a path
	   *              then writes a value given a key
	   */
	  function writeObjectByKey(object, form) {
	    // update for form in current language
	    var curr = traverseObject(object, form.path);
	    // set new key value
	    curr[vm.newKey] = (vm.insertNewObject[form.lang]) ? {} : form.newValue;
	    // update json in preview
	    form.value = curr;
	    curr = null;

	    // check other languages for key and fill with value if not exists
	    _.each(_.without(vm.languages, form.lang), function (language) {
	      curr = traverseObject(vm.translations[language], form.path);
	      if (!_.has(curr, vm.newKey)) {
	        curr[vm.newKey] = (vm.insertNewObject[form.lang]) ? {} : form.newValue;
	        _.map(vm.bindings[language].forms, function (form) {
	          // update json in preview
	          form.value = curr;
	        });
	      }
	    });

	    // clear inputs
	    delete vm.newKey;
	    delete form.newValue;

	    // sync changed json back to xml model
	    syncJsonToXML();
	  }

	  /**
	   * deleteObjectByKey
	   * @description Deletes a value given a key in a flat json object
	   */
	  function deleteObjectByKey(inputForm, key) {
	    _.each(vm.languages, function (language) {
	    	var curr;
	    	if (!key) {
					curr = traverseObject(vm.translations[language], inputForm.path.slice(0, -1));
		      // set new key value
		      delete curr[_.last(inputForm.path)];
	    	} else {
		    	curr = traverseObject(vm.translations[language], inputForm.path);
		      // set new key value
		      delete curr[key];
	    	}

	    	_.map(vm.bindings[language].forms, function (form) {
	      	if (form.label == inputForm.label) {
		      	// update json in preview
		        form.value = curr;
	      	}
	      });
	    });

	    if (!key) { // if no key given, removing empty object and reset
	    	delete vm.search;
	    	init();
	    }

	    // sync changed json back to xml model
	    syncJsonToXML();
	  }

	  function updateTranslations(form) {
	    form.element.innerHTML = form.value;
	    var updatedJSON = Defiant.node.toJSON(vm.xmlDefinitions[form.lang]);
	    angular.copy(updatedJSON, vm.translations[form.lang]);
	  }

	  /**
	   * findByKey
	   * @description Main query function for evaluating xPath queries against
	   *              JSON translation objects.
	   */
	  function findByKey(query) {
	    delete vm.newKey;
	    if (!query) {
	      vm.hasError = false;
	      clearBindings();
	    } else {
	      try {
	        query = angular.uppercase(query);
	        _.each(vm.languages, function (lang) {
	          vm.bindings[lang].forms = [];
	          var nodes = Defiant.node.selectNodes(vm.xmlDefinitions[lang], query);
	          _.each(nodes, function (node, idx) {
	            var nodeVal = Defiant.node.toJSON(node);
	            var path = getPathToNode(node).slice(1);
	            var form = {
	              lang: lang,
	              label: path.join("."),
	              path: path,
	              hasInput: (typeof node !== 'object'),
	              isFlat: _.all(nodeVal, function (value, key) {
	                return isFlat(value);
	              }),
	              value: nodeVal,
	              element: node
	            };
	            // only allow non array/objects to be editable
	            form.hasInput = (typeof nodeVal != 'object');
	            vm.bindings[lang].forms.push(form);
	          });
	          vm.hasError = false;
	        });
	      } catch(err) { // query invalid, so clear bindings
	        vm.hasError = true;
	        clearBindings();
	      }
	    }
	  }

	  /**
	   * callbackUpdate
	   * @description Invokes callback function to update specific language translations
	   */
	  function callbackUpdate(language, event) {
	  	if (event) {
				event.preventDefault();
				event.stopPropagation();
			}
	  	return vm.onUpdate(language);
	  }

	  /**
	   * callbackRemove
	   * @description Invokes callback function to remove specific language translations
	   */
	  function callbackRemove(language, event) {
	  	if (event) {
				event.preventDefault();
				event.stopPropagation();
			}
	  	return vm.onRemove(language);
	  }
	}
})();
