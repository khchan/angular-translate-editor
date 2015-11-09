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

angular.module("angular-translate-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("translate-editor.tpl.html","<div><div class=\"form-group\" ng-class=\"{ \'has-error\': locale.hasError }\"><input type=\"text\" class=\"form-control\" ng-model=\"locale.search\" ng-change=\"locale.findByKey(locale.search)\" ng-model-options=\"{ debounce: 500 }\" placeholder=\"Enter xPath Query Here\"> <small ng-if=\"locale.hasError\" class=\"pull-right text-danger\">Invalid Query!</small></div><button class=\"btn btn-default btn-sm\" ng-repeat=\"query in locale.queries track by $index\" ng-click=\"locale.findByKey(query.search); locale.search = query.search;\">{{query.label}}</button><hr><accordion ng-if=\"!locale.hasError\" close-others=\"false\"><accordion-group ng-repeat=\"language in locale.languages track by $index\" is-open=\"locale.tabs[language].$isOpen\"><accordion-heading>Edit {{language | uppercase}} Dictionary <i class=\"pull-right glyphicon\" ng-class=\"{\'glyphicon-chevron-down\': locale.tabs[language].$isOpen, \'glyphicon-chevron-right\': !locale.tabs[language].$isOpen}\"></i></accordion-heading><div class=\"form-group\" ng-repeat=\"form in locale.bindings[language].forms track by $index\"><div ng-if=\"form.hasInput\"><label>{{form.label}}:</label><input type=\"text\" class=\"form-control input-sm\" ng-model=\"form.value\" ng-change=\"locale.updateTranslations(form)\" ng-model-options=\"{ debounce: 500 }\"></div><div ng-if=\"!form.hasInput\"><div class=\"panel panel-default\"><div class=\"panel-body\"><div ng-if=\"form.isFlat\"><div class=\"form-group\" ng-repeat=\"(key, value) in form.value track by $index\"><label>{{form.label}}.{{key}}</label><div class=\"input-group\"><input type=\"text\" class=\"form-control input-sm\" ng-model=\"value\" ng-change=\"locale.updateObject(locale.translations[language], form, key, value)\" ng-model-options=\"{ debounce: 500 }\"> <span class=\"input-group-btn\"><button type=\"button\" tabindex=\"-1\" class=\"btn btn-warning btn-sm\" ng-click=\"locale.deleteObjectByKey(form, key)\">Delete</button></span></div></div></div><pre ng-if=\"!form.isFlat\">{{form.value | json}}</pre></div><div class=\"panel-footer\"><div class=\"row\"><div class=\"col-md-4\"><label>{{form.label}}.{{locale.newKey}}</label><input type=\"text\" class=\"form-control input-sm\" ng-model=\"locale.newKey\" placeholder=\"TRANSLATION_KEY\"></div><div class=\"col-md-8\"><label>Translated Value</label><div class=\"input-group\"><input type=\"text\" class=\"form-control input-sm\" ng-model=\"form.newValue\" placeholder=\"Translated Value\"> <span class=\"input-group-btn\"><button type=\"button\" class=\"btn btn-primary btn-sm\" ng-disabled=\"!form.newValue || !locale.newKey\" ng-click=\"locale.writeObjectByKey(locale.translations[language], form)\">Insert</button></span></div></div></div></div></div></div></div><div ng-if=\"locale.search\" class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"locale.showAll[language]\"> Show Full Translation</label></div><pre ng-if=\"!locale.search\">{{locale.translations[language]| json}}</pre><div ng-repeat=\"form in locale.bindings[language].forms track by $index\"><pre ng-if=\"!locale.showAll[language]\">{{form.value | json}}</pre><pre ng-if=\"locale.showAll[language]\">{{locale.translations[language]| json}}</pre></div></accordion-group></accordion></div>");}]);