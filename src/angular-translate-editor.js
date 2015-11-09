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
	      basePath: '=',       // xPath query to automatically prepend as root
	      languages: '=',      // array of allowable locales
	      translations: '=',   // dictionary of language-translations
	      queries: '='         // predefined queries to build buttons on
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

	  // bindable variables
	  vm.bindings = {};        // stores results of xPath query
	  vm.xmlDefinitions = {};  // xml equivalents of translation jsons
	  vm.hasError = false;     // boolean determining whether there was a query error

	  // bindable methods
	  vm.updateObject = updateObject;
	  vm.writeObjectByKey = writeObjectByKey;
	  vm.deleteObjectByKey = deleteObjectByKey;
	  vm.updateTranslations = updateTranslations;
	  vm.findByKey = findByKey;

	  init();

	  ////////////////////////////////////////////////////////////////////////////

	  /**
	   * Private Methods
	   */

	  function init() {
	    _.each(vm.languages, function (lang) {
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
	  	console.log(curr);
	  	console.log(orig);
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
	    curr[vm.newKey] = form.newValue;
	    // update json in preview
	    form.value = curr;
	    curr = null;

	    // check other languages for key and fill with value if not exists
	    _.each(_.without(vm.languages, form.lang), function (language) {
	      curr = traverseObject(vm.translations[language], form.path);
	      if (!_.has(curr, vm.newKey)) {
	        curr[vm.newKey] = form.newValue;
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
	  function deleteObjectByKey(form, key) {
	    _.each(vm.languages, function (language) {
	      var curr = traverseObject(vm.translations[language], form.path);
	      // set new key value
	      delete curr[key];
	      _.map(vm.bindings[language].forms, function (form) {
	        // update json in preview
	        form.value = curr;
	      });
	    });
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
	                return _.isString(value);
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
	}
})();
