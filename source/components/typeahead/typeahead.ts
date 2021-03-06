'use strict';

import * as angular from 'angular';
import * as _ from 'lodash';

import { services } from 'typescript-angular-utilities';
import __parentChild = services.parentChildBehavior;
import __genericSearch = services.genericSearchFilter;
import __objectUtility = services.object;
import __arrayUtility = services.array;
import __promiseUtility = services.promise;

export var moduleName: string = 'rl.ui.components.typeahead';
export var directiveName: string = 'rlTypeahead';
export var controllerName: string = 'TypeaheadController';


export interface ITypeaheadBindings {
	// summary: IChild object with typeahead behaviors
	childLink: __parentChild.IChild<ITypeaheadBehavior>;

	// summary: two-way bound selection object from the consumer
	selection: any;

	// summary: indicates to the consumer if a selection was made
	hasSelection: boolean;

	// summary: function that gets called with updates to the selection
	// param1: (value) the new selection
	// param2: (hasSelection) indicates whether the new selection is a list object or a manually typed value
	select(params: ISelectParams): void;

	// summary: function to transform the items into display strings
	// param1: (value) the item to transofrm
	transform(params: ITransformParams): string;

	// summary: function to get the full list of items or search for items on the server
	// param1: (search - only if client searching is off) Search value for the server
	getItems(params?: IGetItemsParams): angular.IPromise<any>;

	// summary: placeholder to display in the typeahead textbox
	placeholder: string;

	// summary: specifies whether searching should take place on the client or server - defaults to server
	useClientSearching: boolean;

	// summary: two-way binding to indicate whether the typeahead textarea should show an error
	hasError: boolean;

	// summary: specifies whether the search icon and spinner should be shown - defaults to true
	showSearch: boolean;

	// summary: function for applying the selection. If present, an add button is added to the typeahead
	//          once applied, the item is removed from the typeahead list if client searching is used
	// param1: (value) selection to apply
	// returns: promise to show an apply spinner on
	apply(param: IApplyParam): angular.IPromise<any>;
}

export interface ITypeaheadBehavior {
	add(item: any): void;
	remove(item: any): void;
}

export interface ISelectParams {
	value: any;
	hasSelection: boolean;
}

export interface ITransformParams {
	value: any;
}

export interface IGetItemsParams {
	search: string;
}

export interface IApplyParam {
	value: any;
}

export interface ITypeaheadAttrs extends angular.IAttributes {
	selection: string;
	transform: string;
	apply: string;
}

export class TypeaheadController {
	// bindings
	childLink: __parentChild.IChild<ITypeaheadBehavior>;
	selectionBinding: any;
	hasSelection: boolean;
	select: { (params: ISelectParams): void };
	transformInParent: { (params: ITransformParams): string };
	getItemsInParent: { (params?: IGetItemsParams): angular.IPromise<any> };
	placeholder: string;
	useClientSearching: boolean;
	hasError: boolean;
	showSearch: boolean;
	apply: { (param: IApplyParam): angular.IPromise<any> };

	private cachedItems: any[];
	private searchFilter: __genericSearch.IGenericSearchFilter;
	private useScopeSelection: boolean;
	private hasTransform: boolean;
	selection: any;
	loading: boolean = false;
	loadDelay: number;
	useApply: boolean;

	static $inject: string[] = ['$scope'
		, '$attrs'
		, '$q'
		, __parentChild.serviceName
		, __genericSearch.factoryName
		, __objectUtility.serviceName
		, __arrayUtility.serviceName
		, __promiseUtility.serviceName];
	constructor(private $scope: angular.IScope
		, $attrs: ITypeaheadAttrs
		, private $q: angular.IQService
		, private parentChild: __parentChild.IParentChildBehaviorService
		, genericSearchFactory: __genericSearch.IGenericSearchFilterFactory
		, object: __objectUtility.IObjectUtility
		, private array: __arrayUtility.IArrayUtility
		, private promise: __promiseUtility.IPromiseUtility) {
		this.searchFilter = genericSearchFactory.getInstance();
		this.loadDelay = this.useClientSearching ? 100 : 500;

		this.selection = this.selectionBinding;

		if (this.hasSelection == null) {
			this.hasSelection = false;
		}

		if (this.placeholder == null) {
			this.placeholder = 'Search';
		}

		if (this.showSearch == null) {
			this.showSearch = true;
		}

		this.useScopeSelection = object.isNullOrEmpty($attrs.selection) === false;
		this.hasTransform = object.isNullOrEmpty($attrs.transform) === false;
		this.useApply = object.isNullOrEmpty($attrs.apply) === false;

		this.parentChild.registerChildBehavior(this.childLink, {
			add: this.addItem,
			remove: this.removeItem,
		});

		$scope.$watch((): any => { return this.selection; }, (value: any): void => {
			this.hasSelection = _.isObject(value);
			this.setSelection(value);
		});

		$scope.$watch((): any => { return this.selectionBinding; }, (value: any): void => {
			if (value == null) {
				this.selection = null;
			}
		});
	}

	private setSelection(object: any): void {
		if (this.hasSelection != null) {
			this.hasSelection = this.hasSelection;
		}

		if (this.useScopeSelection) {
			this.selection = object;
		}

		if (_.isFunction(this.select)) {
			this.select({ value: object, hasSelection: this.hasSelection });
		}
	}

	transform(object: any): string {
		if (this.hasTransform && object != null) {
			return this.transformInParent({
				value: object,
			});
		}
		return object;
	}

	getItems(search: string): angular.IPromise<any> {
		if (!this.useClientSearching) {
			return this.getItemsInParent({
				search: search,
			});
		} else {
			this.searchFilter.searchText = search;

			if (this.cachedItems != null) {
				return this.$q.when(this.filter(this.cachedItems));
			} else {
				return this.$q.when(this.getItemsInParent()).then((data: any[]): any[]=> {
					this.cachedItems = data;
					return this.filter(data);
				});
			}
		}
	}

	applyItem(): angular.IPromise<void> {
		if (this.useApply && this.hasSelection) {
			var request: angular.IPromise<any> = this.apply({ value: this.selection });
			if (this.promise.isPromise(request)) {
				return request.then((): void => {
					this.removeItem(this.selection);
					this.selection = null;
				});
			} else if (!_.isUndefined(request)) {
				this.removeItem(this.selection);
				this.selection = null;
			}
		}
		return this.$q.when();
	}

	private filter(list: any[]): any[] {
		return _.filter(list, (item: any): boolean => { return this.searchFilter.filter(item); });
	}

	private addItem: { (item: any): void } = (item: any): void => {
		if (this.cachedItems != null) {
			this.cachedItems.push(item);
		}
	}

	private removeItem: { (item: any): void } = (item: any): void => {
		if (this.cachedItems != null) {
			this.array.remove(this.cachedItems, item);
		}
	}
}

export function typeahead(): angular.IDirective {
	'use strict';
	return {
		restrict: 'E',
		template: `
			<div class="input-group" ng-class="{ 'has-error': typeahead.hasError }">
				<input type="text" ng-model="typeahead.selection" class="form-control"
					placeholder="{{typeahead.placeholder}}" typeahead="object as typeahead.transform(object) for object in typeahead.getItems($viewValue)"
					typeahead-loading="typeahead.loading" typeahead-wait-ms="typeahead.loadDelay" />
				<div class="input-group-addon" ng-if="typeahead.showSearch">
					<rl-busy loading="typeahead.loading"></rl-busy>
					<span ng-hide="typeahead.loading">
						<i class="fa fa-search" ng-hide="typeahead.hasSelection"></i>
						<i class="fa fa-check" ng-show="typeahead.hasSelection"></i>
					</span>
				</div>
				<div class="input-group-btn" ng-if="typeahead.useApply">
					<rl-button type="default" action="typeahead.applyItem()" button-right-aligned="true" ng-disabled="!typeahead.hasSelection">
						<i class="fa fa-plus new"></i>
					</rl-button>
				</div>
			</div>
		`,
		controller: controllerName,
		controllerAs: 'typeahead',
		scope: {},
		bindToController: {
			childLink: '=',
			selectionBinding: '=selection',
			hasSelection: '=',
			select: '&',
			transformInParent: '&transform',
			getItemsInParent: '&getItems',
			placeholder: '@',
			useClientSearching: '=',
			hasError: '=',
			showSearch: '=',
			apply: '&',
		},
	};
}

angular.module(moduleName, [
	__parentChild.moduleName
	, __genericSearch.moduleName
	, __objectUtility.moduleName
	, __arrayUtility.moduleName
	, __promiseUtility.moduleName])
	.directive(directiveName, typeahead)
	.controller(controllerName, TypeaheadController);
