 //node axious.js --dest=download.html --source=https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results 


let min=require("minimist");
 let axios=require("axios"); 
 let fs=require("fs");
 let args=min(process.argv);
 let download=axios.get(args.source);
 download.then(function(response){

let html=response.data;
fs.writeFileSync(args.dest,html,"utf-8");
console.log(html);

 }).catch(function(err){
     console.log(err);
 })
