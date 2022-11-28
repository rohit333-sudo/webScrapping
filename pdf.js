prepareFolderandPdfs(teams,args.dataDir);

function prepareFolderandPdfs(teams,dataDir)
{
 // if(fs.existsSync(dataDir)==false)
fs.mkdirSync(dataDir)


  for(let i=0;i<teams.length;i++)
  {
    let fn=path.join(dataDir,teams[i].name)
//    if(fs.existsSync(fn)==false)
    fs.mkdirSync(fn);
    for(let j=0;j<teams[i].matches.length;j++)
    {
      let match=teams[i].matches[j];
//      createpdf(fn,match);

    }
  }
}
function createpdf(fn,match)
{
  let filename=path.join(fn,match.vs+".pdf");
  fs.writeFileSync(filename,"","utf-8")
}
