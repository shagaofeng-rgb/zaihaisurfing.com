import assert from 'node:assert/strict';
import test from 'node:test';
import {paginate, parseAdminPagination} from '../src/lib/adminPagination';
import {calculateSalesCommission} from '../src/lib/pricingMath';

test('admin data tables default to 10 rows and accept supported page sizes', () => {
  assert.deepEqual(parseAdminPagination({}), {page: 1, perPage: 10});
  assert.deepEqual(parseAdminPagination({page: '2', perPage: '20'}), {page: 2, perPage: 20});
  assert.equal(paginate(Array.from({length: 25}, (_, index) => index), 2, 10).items.length, 10);
  assert.equal(paginate(Array.from({length: 25}, (_, index) => index), 3, 10).items.length, 5);
});

test('pricing commission uses the product floor rate and 10/20 percent spread tiers', () => {
  const x1 = calculateSalesCommission({
    productId: 'x1',
    quantity: 6,
    saleUnitUsd: 3300,
    floorUnitUsd: 2600,
    fivePlusUnitUsd: 3000
  });
  assert.equal(x1.baseCommissionPerUnit, 26);
  assert.equal(x1.midCommissionPerUnit, 40);
  assert.equal(x1.topCommissionPerUnit, 60);
  assert.equal(x1.salespersonCommissionUsd, 756);

  const p1 = calculateSalesCommission({
    productId: 'p1',
    quantity: 1,
    saleUnitUsd: 5700,
    floorUnitUsd: 5000,
    fivePlusUnitUsd: 5550
  });
  assert.equal(p1.baseCommissionPerUnit, 100);
  assert.equal(p1.midCommissionPerUnit, 55);
  assert.equal(p1.topCommissionPerUnit, 30);
  assert.equal(p1.salespersonCommissionUsd, 185);
});
