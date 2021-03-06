/// <reference path='../../../../typings/chai/chai.d.ts' />
/// <reference path='../../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../../typings/sinon/sinon.d.ts' />
/// <reference path='../../../../typings/chaiAssertions.d.ts' />
/// <reference path='../../../../typings/lodash/lodash.d.ts' />

'use strict';

import { services } from 'typescript-angular-utilities';
import test = services.test;

import {
	IDataSourceProcessor,
	IProcessResult,
	processorServiceName,
} from './dataSourceProcessor.service';

import {
	moduleName,
	dataPager,
} from './dataSources.module';

import { ISort, SortDirection } from '../sorts/sorts.module';

import * as angular from 'angular';
import 'angular-mocks';

interface ITestObject {
	value: number;
	name?: string;
}

interface IFilterMock {
	filter(value: number): boolean;
	updateOptionCounts?: Sinon.SinonSpy;
	type?: string;
}

describe('dataSourceProcessor', () => {
	var dataSourceProcessor: IDataSourceProcessor;
	var pager: dataPager.IDataPager;

	beforeEach(() => {
		angular.mock.module(moduleName);

		var services: any = test.angularFixture.inject(processorServiceName, dataPager.factoryName);
		dataSourceProcessor = services[processorServiceName];
		var dataPagerFactory: dataPager.IDataPagerFactory = services[dataPager.factoryName];
		pager = dataPagerFactory.getInstance();
	});

	it('should sort the data', (): void => {
		var sortList: ISort[] = [
			{
				column: <any>{
					getValue: (item: ITestObject): number => {
						return item.value;
					},
				},
				direction: SortDirection.ascending,
			},
			{
				column: {
					getValue: (item: ITestObject): string => {
						return item.name;
					},
				},
				direction: SortDirection.descending,
			},
		];

		var item1: ITestObject = {
			value: 1,
			name: 'z',
		};

		var item2: ITestObject = {
			value: 1,
			name: 'y',
		};

		var item3: ITestObject = {
			value: 2,
			name: 'a',
		};

		var result: IProcessResult<ITestObject> = dataSourceProcessor.process(sortList, null, null, [item2, item3, item1]);

		expect(result.count).to.equal(3);
		expect(result.dataSet).to.have.length(3);
		expect(result.dataSet[0]).to.equal(item1);
		expect(result.dataSet[1]).to.equal(item2);
		expect(result.dataSet[2]).to.equal(item3);
	});

	it('should apply filter', (): void => {
		var greaterThan4: IFilterMock = {
			filter(value: number): boolean {
				return value > 4;
			},
		};
		var mustBeEven: IFilterMock = {
			filter(value: number): boolean {
				return (value % 2) === 0;
			},
		};

		var result: IProcessResult<number> =
					dataSourceProcessor.process<number>(null, <any>[greaterThan4, mustBeEven], null, _.range(1, 11));

		expect(result.count).to.equal(3);
		expect(result.dataSet).to.have.length(3);
		expect(result.dataSet[0]).to.equal(6);
		expect(result.dataSet[1]).to.equal(8);
		expect(result.dataSet[2]).to.equal(10);
	});

	it('should page data', (): void => {
		pager.pageNumber = 3;
		pager.pageSize = 2;

		var result: IProcessResult<number> = dataSourceProcessor.process<number>(null, null, pager, _.range(1, 11));
		expect(result.count).to.equal(10);
		expect(result.filteredDataSet).to.have.length(10);
		expect(result.dataSet).to.have.length(2);
		expect(result.dataSet[0]).to.equal(5);
		expect(result.dataSet[1]).to.equal(6);
	});

	describe('sort, filter, and paging aggregation', (): void => {
		var sort: ISort;
		var data: number[];

		beforeEach((): void => {
			sort = <any>{
				column: {
					getValue(item: number): number {
						return item;
					},
				},
				direction: SortDirection.ascending,
			};

			pager.pageNumber = 2;
			pager.pageSize = 2;

			data = [10, 8, 2, 7, 6, 1, 3, 9, 4, 5];
		});

		it('should aggregate sort, filter, and paging together', (): void => {
			var customFilter: IFilterMock = {
				filter(value: number): boolean {
					return value > 4;
				},
			};

			var result: IProcessResult<number> = dataSourceProcessor.process<number>([sort], <any>[customFilter], pager, data);
			expect(result.count).to.equal(6);
			expect(result.filteredDataSet).to.have.length(6);
			expect(result.filteredDataSet[0]).to.equal(5);
			expect(result.filteredDataSet[1]).to.equal(6);
			expect(result.filteredDataSet[2]).to.equal(7);
			expect(result.filteredDataSet[3]).to.equal(8);
			expect(result.filteredDataSet[4]).to.equal(9);
			expect(result.filteredDataSet[5]).to.equal(10);
			expect(result.dataSet).to.have.length(2);
			expect(result.dataSet[0]).to.equal(7);
			expect(result.dataSet[1]).to.equal(8);
		});

		it('should perform normal processing if no filters want to calculate option counts', (): void => {
			var filterWithNoUpdateFunction: IFilterMock = {
				filter(value: number): boolean {
					return value > 4;
				},
			};

			var result: IProcessResult<number> =
						dataSourceProcessor.processAndCount<number>([sort], <any>[filterWithNoUpdateFunction], pager, data);

			expect(result.count).to.equal(6);
			expect(result.dataSet).to.have.length(2);
			expect(result.dataSet[0]).to.equal(7);
			expect(result.dataSet[1]).to.equal(8);
		});

		it('should still sort, filter, and page data even if filters are calculating option counts', (): void => {
			var filterWithUpdateFunction: IFilterMock = {
				filter(value: number): boolean {
					return value > 4;
				},
				updateOptionCounts: sinon.spy(),
			};

			var result: IProcessResult<number> =
						dataSourceProcessor.processAndCount<number>([sort], <any>[filterWithUpdateFunction], pager, data);

			expect(result.count).to.equal(6);
			expect(result.dataSet).to.have.length(2);
			expect(result.dataSet[0]).to.equal(7);
			expect(result.dataSet[1]).to.equal(8);
		});
	});

	it('should give each filter a chance to calculate option counts on a data set with all other filters applied', (): void => {
		var greater_than_4: IFilterMock = {
			type: 'greater_than_4',
			filter(value: number): boolean {
				return value > 4;
			},
			updateOptionCounts: sinon.spy(),
		};

		var less_than_8: IFilterMock = {
			type: 'less_than_8',
			filter(value: number): boolean {
				return value < 8;
			},
			updateOptionCounts: sinon.spy(),
		};

		var odd: IFilterMock = {
			type: 'odd',
			filter(value: number): boolean {
				return (value % 2) !== 0;
			},
			updateOptionCounts: sinon.spy(),
		};

		var result: IProcessResult<number> =
			dataSourceProcessor.processAndCount<number>(null, <any>[greater_than_4, less_than_8, odd], null, _.range(1, 11));

		// Each update function called with other filters applied
		sinon.assert.calledWith(greater_than_4.updateOptionCounts, [1, 3, 5, 7]);
		sinon.assert.calledWith(less_than_8.updateOptionCounts, [5, 7, 9]);
		sinon.assert.calledWith(odd.updateOptionCounts, [5, 6, 7]);

		expect(result.count).to.equal(2);
		expect(result.dataSet).to.have.length(2);
		expect(result.dataSet[0]).to.equal(5);
		expect(result.dataSet[1]).to.equal(7);
	});
});
