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
        basePath: '@',       // initial base path to pre-load search
        languages: '=',      // array of allowable locales
        translations: '=',   // dictionary of language-translations
        queries: '=',        // predefined queries to build buttons on
        onUpdate: '=',       // callback on update one
        onRemove: '=',       // callback on remove one
        isValid: '='         // boolean validity of translation changes
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
    vm.isValid = vm.isValid || false;

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
    vm.insertNewTranslation = insertNewTranslation;
    vm.areTranslationsValid = areTranslationsValid;
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
      vm.isValid = areTranslationsValid();
    }

    function syncJsonToXML() {
      _.each(vm.languages, function (lang) {
        vm.xmlDefinitions[lang] = JSON.toXML(vm.translations[lang]);
      });
    }

    function clearBindings() {
      _.each(vm.languages, function (lang) {
        vm.bindings[lang].forms = [];
        delete vm.bindings[lang].newForm;
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

    function validateTraversalPath(object, path) {
      var curr = object;
      try {
        _.each(path, function (key) {
          if (!_.has(curr, key)) { // if object doesn't exist at current path yet
            curr[key] = {};
          } else {
            if (_.isString(curr[key])) { // if path leads to string field, path is invalid
              throw "invalid path";
            }
          }
          curr = curr[key];
        });
        return curr;
      } catch (err) {
        return null;
      }
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

      // update validity
      vm.isValid = !_.isEmpty(value);

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
      // update validity
      vm.isValid = !_.isEmpty(form.value);
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

            if (nodes.length) { // if search returned results
              delete vm.bindings[lang].newForm;
              _.each(nodes, function (node, idx) {
                var nodeVal = Defiant.node.toJSON(node);
                var path = getPathToNode(node).slice(1);
                vm.bindings[lang].forms.push({
                  lang: lang,
                  label: path.join("."),
                  path: path,
                  hasInput: (typeof nodeVal !== 'object'),
                  isFlat: _.all(nodeVal, function (value, key) {
                    return isFlat(value);
                  }),
                  value: nodeVal,
                  element: node
                });
              });
            } else { // otherwise, insert key/value recursively
              var path = query.split('/').slice(2);
              // try traversing translation object with path leading to key
              var curr = validateTraversalPath(vm.translations[lang], path.slice(0, -1));
              if (!_.isNull(curr)) {
                vm.bindings[lang].newForm = {
                  lang: lang,
                  label: path.join("."),
                  path: path,
                  value: ""
                };
              }
            }
            vm.hasError = false;
          });
        } catch(err) { // query invalid, so clear bindings
          vm.hasError = true;
          clearBindings();
        }
      }
    }

    /**
     * insertNewTranslation description
     * @description Recursively checks json structure to insert new key value translation
     * @param  {Object} newForm
     */
    function insertNewTranslation(newForm) {
      try {
        // try traversing translation object with path leading to key
        var curr = traverseObject(vm.translations[newForm.lang], newForm.path.slice(0, -1));
        curr[_.last(newForm.path)] = newForm.value;

        // sync changed json back to xml model
        syncJsonToXML();
      } catch(err) {
        vm.hasError = true;
        clearBindings();
      }
    }

    /**
     * areTranslationsValid
     * @description Returns true if forms have all their translated values filled out
     * @return {Boolean}
     */
    function areTranslationsValid() {
      return _.all(vm.languages, function (language) {
        return _.all(vm.bindings[language].forms, function (form) {
          return !_.isEmpty(form.value);
        });
      });
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
