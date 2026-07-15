alter table products add column stock integer default null;

comment on column products.stock is 'NULL = unlimited stock, 0 = out of stock';
