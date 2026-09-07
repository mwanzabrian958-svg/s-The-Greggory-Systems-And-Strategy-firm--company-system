#!/usr/bin/env node
// Sync: cloud Aiven (_main) => local XAMPP (_main). Makes the local hot-standby
// hold the same schema+data as cloud so a failover is not stale.
//   node scripts/sync-cloud-to-local.cjs
require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const SCHEMA = process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main";
function tables(c,s){return c.query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME",[s]).then(r=>r[0].map(x=>x.TABLE_NAME));}
(async()=>{
  const cloudOpts={host:process.env.DB_HOST,port:Number(process.env.DB_PORT||28067),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:SCHEMA,ssl:process.env.DB_SSL==="true"?{minVersion:"TLSv1.2",rejectUnauthorized:false}:undefined};
  const localOpts={host:process.env.DB_HOST_2||"127.0.0.1",port:Number(process.env.DB_PORT_2||3306),user:process.env.DB_USER_2||"root",password:process.env.DB_PASSWORD_2!==undefined?process.env.DB_PASSWORD_2:"",database:SCHEMA};
  console.log("[SYNC] cloud "+cloudOpts.host+":"+cloudOpts.port+" => local "+localOpts.host+":"+localOpts.port+" | "+SCHEMA);
  const cloud=await mysql.createConnection(cloudOpts);const local=await mysql.createConnection(localOpts);
  // Ensure local can accept large rows (profile photos in users/videos); needs SUPER, ignore if unsupported
  try{await local.query("SET GLOBAL max_allowed_packet = 67108864");}catch(e){console.warn("[SYNC] could not raise max_allowed_packet (needs SUPER): "+e.message.split("\n")[0]);}
  try{await local.query("SET SESSION sql_mode = ''");}catch(e){}
  try{const lt=await tables(local,SCHEMA);const d=path.join(__dirname,".backup");fs.mkdirSync(d,{recursive:true});const dump=[];for(const t of lt){const [[r]]=await local.query("SHOW CREATE TABLE `"+SCHEMA+"`.`"+t+"`");dump.push("DROP TABLE IF EXISTS `"+t+"`;\n"+r["Create Table"]+";");}fs.writeFileSync(path.join(d,"local-backup-"+new Date().toISOString().replace(/[:.]/g,"-")+".sql"),dump.join("\n\n"),"utf8");console.log("[SYNC] backup: "+lt.length+" tables -> scripts/.backup");}catch(e){console.warn("[SYNC] backup skipped: "+e.message);}
  try{const lt=await tables(local,SCHEMA);const d=path.join(__dirname,".backup");fs.mkdirSync(d,{recursive:true});const dump=[];for(const t of lt){const [[r]]=await local.query("SHOW CREATE TABLE `"+SCHEMA+"`.`"+t+"`");dump.push("DROP TABLE IF EXISTS `"+t+"`;\n"+r["Create Table"]+";");}fs.writeFileSync(path.join(d,"local-backup-"+new Date().toISOString().replace(/[:.]/g,"-")+".sql"),dump.join("\n\n"),"utf8");console.log("[SYNC] backup: "+lt.length+" tables -> scripts/.backup");}catch(e){console.warn("[SYNC] backup skipped: "+e.message);}
  const ct=await tables(cloud,SCHEMA),lt=await tables(local,SCHEMA);
  const dropT=lt.filter(t=>!ct.includes(t)),createT=ct.filter(t=>!lt.includes(t)),syncT=ct.filter(t=>lt.includes(t));
  await local.query("SET FOREIGN_KEY_CHECKS=0");
  for(const t of dropT)await local.query("DROP TABLE IF EXISTS `"+t+"`");
  for(const t of createT){const [[r]]=await cloud.query("SHOW CREATE TABLE `"+SCHEMA+"`.`"+t+"`");await local.query(r["Create Table"]);}
  let total=0, skipped=0;
  for(const t of syncT){
    try{
    await local.query("TRUNCATE TABLE `"+t+"`");
    const [rows]=await cloud.query("SELECT * FROM `"+SCHEMA+"`.`"+t+"`");
    if(!rows.length)continue;
    // Column intersection handles cloud/local schema drift (e.g. a column added on one side only)
    const [colRows]=await local.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?",[SCHEMA,t]);
    const localSet=new Set(colRows.map(c=>c.COLUMN_NAME));
    const cols=Object.keys(rows[0]).filter(c=>localSet.has(c));
    if(!cols.length)throw new Error("no common columns");
    const ph="("+cols.map(()=>"?").join(",")+")";const cs=cols.map(c=>"`"+c+"`").join(",");
    // Stringify JSON objects so MariaDB json_valid() checks pass (mysql2 auto-parses JSON columns)
    const norm=(v)=>v===null?null:Buffer.isBuffer(v)?v:(typeof v==="object"?JSON.stringify(v):v);
    for(let i=0;i<rows.length;i+=200){const sl=rows.slice(i,i+200);await local.query("INSERT INTO `"+t+"` ("+cs+") VALUES "+sl.map(()=>ph).join(","),sl.flatMap(r=>cols.map(c=>norm(r[c]))));}
    total+=rows.length;process.stdout.write("\r[SYNC] "+t+": "+rows.length+" rows   ");
    }catch(e){skipped++;console.log("\n[SYNC] SKIP "+t+": "+e.message.split("\n")[0]);}
  }
  await local.query("SET FOREIGN_KEY_CHECKS=1");
  console.log("\n[SYNC] done -> drop:"+dropT.length+" create:"+createT.length+" rows:"+total+" skipped:"+skipped);
  await cloud.end();await local.end();
})().catch(e=>{console.error("[SYNC] FAILED:",e.message);process.exit(1);});