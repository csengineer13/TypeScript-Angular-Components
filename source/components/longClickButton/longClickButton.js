'use strict';
var angular = require('angular');
var $ = require('jquery');
var typescript_angular_utilities_1 = require('typescript-angular-utilities');
exports.moduleName = 'rl.ui.components.longClickButton';
exports.directiveName = 'rlLongClickButton';
exports.controllerName = 'LongClickButtonController';
var __object = typescript_angular_utilities_1.services.object;
var LongClickButtonController = (function () {
    function LongClickButtonController($scope, $interval, $timeout, objectUtility) {
        var _this = this;
        this.$interval = $interval;
        this.$timeout = $timeout;
        this.objectUtility = objectUtility;
        this.interval = 25;
        this.duration = 1500;
        this.buttonText = this.text;
        if (this.buttonType != null) {
            this.buttonClass = this.buttonType;
        }
        else {
            this.buttonClass = 'default';
        }
        $scope.$watch(function () { return _this.buttonText; }, function () {
            $timeout(function () {
                _this.width = $('#actionButton').outerWidth();
            });
        });
    }
    LongClickButtonController.prototype.startAction = function () {
        var _this = this;
        if (this.active) {
            return;
        }
        this.actionProgress = 0;
        this.active = true;
        this.actionInterval = this.$interval(function () {
            _this.actionProgress += _this.interval;
            if (_this.actionProgress >= _this.duration) {
                _this.cleanup();
                _this.buttonText = _this.text;
                _this.onTriggered();
            }
        }, this.interval);
    };
    LongClickButtonController.prototype.stopAction = function () {
        if (this.active) {
            if (this.actionProgress < this.duration) {
                this.warn();
            }
            this.cleanup();
        }
    };
    LongClickButtonController.prototype.cleanup = function () {
        this.$interval.cancel(this.actionInterval);
        this.actionProgress = 0;
        this.active = false;
    };
    LongClickButtonController.prototype.warn = function () {
        if (this.objectUtility.isNullOrEmpty(this.onShortClickText) === false) {
            this.buttonText = this.onShortClickText;
        }
    };
    LongClickButtonController.$inject = ['$scope', '$interval', '$timeout', __object.serviceName];
    return LongClickButtonController;
})();
exports.LongClickButtonController = LongClickButtonController;
function longClickButton() {
    'use strict';
    return {
        restrict: 'E',
        template: "\n\t\t\t<div class=\"long-click-button\">\n\t\t\t\t<button id=\"actionButton\" class=\"btn btn-{{button.buttonClass}}\" ng-mousedown=\"button.startAction()\" ng-mouseleave=\"button.stopAction()\">\n\t\t\t\t\t<rl-busy loading=\"button.spinner\" ng-if=\"button.rightAligned\"></rl-busy>\n\t\t\t\t\t<i ng-show=\"button.buttonIcon != null\" class=\"fa fa-{{button.buttonIcon}}\"></i> {{button.buttonText}}\n\t\t\t\t\t<rl-busy loading=\"button.spinner\" ng-if=\"!button.rightAligned\"></rl-busy>\n\t\t\t\t</button>\n\t\t\t\t<rl-rating-bar ng-if=\"button.active\" width=\"button.width\" height=\"5\" min=\"0\" max=\"button.duration\"\n\t\t\t\t\t\t\tvalue=\"button.actionProgress\" background=\"transparent\"></rl-rating-bar>\n\t\t\t</div>\n\t\t",
        controller: exports.controllerName,
        controllerAs: 'button',
        scope: {},
        bindToController: {
            onTriggered: '&',
            text: '@',
            onShortClickText: '@',
            buttonIcon: '@',
            spinner: '=',
            rightAligned: '=',
            type: '@',
        },
    };
}
angular.module(exports.moduleName, [__object.moduleName])
    .directive(exports.directiveName, longClickButton)
    .controller(exports.controllerName, LongClickButtonController);
//# sourceMappingURL=longClickButton.js.map