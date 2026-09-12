export type StockRow={sku:string;title:string;stock:number;dailySales:number;unitCost:number};
export type PlanOptions={leadDays:number;safetyDays:number;demand:number;budget:number};
export function parseInventoryCsv(text:string):StockRow[]{
 if(text.length>2_000_000)throw new Error('CSV must be under 2 MB.');
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw new Error('Unclosed quote in CSV.');row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
 const headers=(rows.shift()||[]).map(v=>v.replace(/^\uFEFF/,'').trim().toLowerCase());
 const names=['sku','title','stock','daily_sales','unit_cost'];
 if(names.some(n=>!headers.includes(n))||new Set(headers).size!==headers.length)throw new Error('Use unique column names including sku, title, stock, daily_sales, unit_cost.');
 if(rows.length>10000||!rows.length)throw new Error('Import between 1 and 10,000 rows.');
 const seen=new Set<string>();
 return rows.map((r,index)=>{const values=names.map(n=>(r[headers.indexOf(n)]||'').trim());const [sku,title,...numeric]=values;const numbers=numeric.map(Number);if(r.length!==headers.length||!sku||!title||sku.length>200||title.length>500||seen.has(sku)||numeric.some(v=>v==='')||numbers.some(n=>!Number.isFinite(n)||n<0||n>1e9)||!Number.isInteger(numbers[0])||numbers[2]<.01)throw new Error(`Row ${index+2}: check column count, unique SKUs, title, whole nonnegative stock, daily sales, and unit cost ≥ 0.01. Numeric limit: 1 billion.`);seen.add(sku);return {sku,title,stock:numbers[0],dailySales:numbers[1],unitCost:numbers[2]};});
}
export function buildPlan(rows:StockRow[],options:PlanOptions){
 const {leadDays,safetyDays,demand,budget}=options;
 if([leadDays,safetyDays,demand,budget].some(n=>!Number.isFinite(n)||n<0))throw new Error('Scenario values must be finite and nonnegative.');
 const ranked=rows.map(row=>{const velocity=row.dailySales*demand;const cover=velocity>0?row.stock/velocity:Infinity;const target=Math.ceil(velocity*(leadDays+safetyDays));const needed=Math.max(0,target-row.stock);return {...row,velocity,cover,needed};}).sort((a,b)=>a.cover-b.cover||a.sku.localeCompare(b.sku));
 let remaining=Math.floor(budget*100);
 return ranked.map(row=>{const cents=Math.max(1,Math.round(row.unitCost*100));const quantity=Math.min(row.needed,Math.floor(remaining/cents));const spendCents=quantity*cents;remaining-=spendCents;return {...row,quantity,spend:spendCents/100,unfunded:row.needed-quantity};});
}
export function planCsv(plan:ReturnType<typeof buildPlan>){
 const safe=(v:string|number)=>'"'+String(v).replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
 return ['sku,title,current_stock,daily_sales,recommended_units,funded_units,estimated_cost',...plan.filter(r=>r.needed>0).map(r=>[r.sku,r.title,r.stock,r.velocity.toFixed(2),r.needed,r.quantity,r.spend.toFixed(2)].map(safe).join(','))].join('\r\n');
}
