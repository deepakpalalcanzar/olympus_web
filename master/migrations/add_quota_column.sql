
alter table Directory add column quota bigint;
alter table Directory add column size bigint;
alter table Directory modify size bigint Default 0;
