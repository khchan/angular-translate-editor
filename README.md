# angular-translate-editor

AngularJS directive for editing multiple angular-translate localization files at once using xPath for querying.

## Usage
1. `bower install angular-translate-editor`
2. Add `khchan.translate-editor` as a module dependency to your app.
3. Insert the `translate-editor` directive into your template:

```html
<translate-editor translations="translations" languages="languages" queries="queries"></translate-editor>
```

```javascript
angular
		.module('app', ['khchan.translate-editor'])
		.controller('AppCtrl', AppCtrl);

	AppCtrl.$inject = ['$scope'];

	function AppCtrl($scope) {
		$scope.languages = ['en', 'fr'];

		$scope.translateions = {
			'en': // english translations
			'fr': // french translations
		};

		$scope.queries = [
			{
				label: 'Login Title',
				search: '//APP/AUTH/TITLE'
			},
			{
				label: 'Open Buttons',
				search: '//OPEN_BTN'
			},
			{
				label: 'Studies Menu',
				search: '//MENU/STUDIES'
			},
			{
				label: 'Model Identities',
				search: '//IDENTITY'
			}
		];
```

## License
MIT
