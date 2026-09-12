import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseInventoryCsv,buildPlan,planCsv} from './replenishment';
test('reads quoted commas, CRLF and BOM',()=>{const rows=parseInventoryCsv('\uFEFFsku,title,stock,daily_sales,unit_cost\r\nA,"Mug, blue",2,3,4.50');assert.equal(rows[0].title,'Mug, blue');assert.equal(rows[0].unitCost,4.5);});
test('rejects duplicate SKU and invalid numeric values',()=>{assert.throws(()=>parseInventoryCsv('sku,title,stock,daily_sales,unit_cost\nA,Mug,2,3,4\nA,Mug,2,3,4'),/Row 3/);assert.throws(()=>parseInventoryCsv('sku,title,stock,daily_sales,unit_cost\nA,Mug,-1,3,4'),/Row 2/);});
test('budget is never exceeded and urgent stock gets allocated first',()=>{const rows=[{sku:'B',title:'Later',stock:20,dailySales:2,unitCost:3},{sku:'A',title:'Urgent',stock:0,dailySales:2,unitCost:3}];const plan=buildPlan(rows,{leadDays:7,safetyDays:0,demand:1,budget:10});assert.equal(plan[0].sku,'A');assert.equal(plan[0].quantity,3);assert.equal(plan.reduce((s,r)=>s+r.spend,0),9);});
test('zero demand needs no purchase and zero budget funds nothing',()=>{const rows=[{sku:'A',title:'A',stock:0,dailySales:2,unitCost:3}];assert.equal(buildPlan(rows,{leadDays:7,safetyDays:1,demand:0,budget:10})[0].needed,0);assert.equal(buildPlan(rows,{leadDays:7,safetyDays:1,demand:1,budget:0})[0].quantity,0);});
test('exports escape spreadsheet formulas',()=>{const p=buildPlan([{sku:'=X',title:'@danger',stock:0,dailySales:2,unitCost:3}],{leadDays:7,safetyDays:0,demand:1,budget:10});assert.match(planCsv(p),/'=X/);assert.match(planCsv(p),/'@danger/);});
