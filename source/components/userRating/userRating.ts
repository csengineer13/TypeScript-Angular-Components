﻿'use strict';

import * as angular from 'angular';
import * as _ from 'lodash';

export var moduleName: string = 'rl.components.userRating';

export var directiveName: string = 'rlUserRating';
export var controllerName: string = 'UserRatingController';

export interface IStar {
	value: number;
	filled: boolean;
}

export interface IUserRatingController {
	stars: IStar[];
	setRating(rating: number): void;
}

export interface IUserRatingScope extends angular.IScope {
	ngModel: angular.INgModelController;
	range: number;
}

export class UserRatingController implements IUserRatingController {
	stars: IStar[];

	static $inject: string[] = ['$scope'];
	constructor(private $scope: IUserRatingScope) {
		this.stars = [];
		var rangeSize: number = this.$scope.range != null ? this.$scope.range : 5;
		// css style requires the stars to show right to left. Reverse the list so the highest value is first
		var range: number[] = _.range(1, rangeSize + 1).reverse();
		_.each(range, (rating: number): void => {
			this.stars.push({
				value: rating,
				filled: false,
			});
		});

		var unbind: Function = this.$scope.$watch('ngModel', (value: angular.INgModelController): void => {
			this.updateStarView(this.$scope.ngModel.$viewValue);
			unbind();
		});
	}

	setRating(rating: number): void {
		this.$scope.ngModel.$setViewValue(rating);
		this.updateStarView(rating);
	}

	private updateStarView(rating: number): void {
		_.each(this.stars, (star: IStar): void => {
			if (star.value <= rating) {
				star.filled = true;
			} else {
				star.filled = false;
			}
		});
	}
}

export function userRating(): angular.IDirective {
	'use strict';
	return {
		restrict: 'E',
		require: 'ngModel',
		template: `
			<span class="rating">
				<span class="star" ng-repeat="star in userRating.stars" ng-class="{ 'filled': star.filled }" ng-click="userRating.setRating(star.value)"></span>
			</span>
		`,
		controller: controllerName,
		controllerAs: 'userRating',
		scope: {
			range: '=',
		},
		link(scope: IUserRatingScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModel: angular.INgModelController): void {
			scope.ngModel = ngModel;
		},
	};
}

angular.module(moduleName, [])
	.directive(directiveName, userRating)
	.controller(controllerName, UserRatingController);
