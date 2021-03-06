﻿/// <reference path='../../../typings/chai/chai.d.ts' />
/// <reference path='../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../typings/sinon/sinon.d.ts' />
/// <reference path='../../../typings/chaiAssertions.d.ts' />

'use strict';

import { services } from 'typescript-angular-utilities';

import {
	IButtonScope,
	IButtonController,
	moduleName,
	controllerName,
} from './button';

import * as angular from 'angular';
import 'angular-mocks';

import test = services.test;

describe('ButtonController', () => {
	var scope: IButtonScope;
	var button: IButtonController;
	var actionSpy: Sinon.SinonSpy;

	beforeEach(() => {
		angular.mock.module(moduleName);

		actionSpy = sinon.spy();
	});

	it('should update internal busy state if external busy property is set or clear', (): void => {
		button = buildController();
		scope.$digest();

		expect(button.busy).to.be.false;

		scope.busy = true;
		scope.$digest();

		expect(button.busy).to.be.true;

		scope.busy = false;
		scope.$digest();

		expect(button.busy).to.be.false;
		sinon.assert.notCalled(actionSpy);
	});

	it('should be busy after triggering the action if no promise is returned', (): void => {
		button = buildController();
		scope.$digest();

		button.trigger();
		scope.$digest();

		expect(scope.busy).to.be.true;
		expect(button.busy).to.be.true;
		sinon.assert.calledOnce(actionSpy);
	});

	describe('should finish after promise ends', (): void => {
		var deferred: angular.IDeferred<any>;

		beforeEach((): void => {
			var $q: angular.IQService = test.angularFixture.inject('$q').$q;
			deferred = $q.defer();

			actionSpy = sinon.spy((): angular.IPromise<any> => {
				return deferred.promise;
			});

			button = buildController();
			button.trigger();

			expect(button.busy).to.be.true;
		});

		it('should finish after promise completes', (): void => {
			deferred.resolve();
			scope.$digest();

			expect(button.busy).to.be.false;
		});

		it('should finish after promise fails', (): void => {
			deferred.reject();
			scope.$digest();

			expect(button.busy).to.be.false;
		});
	});

	it('should not allow triggers while busy', (): void => {
		button = buildController(true);

		expect(button.busy).to.be.true;

		button.trigger();

		sinon.assert.notCalled(actionSpy);
	});

	function buildController(busy: boolean = false): IButtonController {
		var controllerResult: test.IControllerResult<IButtonController>
			= test.angularFixture.controllerWithBindings<IButtonController>(controllerName, null, null, { busy: busy, action: actionSpy });

		scope = <IButtonScope>controllerResult.scope;
		return controllerResult.controller;
	}
});
