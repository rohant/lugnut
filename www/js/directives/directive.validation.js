angular.module('app.directives')


/**
 * 
 * Example:
 
 <div class="form-group" data-has-errors >
 <input class="form-control" ng-model="email" type="email" name="email" required minlength="5"/>
 <errors/>
 </div>
 
 */

.directive('hasErrors', [function () {
	return {
		restrict: "A",
		link: function (scope, element, attrs, ctrl)
		{
			var input = element.find('input[name],select[name],textarea[name]');
			var _model = input.data().$ngModelController;

			if (input.length) {
				scope.$watch(function (){
					return _model.$dirty && _model.$invalid;
				}, function (isInvalid) {
					element.toggleClass('has-error', isInvalid);
				});
			}
		}
	};
}])


.value('ErrorMessages', {
	'address': 'Please enter a residential address',
	'email': 'Email is not a valid email address.',
	'tel': 'Phone is not valid.',
	'pattern': 'It must be contain:',
	'max': 'Maximum value: {{value}}',
	'maxlength': 'Maximum length: {{value}}',
	'min': 'Minimum value: {{value}}',
	'minlength': 'Minimum length: {{value}}',
	'required': 'This field is required',
	//'required': 'This field cannot be blank',
	'unique': 'This field does not allow duplicated values',
	'compareTo': 'Passwords don\'t match.'
})

.directive('errors', ['ErrorMessages', function (ErrorMessages) {
	return {
		restrict: "E",
		replace: true,
		scope: {},
		template: [
			'<div ng-switch on="_model.$dirty && _model.$invalid" class="help-block">',
			'<div ng-switch-when="true" ng-if="_model.$error[type]" ng-repeat="(type, message) in errorMessages track by $index">',
			'{{prepareMessage(message, type)}}',
			'</div>',
			'</div>'
		].join(''),
		link: function ($scope, element, attrs, ctrl) {
			var $formGroup = element.closest('.form-group');
			var $input = $formGroup.find('input[name],select[name],textarea[name]');

			$scope._field = $input
			$scope._model = $input.data().$ngModelController;
			$scope.errorMessages = ErrorMessages;

			$scope.prepareMessage = function (message, attr)
			{

				// phone validation
				if (attr == 'pattern' && $input.attr('type') == 'tel') {
					message = ErrorMessages.tel;
					return message.replace('{{pattern}}', $input.attr('pattern') || '');
				}


				return message.replace('{{value}}', $input.attr(attr) || '');
			};
		}
	};
}])

/**
 <input type="password" name="confirmPassword" 
 ng-model="registration.user.confirmPassword"
 compare-to="registration.user.password" required />
 
 <div ng-messages="registrationForm.confirmPassword.$error" 
 ng-messages-include="messages.html">
 */
.directive("compareTo", function () {
	return {
		require: "ngModel",
		scope: {
			otherModelValue: "=compareTo"
		},
		link: function (scope, element, attributes, ngModel)
		{

			ngModel.$validators.compareTo = function (modelValue)
			{
				return modelValue == scope.otherModelValue;
			};

			scope.$watch("otherModelValue", function ()
			{
				ngModel.$validate();
			});
		}
	};
})