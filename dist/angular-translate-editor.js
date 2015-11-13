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
	    	basePath: '@',			 // initial base path to pre-load search
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
	  vm.basePath = vm.basePath || "";
	  vm.languages = vm.languages || [];
	  vm.translations = vm.translations || {};
	  vm.queries = vm.queries || [];
	  vm.hasUpdateFn = _.isFunction(vm.onUpdate);
	  vm.hasRemoveFn = _.isFunction(vm.onRemove);
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
	  vm.collapseAll = collapseAll;
	  vm.isFavourited = isFavourited;
	  vm.addFavourite = addFavourite;
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
	    		$isOpen: false
	    	};
	      vm.bindings[lang] = {
	        forms: []
	      };
	      vm.xmlDefinitions[lang] = JSON.toXML(vm.translations[lang]);
	    });
	    if (!_.isEmpty(vm.basePath)) {
	      vm.search = vm.basePath;
	      findByKey(vm.basePath);
	    }
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

	  function collapseAll() {
	  	_.each(vm.languages, function (language) {
				vm.tabs[language].$isOpen = vm.isAllCollapsed;
	  	});
	  }

	  function isFavourited(query) {
	  	return _.contains(_.pluck(vm.queries, 'search'), query);
	  }

	  function addFavourite(query) {
	  	if (isFavourited(query)) {
	  		vm.queries = _.reject(vm.queries, { search: query });
	  	} else {
	  		var label = prompt("Please enter a label: ", query);
	  		if (!_.isEmpty(label)) {
	  			vm.queries.push({
	  				label: label,
	  				search: query
	  			});
	  		}
	  	}
	  }

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

angular.module("angular-translate-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("translate-editor.tpl.html","<div><div class=\"form-group\" ng-class=\"{ \'has-error\': locale.hasError }\"><div class=\"input-group\"><input type=\"text\" class=\"form-control\" ng-model=\"locale.search\" ng-change=\"locale.findByKey(locale.search)\" ng-model-options=\"{ debounce: 500 }\" placeholder=\"Enter xPath Query Here\"><div class=\"input-group-btn\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"locale.addFavourite(locale.search)\"><span class=\"glyphicon\" ng-class=\"{\n						\'glyphicon-star\': !locale.isFavourited(locale.search),\n						\'glyphicon-star-empty\': locale.isFavourited(locale.search)\n					}\"></span></button></div></div><small ng-if=\"locale.hasError\" class=\"pull-right text-danger\">Invalid Query!</small></div><button type=\"button\" class=\"btn btn-default btn-sm\" ng-repeat=\"query in locale.queries\" ng-click=\"locale.findByKey(query.search); locale.search = query.search;\">{{query.label}}</button><div class=\"checkbox pull-right\"><label><input type=\"checkbox\" ng-model=\"locale.isAllCollapsed\" ng-change=\"locale.collapseAll()\"> Expand All</label></div><hr><accordion ng-if=\"!locale.hasError\" close-others=\"false\"><accordion-group ng-repeat=\"language in locale.languages track by language\" is-open=\"locale.tabs[language].$isOpen\"><accordion-heading>{{language | uppercase}} Dictionary <i class=\"glyphicon\" ng-class=\"{\'glyphicon-chevron-down\': locale.tabs[language].$isOpen, \'glyphicon-chevron-right\': !locale.tabs[language].$isOpen}\"></i><div class=\"pull-right\"><button type=\"button\" tabindex=\"-1\" class=\"btn btn-info btn-xs\" ng-if=\"locale.hasUpdateFn\" ng-click=\"locale.callbackUpdate(language, $event)\">Update</button> <button type=\"button\" tabindex=\"-1\" class=\"btn btn-danger btn-xs\" ng-if=\"locale.hasRemoveFn\" ng-click=\"locale.callbackRemove(language, $event)\">Remove</button></div></accordion-heading><div class=\"form-group\" ng-repeat=\"form in locale.bindings[language].forms\"><div ng-if=\"form.hasInput\"><label>{{form.label}}:</label><input type=\"text\" class=\"form-control input-sm\" ng-model=\"form.value\" ng-change=\"locale.updateTranslations(form)\" ng-model-options=\"{ debounce: 500 }\"></div><div ng-if=\"!form.hasInput\"><div ng-if=\"locale.isEmpty(form.value)\"><button type=\"button\" tabindex=\"-1\" class=\"btn btn-warning btn-sm pull-right\" ng-click=\"locale.deleteObjectByKey(form)\">Remove Empty Object</button></div><div class=\"panel panel-default\"><div class=\"panel-body\"><div ng-if=\"form.isFlat\"><div class=\"form-group\" ng-repeat=\"(key, value) in form.value\"><label>{{form.label}}.{{key}}</label><div ng-if=\"locale.isString(value)\" class=\"input-group\"><input type=\"text\" class=\"form-control input-sm\" ng-model=\"value\" ng-change=\"locale.updateObject(locale.translations[language], form, key, value)\" ng-model-options=\"{ debounce: 500 }\"><pre ng-if=\"!locale.isString(value)\">{{value | json}}</pre><span class=\"input-group-btn\"><button type=\"button\" tabindex=\"-1\" class=\"btn btn-warning btn-sm\" ng-click=\"locale.deleteObjectByKey(form, key)\">Delete</button></span></div><div ng-if=\"!locale.isString(value)\"><pre>{{value | json}}</pre><button type=\"button\" tabindex=\"-1\" class=\"btn btn-warning btn-sm\" ng-click=\"locale.deleteObjectByKey(form, key)\">Delete</button></div></div></div><pre ng-if=\"!form.isFlat\">{{form.value | json}}</pre></div><div class=\"panel-footer\"><div class=\"row\"><div class=\"col-md-4\"><label>{{form.label}}.{{locale.newKey}}</label><input type=\"text\" class=\"form-control input-sm\" ng-model=\"locale.newKey\" placeholder=\"TRANSLATION_KEY\"></div><div class=\"col-md-8\"><label>Translated Value</label><div class=\"input-group\"><input type=\"text\" ng-if=\"!locale.insertNewObject[language]\" class=\"form-control input-sm\" ng-model=\"form.newValue\" placeholder=\"Translated Value\"> <span class=\"input-group-btn\"><button type=\"button\" class=\"btn btn-primary btn-sm\" ng-disabled=\"(locale.insertNewObject[language] && !locale.newKey) || (!locale.insertNewObject[language] && !form.newValue || !locale.newKey)\" ng-click=\"locale.writeObjectByKey(locale.translations[language], form)\">Insert</button></span></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"locale.insertNewObject[language]\"> Insert As New Object</label></div></div></div></div></div></div></div><div ng-if=\"locale.search\" class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"locale.showAll[language]\"> Show Full Translation</label></div><pre ng-if=\"!locale.search || locale.showAll[language]\">{{locale.translations[language] | json}}</pre></accordion-group></accordion></div>");}]);